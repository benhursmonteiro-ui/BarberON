'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Scissors, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';

export default function RoleSwitcherBar() {
  const { user, role, switchRole, logout } = useAuth();

  return (
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
      zIndex: 9999,
      position: 'sticky',
      top: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
          Simulador RBAC
        </span>
        <span style={{ color: '#94a3b8' }}>
          Conectado como: <strong style={{ color: '#f1f5f9' }}>{user?.name || 'Visitante'}</strong>
        </span>
        <span style={{
          background: role === 'admin' ? '#3b82f6' : role === 'barber' ? '#8b5cf6' : '#10b981',
          color: '#ffffff',
          fontSize: '0.68rem',
          fontWeight: 700,
          padding: '0.1rem 0.4rem',
          borderRadius: '999px',
          textTransform: 'uppercase'
        }}>
          {role}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Alternar Visão:</span>
        <button
          type="button"
          onClick={() => switchRole('admin')}
          style={{
            background: role === 'admin' ? '#3b82f6' : '#1e293b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Shield size={13} /> Admin
        </button>

        <button
          type="button"
          onClick={() => switchRole('barber')}
          style={{
            background: role === 'barber' ? '#8b5cf6' : '#1e293b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Scissors size={13} /> Barbeiro
        </button>

        <button
          type="button"
          onClick={() => switchRole('client')}
          style={{
            background: role === 'client' ? '#10b981' : '#1e293b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
        >
          <UserIcon size={13} /> Cliente
        </button>

        <button
          type="button"
          onClick={logout}
          title="Encerrar Sessão"
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <LogOut size={12} /> Sair
        </button>
      </div>
    </div>
  );
}
