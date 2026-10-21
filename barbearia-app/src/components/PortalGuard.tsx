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
  const { demoPlan, setDemoPlan } = useAuth();
  const isDemo = !shopSlug && !user?.barbershopId;

  return (
    <>
      <div style={{
        background: '#090d16',
        color: '#f8fafc',
        borderBottom: '1px solid #1e293b',
        padding: '0.45rem 1rem',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
      }}>
        {/* Left: Role and User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            background: '#d97706',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.65rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            DEMO INTERATIVA
          </span>
          <span style={{ color: '#94a3b8' }}>
            Usuário: <strong style={{ color: '#f1f5f9' }}>{user.name}</strong>
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

        {/* Center: FREE vs PRO Plan Selector */}
        {isDemo && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#1e293b',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid #334155',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => {
                setDemoPlan('FREE');
                const path = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client';
                router.push(`${path}?plan=FREE`);
              }}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: demoPlan === 'FREE' ? '#475569' : 'transparent',
                color: demoPlan === 'FREE' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
            >
              Versão Gratuita
            </button>
            <button
              type="button"
              onClick={() => {
                setDemoPlan('PRO');
                const path = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client';
                router.push(`${path}?plan=PRO`);
              }}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: demoPlan === 'PRO' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: demoPlan === 'PRO' ? '#ffffff' : '#fbbf24',
                boxShadow: demoPlan === 'PRO' ? '0 1px 4px rgba(217,119,6,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              💎 Versão Paga (PRO)
            </button>
          </div>
        )}

        {/* Right: Switch Role Buttons & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Ver Tela:</span>
          
          <button
            type="button"
            onClick={() => {
              if (role !== 'admin') {
                router.push(`/admin?plan=${demoPlan}`);
              }
            }}
            style={{
              background: role === 'admin' ? '#3b82f6' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              cursor: 'pointer',
              fontSize: '0.73rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => {
              if (role !== 'barber') {
                router.push(`/barber?plan=${demoPlan}`);
              }
            }}
            style={{
              background: role === 'barber' ? '#8b5cf6' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              cursor: 'pointer',
              fontSize: '0.73rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            Barbeiro
          </button>

          <button
            type="button"
            onClick={() => {
              if (role !== 'client') {
                router.push(`/client?plan=${demoPlan}`);
              }
            }}
            style={{
              background: role === 'client' ? '#10b981' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              cursor: 'pointer',
              fontSize: '0.73rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            Cliente
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: '0.25rem'
            }}
          >
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
