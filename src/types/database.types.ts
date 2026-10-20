export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'customer' | 'vendor' | 'admin';
export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type UnitOfMeasure = 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'pack' | 'bundle';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendor_stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          contact_email: string;
          contact_phone: string;
          address: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          status: StoreStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          contact_email: string;
          contact_phone: string;
          address?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          status?: StoreStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          contact_email?: string;
          contact_phone?: string;
          address?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          status?: StoreStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendor_service_areas: {
        Row: {
          id: string;
          vendor_id: string;
          city: string;
          state: string;
          zone_name: string;
          postal_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          city: string;
          state: string;
          zone_name: string;
          postal_code?: string | null;
          created_at?: string;
        };
        Update: {
          city?: string;
          state?: string;
          zone_name?: string;
          postal_code?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          vendor_id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          package_quantity: number;
          unit_of_measurement: UnitOfMeasure;
          stock_quantity: number;
          is_available: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          package_quantity: number;
          unit_of_measurement: UnitOfMeasure;
          stock_quantity?: number;
          is_available?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          package_quantity?: number;
          unit_of_measurement?: UnitOfMeasure;
          stock_quantity?: number;
          is_available?: boolean;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          is_primary?: boolean;
        };
        Relationships: [];
      };
      customer_orders: {
        Row: {
          id: string;
          customer_id: string;
          total_amount: number;
          currency: string;
          delivery_address: string;
          contact_phone: string;
          order_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          total_amount: number;
          currency?: string;
          delivery_address: string;
          contact_phone: string;
          order_notes?: string | null;
          created_at?: string;
        };
        Update: {
          total_amount?: number;
          delivery_address?: string;
          contact_phone?: string;
          order_notes?: string | null;
        };
        Relationships: [];
      };
      vendor_orders: {
        Row: {
          id: string;
          customer_order_id: string;
          vendor_id: string;
          subtotal: number;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_order_id: string;
          vendor_id: string;
          subtotal: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subtotal?: number;
          status?: OrderStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          vendor_order_id: string;
          product_id: string;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          package_quantity_snapshot: number;
          unit_snapshot: string;
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          vendor_order_id: string;
          product_id: string;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          package_quantity_snapshot: number;
          unit_snapshot: string;
          quantity: number;
          line_total: number;
        };
        Update: {
          quantity?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          vendor_order_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          changed_by: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_order_id: string;
          from_status?: OrderStatus | null;
          to_status: OrderStatus;
          changed_by: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          to_status?: OrderStatus;
          note?: string | null;
        };
        Relationships: [];
      };
      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          id: string;
          list_id: string;
          item_name: string;
          category_id: string | null;
          target_quantity: number;
          target_unit: UnitOfMeasure;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          item_name: string;
          category_id?: string | null;
          target_quantity?: number;
          target_unit?: UnitOfMeasure;
          created_at?: string;
        };
        Update: {
          item_name?: string;
          category_id?: string | null;
          target_quantity?: number;
          target_unit?: UnitOfMeasure;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_entity: string;
          target_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_entity: string;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          details?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      store_status: StoreStatus;
      unit_of_measure: UnitOfMeasure;
      order_status: OrderStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
