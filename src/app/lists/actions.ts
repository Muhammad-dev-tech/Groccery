'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createListSchema = z.object({
  title: z.string().trim().min(2, 'List title must be at least 2 characters').max(80),
});

const addItemSchema = z.object({
  listId: z.string().uuid(),
  itemName: z.string().trim().min(2, 'Item name must be at least 2 characters').max(100),
  categoryId: z.string().uuid().optional().nullable().or(z.literal('')),
  targetQuantity: z.coerce.number().min(0.1).default(1),
  targetUnit: z.enum(['kg', 'g', 'l', 'ml', 'piece', 'pack', 'bundle']).default('piece'),
});

export async function createShoppingListAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const raw = { title: formData.get('title') };
  const parsed = createListSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid title.' };
  }

  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Failed to create list. Please try again.' };
  }

  revalidatePath('/lists');
  return { success: true, listId: data.id };
}

export async function deleteShoppingListAction(listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Failed to delete shopping list.' };
  }

  revalidatePath('/lists');
  return { success: true };
}

export async function addShoppingListItemAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const raw = {
    listId: formData.get('listId'),
    itemName: formData.get('itemName'),
    categoryId: formData.get('categoryId') || null,
    targetQuantity: formData.get('targetQuantity'),
    targetUnit: formData.get('targetUnit'),
  };

  const parsed = addItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid item parameters.' };
  }

  const { listId, itemName, categoryId, targetQuantity, targetUnit } = parsed.data;

  // Verify list ownership
  const { data: list } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single();

  if (!list) {
    return { error: 'Shopping list not found or unauthorized.' };
  }

  const { error } = await supabase.from('shopping_list_items').insert({
    list_id: listId,
    item_name: itemName,
    category_id: categoryId || null,
    target_quantity: targetQuantity,
    target_unit: targetUnit as any,
  });

  if (error) {
    return { error: 'Failed to add item to list.' };
  }

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function removeShoppingListItemAction(itemId: string, listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  // Verify user owns list
  const { data: list } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single();

  if (!list) {
    return { error: 'Unauthorized.' };
  }

  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', itemId)
    .eq('list_id', listId);

  if (error) {
    return { error: 'Failed to remove item.' };
  }

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}
