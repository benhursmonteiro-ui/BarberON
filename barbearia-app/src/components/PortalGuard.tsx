'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { LogOut, Scissors } from 'lucide-react';

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  barber: '/barber',
  client: '/client',
};

const ROLE_LABEL: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Dono', color: '#3b82f6' },
  barber: { label: 'Barbeiro', color: '#8b5cf6' },
  client: { label: 'Cliente', color: '#10b981' },
};

/**
 * Protege uma área do sistema: só entra quem estiver logado com o perfil certo.
 * - Sem login -> vai para o login da barbearia (ou /login)
 * - Perfil errado -> vai para a área do próprio perfil
 */
export default function PortalGuard({
  allow,
  children,
}: {
  allow: UserRole;
  children: React.ReactNode;
}) {
  const { user, role, loading, shopSlug, logout, switchRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !role) {
      // Modo Demonstração Livre: se entrar direto em /admin, /barber ou /client sem login, ativa o perfil de demonstração
      switchRole(allow);
    } else if (role !== allow) {
      router.replace(ROLE_HOME[role]);
    }
  }, [loading, user, role, allow, router, switchRole]);

  if (loading || !user || role !== allow) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Scissors size={36} style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const info = ROLE_LABEL[role];

  return (
    <>
      <div style={{
        background: '#090d16',
        color: '#f8fafc',
        borderBottom: '1px solid #1e293b',
        padding: '0.5rem 1rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ color: '#94a3b8' }}>
            Conectado como <strong style={{ color: '#f1f5f9' }}>{user.name}</strong>
          </span>
          <span style={{
            background: info.color,
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '0.1rem 0.5rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
          }}>
            {info.label}
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '6px',
            padding: '0.3rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
      {children}
    </>
  );
}
