'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Barber, Service, WaitingQueueStatus } from '@/lib/types';
import { Check, Clock3, ExternalLink, LoaderCircle, Plus, Scissors, UserRound, X } from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  displayName: string;
  barberName: string;
  serviceName: string;
  status: WaitingQueueStatus;
  position: number;
  estimatedWaitMinutes: number;
  createdAt: string;
}

export default function WaitingRoomAdmin() {
  const { shopSlug, user } = useAuth();
  const shop = shopSlug || user?.barbershopId || 'imperial';
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const boardUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/b/${encodeURIComponent(shop)}/fila`;
  }, [shop]);

  const refreshQueue = useCallback(async () => {
    const response = await fetch(`/api/waiting-room?slug=${encodeURIComponent(shop)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a fila.');
    setQueue(Array.isArray(data) ? data : []);
    setError('');
  }, [shop]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [barberResponse, serviceResponse] = await Promise.all([
          fetch(`/api/barbers?slug=${encodeURIComponent(shop)}`),
          fetch(`/api/services?slug=${encodeURIComponent(shop)}`),
        ]);
        if (!barberResponse.ok || !serviceResponse.ok) {
          throw new Error('Não foi possível carregar barbeiros e serviços.');
        }
        const [barberData, serviceData] = await Promise.all([barberResponse.json(), serviceResponse.json()]);
        if (!active) return;
        const activeBarbers: Barber[] = Array.isArray(barberData) ? barberData : [];
        const activeServices: Service[] = Array.isArray(serviceData) ? serviceData : [];
        setBarbers(activeBarbers);
        setServices(activeServices);
        setBarberId((current) => current || activeBarbers[0]?.id || '');
        setServiceId((current) => current || activeServices[0]?.id || '');
        await refreshQueue();
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar a fila.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void refreshQueue().catch((refreshError: unknown) => {
        if (active) setError(refreshError instanceof Error ? refreshError.message : 'Erro ao atualizar a fila.');
      });
    }, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [refreshQueue, shop]);

  const addToQueue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await fetch('/api/waiting-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: shop, name, phone, barberId, serviceId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível adicionar à fila.');
      setName('');
      setPhone('');
      setNotice('Cliente adicionado à fila.');
      await refreshQueue();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao adicionar cliente.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: WaitingQueueStatus) => {
    setError('');
    try {
      const response = await fetch('/api/waiting-room', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, slug: shop }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o atendimento.');
      await refreshQueue();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Erro ao atualizar atendimento.');
    }
  };

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1rem', color: '#0f172a' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <Link href="/admin" style={{ color: '#b45309', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Voltar ao painel</Link>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Fila de espera</h1>
          <p style={{ margin: '0.4rem 0 0', color: '#64748b' }}>Atendimentos presenciais, em ordem de chegada. Atualização automática a cada 8 segundos.</p>
        </div>
        {boardUrl && (
          <a href={boardUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
            <ExternalLink size={16} /> Abrir painel do salão
          </a>
        )}
      </header>

      {error && <p role="alert" style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 8 }}>{error}</p>}
      {notice && <p role="status" style={{ padding: 12, background: '#ecfdf5', color: '#047857', borderRadius: 8 }}>{notice}</p>}

      <form onSubmit={addToQueue} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, padding: 18, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 24 }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>Nome do cliente
          <input required value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>WhatsApp/telefone
          <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>Barbeiro
          <select required value={barberId} onChange={(event) => setBarberId(event.target.value)} style={inputStyle}>
            {barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>Serviço
          <select required value={serviceId} onChange={(event) => setServiceId(event.target.value)} style={inputStyle}>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} ({service.durationMinutes || service.duration} min)</option>)}
          </select>
        </label>
        <button type="submit" disabled={saving || !barbers.length || !services.length} style={{ alignSelf: 'end', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 11, border: 0, borderRadius: 8, background: '#d97706', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? <LoaderCircle size={16} /> : <Plus size={16} />} Adicionar à fila
        </button>
      </form>

      <section style={{ display: 'grid', gap: 12 }}>
        {loading ? <p>Carregando fila...</p> : queue.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#64748b' }}>Não há clientes aguardando no momento.</div>
        ) : queue.map((item) => (
          <article key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: '50%', background: item.status === 'em_atendimento' ? '#dcfce7' : '#fef3c7' }}>
                {item.status === 'em_atendimento' ? <Scissors size={19} color="#15803d" /> : <UserRound size={19} color="#b45309" />}
              </span>
              <div>
                <strong>{item.displayName}</strong>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{item.serviceName} · {item.barberName}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>
                  {item.status === 'em_atendimento' ? 'Em atendimento' : `Posição ${item.position} · espera estimada: ${item.estimatedWaitMinutes} min`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {item.status === 'aguardando' && <button type="button" onClick={() => void changeStatus(item.id, 'em_atendimento')} style={actionStyle('#15803d')}><Scissors size={15} /> Iniciar</button>}
              {item.status === 'em_atendimento' && <button type="button" onClick={() => void changeStatus(item.id, 'concluido')} style={actionStyle('#2563eb')}><Check size={15} /> Concluir</button>}
              <button type="button" onClick={() => void changeStatus(item.id, 'cancelado')} aria-label={`Cancelar fila de ${item.displayName}`} style={actionStyle('#b91c1c')}><X size={15} /> Cancelar</button>
            </div>
          </article>
        ))}
      </section>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginTop: 18 }}><Clock3 size={14} /> A estimativa considera a duração cadastrada de cada serviço e o atendimento em andamento.</p>
    </main>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box' as const, minHeight: 40, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff' };
const actionStyle = (color: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', border: 0, borderRadius: 7, background: color, color: '#fff', fontWeight: 700, cursor: 'pointer' });
