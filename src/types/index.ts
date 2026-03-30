export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  stock: number;
  is_featured: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  payment_method?: string;
  order_status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  shipping_phone?: string;
  shipping_address?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  image_url?: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: number;
  user_id?: number | null;
  is_admin?: number;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
