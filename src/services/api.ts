import type { ApiResponse, AuthResponse, User, Product, CartItem, Order, Message } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.fetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response as AuthResponse;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.fetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response as AuthResponse;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.fetch('/auth/profile');
  }

  async updateProfile(name: string, email: string, phone?: string, address?: string): Promise<ApiResponse<{ user: User }>> {
    return this.fetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email, phone, address })
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.fetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // Products
  async getProducts(category?: string, featured?: boolean): Promise<ApiResponse<{ products: Product[] }>> {
    let endpoint = '/products';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured) params.append('featured', 'true');
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return this.fetch(endpoint);
  }

  async getProduct(id: number): Promise<ApiResponse<{ product: Product }>> {
    return this.fetch(`/products/${id}`);
  }

  async createProduct(productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    return this.fetch('/products', {
      method: 'POST',
      body: productData as unknown as string,
      headers: {} // Let browser set content-type for FormData
    });
  }

  async updateProduct(id: number, productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    return this.fetch(`/products/${id}`, {
      method: 'PUT',
      body: productData as unknown as string,
      headers: {}
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.fetch(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.fetch('/products/categories');
  }

  // Cart
  async getCart(): Promise<ApiResponse<{ items: CartItem[]; total: number }>> {
    return this.fetch('/cart');
  }

  async addToCart(productId: number, quantity: number = 1): Promise<ApiResponse<{ items: CartItem[]; total: number }>> {
    return this.fetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  async updateCartQuantity(productId: number, quantity: number): Promise<ApiResponse<{ items: CartItem[]; total: number }>> {
    return this.fetch('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  async removeFromCart(productId: number): Promise<ApiResponse<{ items: CartItem[]; total: number }>> {
    return this.fetch('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ product_id: productId })
    });
  }

  async clearCart(): Promise<ApiResponse<{ items: CartItem[]; total: number }>> {
    return this.fetch('/cart/clear', {
      method: 'DELETE'
    });
  }

  // Orders
  async createOrder(paymentMethod: string, shippingPhone: string, shippingAddress: string): Promise<ApiResponse<{ order: Order; payment: unknown }>> {
    return this.fetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ 
        payment_method: paymentMethod,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress
      })
    });
  }

  async getUserOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
    return this.fetch('/orders/my-orders');
  }

  async getOrder(id: number): Promise<ApiResponse<{ order: Order }>> {
    return this.fetch(`/orders/${id}`);
  }

  async getAllOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
    return this.fetch('/orders');
  }

  async updateOrderStatus(id: number, paymentStatus?: string, orderStatus?: string): Promise<ApiResponse<{ order: Order }>> {
    return this.fetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: paymentStatus, order_status: orderStatus })
    });
  }

  async getOrderStatistics(): Promise<ApiResponse<{ total_sales: number; total_orders: number; pending_orders: number; today_sales: number }>> {
    return this.fetch('/orders/statistics');
  }

  // Messages
  async sendMessage(name: string, email: string, message: string): Promise<ApiResponse<{ message: Message }>> {
    return this.fetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ name, email, message })
    });
  }

  async getMessages(): Promise<ApiResponse<{ messages: Message[] }>> {
    return this.fetch('/messages');
  }

  async getUnreadMessages(): Promise<ApiResponse<{ messages: Message[]; unread_count: number }>> {
    return this.fetch('/messages/unread');
  }

  async markMessageAsRead(id: number): Promise<ApiResponse<void>> {
    return this.fetch(`/messages/${id}/read`, {
      method: 'PUT'
    });
  }

  async deleteMessage(id: number): Promise<ApiResponse<void>> {
    return this.fetch(`/messages/${id}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
