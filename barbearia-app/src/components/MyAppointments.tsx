'use client';

import React, { useState } from 'react';
import { Appointment } from '@/lib/types';
import { Calendar, Clock, Scissors, User, Search, AlertCircle, XCircle } from 'lucide-react';

interface MyAppointmentsProps {
  slug?: string;
}

export default function MyAppointments({ slug }: MyAppointmentsProps) {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const query = slug ? `&slug=${encodeURIComponent(slug)}` : '';
      const res = await fetch(`/api/appointments?customerPhone=${encodeURIComponent(phone.trim())}${query}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelado' } : a))
        );
        showToast('Agendamento cancelado com sucesso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar agendamento.');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const formatDateBR = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Consultar Meus Agendamentos</h2>
        <p className="section-desc">
          Digite seu número de WhatsApp para ver o histórico e os horários reservados na barbearia.
        </p>
      </div>

      <div style={{ maxWidth: '540px', marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="tel"
            className="custom-input"
            placeholder="Digite seu WhatsApp (ex: 11988887777)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            <Search size={18} /> {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Procurando seus agendamentos...</div>}

      {searched && !loading && appointments.length === 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <AlertCircle size={44} style={{ margin: '0 auto 1rem auto', color: 'var(--text-light)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Nenhum agendamento encontrado
          </h3>
          <p>Não localizamos nenhum horário vinculado ao número informado ({phone}).</p>
        </div>
      )}

      {appointments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {appointments.map((apt) => (
            <div
              key={apt.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge-status ${apt.status}`}>{apt.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                    #{apt.id.slice(-5).toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {apt.serviceName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} /> Barbeiro: <strong style={{ color: 'var(--text-main)' }}>{apt.barberName}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} /> Data: <strong style={{ color: 'var(--text-main)' }}>{formatDateBR(apt.date)}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> Horário: <strong style={{ color: 'var(--text-main)' }}>{apt.time}</strong>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                  {formatCurrency(apt.totalAmount ?? apt.price ?? 0)}
                </span>

                {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(apt.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--danger)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <XCircle size={16} /> Cancelar Horário
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toastMsg && <div className="toast-notice">{toastMsg}</div>}
    </div>
  );
}
