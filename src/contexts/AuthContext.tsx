import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';
import type { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check for existing token on mount
    const token = api.getToken();
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        api.clearToken();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      api.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Login berhasil!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.register(name, email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Registrasi berhasil!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal');
      return false;
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    toast.success('Logout berhasil');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
