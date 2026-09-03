'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isCustom: boolean;
  preDesignedId?: string;
  customSpec?: Record<string, any>;
  fabric?: string;
  color?: string;
  tailorId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'TAILOR' | 'DESIGNER' | 'ADMIN';
}

interface AppContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  user: AuthUser | null;
  token: string | null;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vt_cart');
      const savedUser = localStorage.getItem('vt_user');
      const savedToken = localStorage.getItem('vt_token');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedToken) setToken(savedToken);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('vt_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const login = (userData: AuthUser, tok: string) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem('vt_user', JSON.stringify(userData));
    localStorage.setItem('vt_token', tok);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vt_user');
    localStorage.removeItem('vt_token');
    clearCart();
  };

  return (
    <AppContext.Provider value={{
      cart,
      cartCount: cart.reduce((s, i) => s + i.quantity, 0),
      cartTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      addToCart, removeFromCart, clearCart,
      user, token, login, logout, isLoggedIn: !!user,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
