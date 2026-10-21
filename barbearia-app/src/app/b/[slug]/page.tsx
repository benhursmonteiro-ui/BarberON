'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BookingFlow from '@/components/BookingFlow';
import MyAppointments from '@/components/MyAppointments';
import { Scissors, Calendar, UserCheck, AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function BarbershopTenantPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'imperial';

  const [barbershop, setBarbershop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'booking' | 'my-appointments'>('booking');

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        const res = await fetch(`/api/barbershops/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setBarbershop(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Scissors size={36} className="status-dot" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Carregando barbearia...</p>
        </div>
      </div>
    );
  }

  if (error || !barbershop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Barbearia não encontrada</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            O link informado (<code>/b/{slug}</code>) não corresponde a nenhuma barbearia ativa no sistema BarberOn.
          </p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Scissors size={24} />
            </div>
            <div className="brand-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="brand-title">{barbershop.name}</span>
                <span style={{
                  background: barbershop.plan === 'PRO' ? 'var(--accent-gold-light)' : '#f1f5f9',
                  color: barbershop.plan === 'PRO' ? 'var(--accent-gold-text)' : '#0f172a',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}>
                  {barbershop.plan}
                </span>
              </div>
              <span className="brand-subtitle">{barbershop.address}</span>
            </div>
          </div>

          {/* Navigation Switcher */}
          <nav className="nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'booking' ? 'active' : ''}`}
              onClick={() => setActiveTab('booking')}
            >
              <Calendar size={17} /> Agendar Horário
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'my-appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-appointments')}
            >
              <UserCheck size={17} /> Meus Agendamentos
            </button>
          </nav>

          <div className="header-badge">
            <span className="status-dot" /> Aberto Hoje
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper" style={{ flex: 1 }}>
        {activeTab === 'booking' && (
          <BookingFlow slug={slug} onBookingSuccess={() => {}} />
        )}

        {activeTab === 'my-appointments' && (
          <MyAppointments slug={slug} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '1.75rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong>{barbershop.name}</strong> • {barbershop.address}
          </div>
          <div>
            Powered by <strong>BarberOn SaaS</strong> • WhatsApp: {barbershop.ownerPhone || '(11) 98888-7777'} •{' '}
            <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Crie a sua barbearia
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
