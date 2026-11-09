'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock3, Scissors } from 'lucide-react';

interface PublicQueueItem {
  id: string;
  displayName: string;
  barberName: string;
  serviceName: string;
  status: 'aguardando' | 'em_atendimento';
  position: number;
  estimatedWaitMinutes: number;
}

export default function WaitingRoomBoard() {
  const { slug } = useParams<{ slug: string }>();
  const [queue, setQueue] = useState<PublicQueueItem[]>([]);
  const [error, setError] = useState('');
  const loadQueue = useCallback(async () => {
    const response = await fetch(`/api/waiting-room?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar a fila.');
    setQueue(Array.isArray(data) ? data : []);
    setError('');
  }, [slug]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void loadQueue().catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Erro ao atualizar a fila.');
      });
    };
    refresh();
    const interval = window.setInterval(refresh, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loadQueue]);

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(20px, 5vw, 56px)', background: '#090d16', color: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ maxWidth: 1050, margin: '0 auto 28px' }}>
        <p style={{ margin: 0, color: '#fbbf24', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>BarberON · Painel do salão</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', margin: '10px 0' }}>Fila de atendimento</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Acompanhe a ordem e a previsão de atendimento. Atualização automática a cada 8 segundos.</p>
      </header>
      <section style={{ maxWidth: 1050, margin: '0 auto', display: 'grid', gap: 12 }}>
        {error && <p role="alert" style={{ color: '#fecaca' }}>{error}</p>}
        {!error && queue.length === 0 && <div style={cardStyle}>No momento, não há clientes aguardando.</div>}
        {queue.map((item) => (
          <article key={item.id} style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'minmax(90px, 0.6fr) 2fr 1fr', alignItems: 'center', gap: 14 }}>
            <div style={{ color: item.status === 'em_atendimento' ? '#86efac' : '#fbbf24', fontSize: '1.1rem', fontWeight: 800 }}>
              {item.status === 'em_atendimento' ? 'AGORA' : `#${item.position}`}
            </div>
            <div>
              <strong style={{ fontSize: '1.2rem' }}>{item.displayName}</strong>
              <div style={{ color: '#94a3b8', marginTop: 5 }}>{item.serviceName} · {item.barberName}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 7, color: '#cbd5e1', fontWeight: 700 }}>
              {item.status === 'em_atendimento'
                ? <><Scissors size={17} /> Em atendimento</>
                : <><Clock3 size={17} /> aprox. {item.estimatedWaitMinutes} min</>}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const cardStyle = { padding: 'clamp(16px, 3vw, 24px)', border: '1px solid #263244', borderRadius: 14, background: '#111827' };
