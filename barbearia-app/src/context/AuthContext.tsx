'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  shopSlug: string | null;
  login: (email: string, password: string, slug?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (slug?: string) => Promise<{ success: boolean; error?: string }>;
  registerClient: (data: { name: string; email: string; password: string; phone: string; slug?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole, slug?: string) => Promise<void>;
  demoPlan: 'FREE' | 'PRO';
  setDemoPlan: (plan: 'FREE' | 'PRO') => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr-admin-1',
    name: 'Marcos Silva (Admin / Dono)',
    email: 'admin@barbearia.com',
    password_hash: 'admin123',
    role: 'admin',
    phone: '11988887777',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  barber: {
    id: 'usr-barber-1',
    name: 'Lucas Andrade (Barbeiro)',
    email: 'lucas@barbearia.com',
    password_hash: 'barber123',
    role: 'barber',
    phone: '11988882222',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
  client: {
    id: 'usr-client-1',
    name: 'Rodrigo Santoro (Cliente)',
    email: 'rodrigo@cliente.com',
    password_hash: 'cliente123',
    role: 'client',
    phone: '11999991111',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    blocked: false,
    createdAt: new Date().toISOString(),
  },
};

const SESSION_KEY = 'barberon_user_session';
const SHOP_KEY = 'barberon_shop_slug';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoPlan, setDemoPlanState] = useState<'FREE' | 'PRO'>('PRO');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Carrega a sessão salva. Sem sessão = ninguém logado (cada perfil entra pelo seu login).
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
      setShopSlug(localStorage.getItem(SHOP_KEY));
      const savedDemoPlan = localStorage.getItem('barberon_demo_plan') as 'FREE' | 'PRO';
      if (savedDemoPlan === 'FREE' || savedDemoPlan === 'PRO') {
        setDemoPlanState(savedDemoPlan);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setDemoPlan = (plan: 'FREE' | 'PRO') => {
    setDemoPlanState(plan);
    try {
      localStorage.setItem('barberon_demo_plan', plan);
    } catch {}
  };

  // Salva a sessão e redireciona cada perfil para a sua própria área
  const startSession = (u: User, slug?: string) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    const activeSlug = slug || (u as any).shopSlug;
    if (activeSlug) {
      setShopSlug(activeSlug);
      localStorage.setItem(SHOP_KEY, activeSlug);
    }

    if (u.role === 'admin') router.push('/admin');
    else if (u.role === 'barber') router.push('/barber');
    else router.push('/client');
  };

  const login = async (email: string, password: string, slug?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return { success: false, error: data.error || 'Credenciais inválidas.' };
      }

      startSession(data.user, slug);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao conectar ao servidor.' };
    }
  };

  const loginWithGoogle = async (slug?: string): Promise<{ success: boolean; error?: string }> => {
    // Mock login social com o cliente Rodrigo Santoro
    startSession(PRESET_USERS.client, slug);
    return { success: true };
  };

  const registerClient = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    slug?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const respData = await res.json();
      if (!res.ok || !respData.user) {
        return { success: false, error: respData.error || 'Erro ao realizar cadastro.' };
      }

      startSession(respData.user, data.slug);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao conectar ao servidor para cadastro.' };
    }
  };

  const logout = () => {
    const slug = localStorage.getItem(SHOP_KEY);
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Volta para o login próprio da barbearia (se houver)
    router.push(slug ? `/b/${slug}/login` : '/login');
  };

  const switchRole = async (newRole: UserRole, slug?: string) => {
    startSession(PRESET_USERS[newRole], slug);
  };

  const resetPassword = async (email: string) => {
    return {
      success: true,
      message: `Link seguro de redefinição de senha enviado para ${email}.`,
    };
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('barberon_user_session', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        shopSlug,
        login,
        loginWithGoogle,
        registerClient,
        logout,
        switchRole,
        demoPlan,
        setDemoPlan,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
