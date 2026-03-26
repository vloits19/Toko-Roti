import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';
import type { CartItem } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setTotal(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCart();
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.addToCart(productId, quantity);
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotal(response.data.total);
        toast.success('Produk ditambahkan ke keranjang');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const response = await api.updateCartQuantity(productId, quantity);
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setIsLoading(true);
      const response = await api.removeFromCart(productId);
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotal(response.data.total);
        toast.success('Produk dihapus dari keranjang');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus dari keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.clearCart();
      if (response.success && response.data) {
        setItems(response.data.items);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengosongkan keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{
      items,
      total,
      itemCount,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
