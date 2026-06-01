export type UserRole = 'customer' | 'admin';
export type ProductCategory = 'cow' | 'goat' | 'fish' | 'chicken';
export type OrderStatus = 'pending' | 'approved' | 'delivered' | 'cancelled';

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  role: UserRole;
  push_token: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  name_en: string;
  name_rw: string;
  description: string;
  price_per_kg: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity_kg: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  delivery_minutes: number;
  customer_phone: string;
  customer_name: string;
  customer_address: string;
  payment_proof_url: string | null;
  whatsapp_notified: boolean;
  created_at: string;
  approved_at: string | null;
}

export interface NewProduct {
  category: ProductCategory;
  name_en: string;
  name_rw: string;
  description: string;
  price_per_kg: number;
  image_url: string;
  is_available?: boolean;
}

export interface NewOrder {
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  customer_phone: string;
  customer_name: string;
  customer_address: string;
  status?: OrderStatus;
  delivery_minutes?: number;
}
