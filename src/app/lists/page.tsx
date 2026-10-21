import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ClipboardList,
  Plus,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { CreateListForm } from '@/components/lists/CreateListForm';

export const metadata = {
  title: 'Smart Shopping Lists — FreshGrocer',
  description: 'Manage shopping lists and compare total basket cost across multiple grocery stores.',
};

export default async function ShoppingListsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/lists');
  }

  const { data: lists } = await supabase
    .from('shopping_lists')
    .select(`
      id,
      title,
      created_at,
      items:shopping_list_items(id)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allLists = lists || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Smart Shopping Lists
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Build your recurring grocery lists and calculate total basket costs across independent
            stores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create New List */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 sticky top-24 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Create New List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateListForm />
            </CardContent>
          </Card>
        </div>

        {/* Right: Existing Lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Your Lists ({allLists.length})
            </h2>
          </div>

          {allLists.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-3">
              <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Shopping Lists Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a list (e.g. &quot;Weekly Staples&quot; or &quot;Pantry Essentials&quot;) to compare costs and find
                the optimal basket split across local stores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allLists.map((l) => {
                const count = (l.items as any[])?.length || 0;
                return (
                  <Card
                    key={l.id}
                    className="border-slate-200/90 hover:border-brand-300 transition-smooth group shadow-2xs"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                          {l.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {count} item{count === 1 ? '' : 's'} saved
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link href={`/lists/${l.id}`} className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between group-hover:border-brand-500 group-hover:text-brand-600"
                          >
                            <span className="flex items-center gap-1.5">
                              <TrendingDown className="w-3.5 h-3.5 text-brand-600" />
                              <span>Cost Analysis & Items</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
