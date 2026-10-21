'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Scissors, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter, 
  ShieldCheck, 
  Phone, 
  Lock, 
  Unlock,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  CalendarDays,
  Trash2,
  Plus,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BarberPortalPage() {
  const { user, role, shopSlug, demoPlan, setDemoPlan } = useAuth();
  const searchParams = useSearchParams();
  const urlPlan = searchParams.get('plan') as 'PRO' | 'FREE' | null;

  useEffect(() => {
    if (urlPlan === 'PRO' || urlPlan === 'FREE') {
      setPreviewPlan(urlPlan);
      setDemoPlan(urlPlan);
    }
  }, [urlPlan, setDemoPlan]);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'schedule' | 'commissions' | 'history' | 'availability' | 'reviews' | 'profile'
  >('dashboard');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [scheduleAppointments, setScheduleAppointments] = useState<any[]>([]);
  const [commissionsData, setCommissionsData] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Shop config & plan preview toggle
  const [shopConfig, setShopConfig] = useState<any>(null);
  const [previewPlan, setPreviewPlan] = useState<'PRO' | 'FREE' | null>(null);
  const isDemo = !shopSlug && !user?.barbershopId;
  const currentPlan = isDemo 
    ? (urlPlan || previewPlan || demoPlan || 'FREE') 
    : (shopConfig?.plan || (user as any)?.plan || 'FREE');
  const isPro = currentPlan === 'PRO';

  // V2 Schedule Management States (matching Admin)
  const [scheduleViewMode, setScheduleViewMode] = useState<'grade' | 'calendario' | 'regras'>('grade');
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduleCustomSlots, setScheduleCustomSlots] = useState<Record<string, 'LIVRE' | 'BLOQUEADO' | 'EXTRA'>>({
    'terca-09:00': 'BLOQUEADO',
    'terca-09:30': 'BLOQUEADO',
    'quinta-08:30': 'BLOQUEADO',
    'sexta-09:30': 'BLOQUEADO',
    'sabado-11:00': 'BLOQUEADO',
  });
  const [scheduleDayClosures, setScheduleDayClosures] = useState<Record<string, boolean>>({
    segunda: true,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: true,
  });
  const [scheduleBookedSlots, setScheduleBookedSlots] = useState<Record<string, string>>({
    'sexta-08:00': 'LUIZIMARA DE SOUSA LACERDA',
    'sexta-11:00': 'LUIZIMARA DE SOUSA LACERDA',
    'sabado-08:00': 'ARONE BORGES DE MEDEIROS',
    'sabado-08:30': 'ARONE BORGES DE MEDEIROS',
    'terca-10:00': 'ARLAN CÉSAR DO NASCIMENTO',
    'terca-10:30': 'ARLAN CÉSAR DO NASCIMENTO',
    'terca-11:00': 'ARLAN CÉSAR DO NASCIMENTO',
    'quarta-10:30': 'FELIPE DA SILVA COSTA',
    'quarta-11:00': 'FELIPE DA SILVA COSTA',
  });
  const [scheduleSaveToast, setScheduleSaveToast] = useState<string | null>(null);

  // Time slot blocking input (Free fallback)
  const [slotToBlock, setSlotToBlock] = useState('15:00');
  const [holidayToBlock, setHolidayToBlock] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadBarberData();
  }, [user]);

  // If on free plan and user was on availability or reviews tab, redirect to dashboard
  useEffect(() => {
    if (!isPro && (activeTab === 'availability' || activeTab === 'reviews')) {
      setActiveTab('dashboard');
    }
  }, [isPro, activeTab]);

  const loadBarberData = async () => {
    try {
      setLoading(true);
      const activeShopParam = shopSlug ? `slug=${encodeURIComponent(shopSlug)}` : (user?.barbershopId ? `shopId=${encodeURIComponent(user.barbershopId)}` : '');
      const shopQuery = activeShopParam ? `&${activeShopParam}` : '';
      const shopQueryOnly = activeShopParam ? `?${activeShopParam}` : '';

      const res = await fetch(`/api/barber/dashboard?userId=${user?.id || 'usr-barber-1'}${shopQuery}`);
      const data = await res.json();
      setDashboardData(data);

      if (data.barber) {
        setProfileForm({
          name: data.barber.name || '',
          specialty: data.barber.specialty || '',
          phone: data.barber.phone || '',
          email: data.barber.email || '',
        });

        // Load schedule, commissions, and shopConfig
        const [schRes, commRes, revRes, cfgRes] = await Promise.all([
          fetch(`/api/barber/schedule?barberId=${data.barber.id}&date=${selectedDate}`),
          fetch(`/api/barber/commissions?barberId=${data.barber.id}`),
          fetch(`/api/client/reviews?barberId=${data.barber.id}`),
          fetch(`/api/admin/shop-config${shopQueryOnly}`).catch(() => null),
        ]);

        const [sch, comm, revs, cfg] = await Promise.all([
          schRes.json(),
          commRes.json(),
          revRes.json(),
          cfgRes ? cfgRes.json().catch(() => null) : null,
        ]);

        setScheduleAppointments(Array.isArray(sch) ? sch : []);
        setCommissionsData(comm);
        setReviewsList(Array.isArray(revs) ? revs : []);
        if (cfg) setShopConfig(cfg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Status transitions: "em atendimento", "concluido", "cancelado"
  const handleAdvanceStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/barber/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        loadBarberData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle slot block
  const handleToggleSlotBlock = async (slot: string) => {
    if (!dashboardData?.barber?.id) return;
    try {
      const res = await fetch('/api/barber/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: dashboardData.barber.id,
          slot,
          action: 'toggle_slot',
        }),
      });
      if (res.ok) {
        loadBarberData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle holiday
  const handleToggleHoliday = async (holiday: string) => {
    if (!dashboardData?.barber?.id || !holiday) return;
    try {
      const res = await fetch('/api/barber/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: dashboardData.barber.id,
          holiday,
          action: 'toggle_holiday',
        }),
      });
      if (res.ok) {
        setHolidayToBlock('');
        loadBarberData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData?.barber?.id) return;
    try {
      const res = await fetch(`/api/admin/barbers/${dashboardData.barber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        alert('Perfil atualizado com sucesso!');
        loadBarberData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const barber = dashboardData?.barber;
  const todayApts = dashboardData?.todayAppointments || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Sidebar do Barbeiro */}
      <aside style={{
        width: '260px',
        background: '#111827',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1f2937',
        flexShrink: 0
      }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Scissors size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.2 }}>
                {barber?.name || 'Portal do Barbeiro'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {barber?.specialty || 'Profissional'}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'dashboard', label: '1. Meu Dashboard', icon: TrendingUp },
            { id: 'schedule', label: '2. Agenda do Dia', icon: Calendar },
            { id: 'commissions', label: '3. Extrato de Comissões', icon: DollarSign },
            { id: 'history', label: '4. Meus Clientes Atendidos', icon: User },
            ...(isPro ? [
              { id: 'availability', label: '5. Bloqueio de Horários/Folgas', icon: Clock },
              { id: 'reviews', label: '6. Minhas Avaliações', icon: Star },
            ] : []),
            { id: 'profile', label: isPro ? '7. Meu Perfil Profissional' : '5. Meu Perfil Profissional', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: active ? '#8b5cf6' : 'transparent',
                  color: active ? '#ffffff' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #1f2937' }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Sua taxa de comissão:</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>
            {barber?.commission || 50}% por corte
          </div>
        </div>
      </aside>

      {/* Main Barbeiro */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              {activeTab === 'dashboard' && 'Visão Geral & Desempenho'}
              {activeTab === 'schedule' && 'Atendimentos de Hoje'}
              {activeTab === 'commissions' && 'Extrato Detalhado de Comissões'}
              {activeTab === 'history' && 'Histórico de Clientes Atendidos'}
              {activeTab === 'availability' && 'Gestão de Folgas e Bloqueios Pontuais'}
              {activeTab === 'reviews' && 'Feedbacks e Avaliações Recebidas'}
              {activeTab === 'profile' && 'Perfil e Especialidades'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
              Ambiente de trabalho dedicado ao profissional da barbearia.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Visualizador de Versão / Plano */}
            {isDemo ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f5f9',
                padding: '0.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}>
                <button
                  type="button"
                  onClick={() => setPreviewPlan('FREE')}
                  style={{
                    background: !isPro ? '#ffffff' : 'transparent',
                    color: !isPro ? '#0f172a' : '#64748b',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: !isPro ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  VERSÃO GRATUITA
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlan('PRO')}
                  style={{
                    background: isPro ? '#d97706' : 'transparent',
                    color: isPro ? '#ffffff' : '#64748b',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: isPro ? '0 1px 4px rgba(217, 119, 6, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  VERSÃO PAGA (PRO)
                </button>
              </div>
            ) : (
              <span style={{
                background: isPro ? '#fef3c7' : '#f1f5f9',
                color: isPro ? '#92400e' : '#0f172a',
                border: isPro ? '1px solid #fde68a' : '1px solid #cbd5e1',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                PLANO {isPro ? 'PRO' : 'FREE'}
              </span>
            )}

            <button
              type="button"
              onClick={loadBarberData}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Atualizar
            </button>
          </div>
        </header>

        <div style={{ padding: '2rem', flex: 1 }}>
          {/* 1. DASHBOARD DO BARBEIRO */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Atendimentos de Hoje</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.35rem' }}>
                    {todayApts.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {todayApts.filter((a: any) => a.status === 'concluido').length} concluídos
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Comissão Acumulada no Mês</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
                    {formatCurrency(dashboardData?.monthCommissions || 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {dashboardData?.monthCompletedCount || 0} cortes finalizados
                  </div>
                </div>

                {isPro && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Média de Avaliações</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
                      ★ {barber?.rating || 5.0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Baseado em {barber?.reviews || 0} clientes
                    </div>
                  </div>
                )}
              </div>

              {/* Lista dos atendimentos do dia */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.1rem' }}>
                  Agenda Cronológica de Hoje ({todayApts.length})
                </h3>

                {todayApts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Você não tem cortes agendados para hoje ainda.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {todayApts.map((apt: any) => (
                      <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                            {apt.time} - {apt.clientName}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {apt.serviceName} • {formatCurrency(apt.price)} (Sua comissão: {formatCurrency(apt.commission)})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                            Tel: {apt.clientPhone}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f3f4f6' }}>
                            {apt.status.toUpperCase()}
                          </span>

                          {apt.status !== 'concluido' && apt.status !== 'cancelado' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(apt.id, 'em atendimento')}
                                style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Iniciar Corte
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(apt.id, 'concluido')}
                                style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Concluir Corte
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(apt.id, 'cancelado')}
                                style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. AGENDA DE ATENDIMENTOS */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Selecionar Data:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.1rem' }}>
                  Atendimentos para {selectedDate} ({scheduleAppointments.length})
                </h3>

                {scheduleAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    Nenhum atendimento marcado para este dia.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {scheduleAppointments.map((apt) => (
                      <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{apt.time} - {apt.clientName}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {apt.serviceName} • {formatCurrency(apt.price)} (Comissão automática: {formatCurrency(apt.commission)})
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f3f4f6' }}>
                            {apt.status.toUpperCase()}
                          </span>
                          {apt.status !== 'concluido' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(apt.id, 'concluido')}
                              style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Finalizar & Computar Comissão
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. EXTRATO DE COMISSÕES */}
          {activeTab === 'commissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Extrato Financeiro de Comissões</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Conferência oficial de todos os cortes concluídos e seus valores líquidos.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(commissionsData?.totalCommissionsEarned || 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Líquido acumulado recebido</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '0.75rem' }}>Data & Hora</th>
                      <th style={{ padding: '0.75rem' }}>Cliente</th>
                      <th style={{ padding: '0.75rem' }}>Serviço Realizado</th>
                      <th style={{ padding: '0.75rem' }}>Valor do Corte</th>
                      <th style={{ padding: '0.75rem' }}>% Comissão</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Valor Líquido Barbeiro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionsData?.statement?.map((st: any) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem' }}>{st.date} às {st.time}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{st.clientName}</td>
                        <td style={{ padding: '0.75rem' }}>{st.serviceName}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{formatCurrency(st.servicePrice)}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{st.commissionPercentage}%</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                          {formatCurrency(st.commissionEarned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. HISTÓRICO PESSOAL */}
          {activeTab === 'history' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
                Clientes Já Atendidos por Você ({commissionsData?.statement?.length || 0})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {commissionsData?.statement?.map((st: any) => (
                  <div key={st.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{st.clientName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Tel: {st.clientPhone}</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
                      Corte: <strong>{st.serviceName}</strong> em {st.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. GESTÃO DE HORÁRIOS & FOLGAS DO BARBEIRO */}
          {activeTab === 'availability' && !isPro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    textTransform: 'uppercase'
                  }}>
                    Plano Gratuito
                  </span>
                  <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                    Bloqueio simplificado de horários e folgas.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPlan('PRO')}
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Conhecer Grade V2 (PRO)
                </button>
              </div>

              {/* Bloqueio Pontual Simples */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                  Bloquear Horário Pontual na Sua Grade
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.84rem' }}>
                  Utilize esta opção para bloquear horários em que não poderá atender (ex: consulta médica, intervalo estendido).
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="time"
                    value={slotToBlock}
                    onChange={(e) => setSlotToBlock(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleSlotBlock(slotToBlock)}
                    style={{ background: '#8b5cf6', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Bloquear / Alternar Horário
                  </button>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Seus Horários Bloqueados Atualmente:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(barber?.blockedSlots || []).length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Nenhum horário bloqueado</span>
                  ) : (
                    barber.blockedSlots.map((slot: string) => (
                      <span
                        key={slot}
                        onClick={() => handleToggleSlotBlock(slot)}
                        title="Clique para desbloquear"
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {slot} ✕
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Folga de Dia Inteiro */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                  Marcar Dia Inteiro de Folga
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.84rem' }}>
                  Selecione a data para trancar a agenda do dia completo.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="date"
                    value={holidayToBlock}
                    onChange={(e) => setHolidayToBlock(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleHoliday(holidayToBlock)}
                    style={{ background: '#111827', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Adicionar Folga
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(barber?.holidays || []).length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Nenhuma folga cadastrada</span>
                  ) : (
                    barber.holidays.map((h: string) => (
                      <span
                        key={h}
                        onClick={() => handleToggleHoliday(h)}
                        title="Clique para remover folga"
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {h} ✕
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. GESTÃO DE HORÁRIOS & FOLGAS DO BARBEIRO (VERSÃO PAGA / PRO) */}
          {activeTab === 'availability' && isPro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top full-width green alert banner */}
              <div style={{
                width: '100%',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                textAlign: 'center',
                padding: '0.55rem 1rem',
                textTransform: 'uppercase',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
              }}>
                SISTEMA DE BLOQUEIOS V2 ATIVO (SEG/DOM + INTERVALOS)
              </div>

              {/* Header Bar Card */}
              <div style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div>
                  <h1 style={{
                    margin: 0,
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    Configuração de Agenda <span style={{ color: '#d97706' }}>- {barber?.name || 'Profissional'}</span>
                  </h1>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Controle individual de bloqueios de horários, folgas e feriados
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {/* DATA Picker */}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                      DATA
                    </div>
                    <input
                      type="date"
                      value={selectedScheduleDate}
                      onChange={(e) => setSelectedScheduleDate(e.target.value)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* PROFISSIONAL Indicator */}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                      PROFISSIONAL
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {barber?.name || 'Você'}
                    </div>
                  </div>

                  {/* SALVAR ALTERAÇÕES */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleSaveToast('Alterações da sua grade de horários salvas com sucesso!');
                        setTimeout(() => setScheduleSaveToast(null), 3500);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.25rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                    >
                      SALVAR ALTERAÇÕES
                    </button>
                  </div>

                  {/* View Mode Switcher */}
                  <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    padding: '0.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('grade')}
                      style={{
                        background: scheduleViewMode === 'grade' ? '#ffffff' : 'transparent',
                        color: scheduleViewMode === 'grade' ? '#0f172a' : '#64748b',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        boxShadow: scheduleViewMode === 'grade' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      GRADE
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('calendario')}
                      style={{
                        background: scheduleViewMode === 'calendario' ? '#ffffff' : 'transparent',
                        color: scheduleViewMode === 'calendario' ? '#0f172a' : '#64748b',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        boxShadow: scheduleViewMode === 'calendario' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      CALENDÁRIO
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('regras')}
                      style={{
                        background: scheduleViewMode === 'regras' ? '#ffffff' : 'transparent',
                        color: scheduleViewMode === 'regras' ? '#0f172a' : '#64748b',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        boxShadow: scheduleViewMode === 'regras' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      REGRAS
                    </button>
                  </div>
                </div>
              </div>

              {/* Toast Feedback */}
              {scheduleSaveToast && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  animation: 'fadeIn 0.2s ease-in-out'
                }}>
                  <CheckCircle size={16} /> {scheduleSaveToast}
                </div>
              )}

              {/* Mode 1: GRADE (Interactive Weekly Matrix) */}
              {scheduleViewMode === 'grade' && (
                <div>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflowX: 'auto',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: '1000px',
                      tableLayout: 'fixed'
                    }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          {/* Horario column */}
                          <th style={{
                            width: '100px',
                            padding: '1rem 0.75rem',
                            textAlign: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#64748b',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                          }}>
                            HORÁRIO
                          </th>

                          {/* Days of week */}
                          {[
                            { key: 'segunda', label: 'SEGUNDA' },
                            { key: 'terca', label: 'TERÇA' },
                            { key: 'quarta', label: 'QUARTA' },
                            { key: 'quinta', label: 'QUINTA' },
                            { key: 'sexta', label: 'SEXTA' },
                            { key: 'sabado', label: 'SÁBADO' },
                            { key: 'domingo', label: 'DOMINGO' },
                          ].map((d) => {
                            const isClosed = scheduleDayClosures[d.key];
                            return (
                              <th
                                key={d.key}
                                style={{
                                  padding: '0.85rem 0.5rem',
                                  textAlign: 'center',
                                  borderLeft: '1px solid #e2e8f0'
                                }}
                              >
                                <div style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  marginBottom: '0.35rem'
                                }}>
                                  {d.label}
                                </div>

                                {/* Closed status badge */}
                                {isClosed && (
                                  <div style={{
                                    display: 'inline-block',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    padding: '0.05rem 0.45rem',
                                    borderRadius: '4px',
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.04em',
                                    marginBottom: '0.35rem'
                                  }}>
                                    FECHADO
                                  </div>
                                )}

                                {/* Toggle Day Button */}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScheduleDayClosures((prev) => ({
                                        ...prev,
                                        [d.key]: !prev[d.key]
                                      }));
                                    }}
                                    style={{
                                      background: isClosed ? '#fee2e2' : '#fef2f2',
                                      border: '1px solid #fca5a5',
                                      color: '#dc2626',
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '4px',
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      letterSpacing: '0.05em',
                                      textTransform: 'uppercase',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fecaca')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = isClosed ? '#fee2e2' : '#fef2f2')}
                                  >
                                    ALTERNAR DIA
                                  </button>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
                          '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                          '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                          '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                          '19:00', '19:30', '20:00'
                        ].map((hour) => (
                          <tr
                            key={hour}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.15s'
                            }}
                          >
                            {/* Time Cell */}
                            <td style={{
                              padding: '0.65rem 0.5rem',
                              textAlign: 'center',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#475569',
                              background: '#f8fafc',
                              borderRight: '1px solid #e2e8f0'
                            }}>
                              {hour}
                            </td>

                            {/* Day Slots */}
                            {[
                              'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
                            ].map((dayKey) => {
                              const slotKey = `${dayKey}-${hour}`;
                              const isDayClosed = scheduleDayClosures[dayKey];
                              const bookedClient = scheduleBookedSlots[slotKey];
                              const customState = scheduleCustomSlots[slotKey];
                              const isExtraTime = (hour === '07:00' || hour === '07:30');

                              // Determine cell state
                              let cellState: 'FECHADO' | 'BOOKED' | 'EXTRA' | 'BLOQUEADO' | 'LIVRE' = 'LIVRE';
                              if (isDayClosed) {
                                cellState = 'FECHADO';
                              } else if (bookedClient) {
                                cellState = 'BOOKED';
                              } else if (customState === 'BLOQUEADO') {
                                cellState = 'BLOQUEADO';
                              } else if (customState === 'LIVRE') {
                                cellState = 'LIVRE';
                              } else if (customState === 'EXTRA' || isExtraTime) {
                                cellState = 'EXTRA';
                              }

                              return (
                                <td
                                  key={slotKey}
                                  style={{
                                    padding: '0.35rem 0.4rem',
                                    borderLeft: '1px solid #f1f5f9'
                                  }}
                                >
                                  {/* FECHADO Card */}
                                  {cellState === 'FECHADO' && (
                                    <div
                                      onClick={() => {
                                        setScheduleDayClosures((prev) => ({ ...prev, [dayKey]: false }));
                                      }}
                                      title="Dia fechado. Clique para reabrir este dia."
                                      style={{
                                        background: '#fffbeb',
                                        border: '1px solid #fde68a',
                                        borderRadius: '6px',
                                        padding: '0.55rem 0.4rem',
                                        textAlign: 'center',
                                        color: '#b45309',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.35rem',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s, border-color 0.15s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d97706')}
                                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#fde68a')}
                                    >
                                      <Clock size={11} /> FECHADO
                                    </div>
                                  )}

                                  {/* BOOKED CLIENT Card */}
                                  {cellState === 'BOOKED' && (
                                    <div
                                      onClick={() => {
                                        if (confirm(`Horário agendado com: ${bookedClient}.\nDeseja liberar este slot?`)) {
                                          setScheduleBookedSlots((prev) => {
                                            const copy = { ...prev };
                                            delete copy[slotKey];
                                            return copy;
                                          });
                                        }
                                      }}
                                      title={`Agendamento confirmado: ${bookedClient}`}
                                      style={{
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        padding: '0.5rem 0.4rem',
                                        textAlign: 'center',
                                        color: '#0f172a',
                                        fontSize: '0.66rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.3rem',
                                        lineHeight: 1.2,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        transition: 'border-color 0.15s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#94a3b8')}
                                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                                    >
                                      <User size={11} style={{ flexShrink: 0, color: '#64748b' }} />
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookedClient}</span>
                                    </div>
                                  )}

                                  {/* EXTRA Card */}
                                  {cellState === 'EXTRA' && (
                                    <div
                                      onClick={() => {
                                        setScheduleCustomSlots((prev) => ({
                                          ...prev,
                                          [slotKey]: 'BLOQUEADO'
                                        }));
                                      }}
                                      title="Horário extra operacional. Clique para bloquear."
                                      style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #bae6fd',
                                        borderRadius: '6px',
                                        padding: '0.55rem 0.4rem',
                                        textAlign: 'center',
                                        color: '#0284c7',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s, border-color 0.15s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#bae6fd')}
                                    >
                                      EXTRA
                                    </div>
                                  )}

                                  {/* BLOQUEADO Card */}
                                  {cellState === 'BLOQUEADO' && (
                                    <div
                                      onClick={() => {
                                        setScheduleCustomSlots((prev) => ({
                                          ...prev,
                                          [slotKey]: 'LIVRE'
                                        }));
                                      }}
                                      title="Horário bloqueado manualmente. Clique para desbloquear e tornar livre."
                                      style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        padding: '0.55rem 0.4rem',
                                        textAlign: 'center',
                                        color: '#dc2626',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s, border-color 0.15s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ef4444')}
                                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#fecaca')}
                                    >
                                      BLOQUEADO
                                    </div>
                                  )}

                                  {/* LIVRE Card */}
                                  {cellState === 'LIVRE' && (
                                    <div
                                      onClick={() => {
                                        setScheduleCustomSlots((prev) => ({
                                          ...prev,
                                          [slotKey]: 'BLOQUEADO'
                                        }));
                                      }}
                                      title="Horário livre para agendamento online. Clique para bloquear."
                                      style={{
                                        background: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '6px',
                                        padding: '0.55rem 0.4rem',
                                        textAlign: 'center',
                                        color: '#059669',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s, border-color 0.15s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#a7f3d0')}
                                    >
                                      LIVRE
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend / Status Helper */}
                  <div style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.75rem',
                    flexWrap: 'wrap',
                    padding: '1rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fffbeb', border: '1px solid #fde68a' }} />
                      <strong style={{ color: '#b45309' }}>FECHADO:</strong> Dia da semana não operacional
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f0f9ff', border: '1px solid #bae6fd' }} />
                      <strong style={{ color: '#0284c7' }}>EXTRA:</strong> Horário de apoio / expansão
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ecfdf5', border: '1px solid #a7f3d0' }} />
                      <strong style={{ color: '#059669' }}>LIVRE:</strong> Disponível para agendamento online
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef2f2', border: '1px solid #fecaca' }} />
                      <strong style={{ color: '#dc2626' }}>BLOQUEADO:</strong> Bloqueio manual ou pausa
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1' }} />
                      <strong style={{ color: '#0f172a' }}>CLIENTE:</strong> Reserva confirmada
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: CALENDÁRIO (Holidays & Blocked Dates) */}
              {scheduleViewMode === 'calendario' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          Feriados Nacionais & Folgas Cadastradas
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                          Bloqueia automaticamente o agendamento de clientes para seu perfil nestas datas.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={async () => {
                            const brHolidays = [
                              '2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07', 
                              '2026-10-12', '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25'
                            ];
                            const merged = Array.from(new Set([...(shopConfig?.holidays || []), ...(barber?.holidays || []), ...brHolidays]));
                            await fetch('/api/admin/shop-config', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ holidays: merged }),
                            });
                            setScheduleSaveToast('Feriados nacionais sincronizados com sucesso!');
                            setTimeout(() => setScheduleSaveToast(null), 3500);
                            loadBarberData();
                          }}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '0.5rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <CalendarDays size={14} /> Importar Feriados Nacionais
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            const newHol = prompt('Digite a data da folga/feriado (formato AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
                            if (newHol) {
                              const updated = [...(shopConfig?.holidays || []), newHol];
                              await fetch('/api/admin/shop-config', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ holidays: updated }),
                              });
                              setScheduleSaveToast(`Data ${newHol} adicionada aos feriados/folgas!`);
                              setTimeout(() => setScheduleSaveToast(null), 3500);
                              loadBarberData();
                            }
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.5rem 0.95rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                          }}
                        >
                          <Plus size={14} /> Adicionar Nova Data
                        </button>
                      </div>
                    </div>

                    {/* List of holidays */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      {((shopConfig?.holidays && shopConfig.holidays.length > 0) || (barber?.holidays && barber.holidays.length > 0)) ? (
                        Array.from(new Set([...(shopConfig?.holidays || []), ...(barber?.holidays || [])])).map((h: string) => (
                          <div
                            key={h}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#dc2626' }}>
                                {h}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                Folga / Atendimento Bloqueado
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = (shopConfig?.holidays || []).filter((d: string) => d !== h);
                                await fetch('/api/admin/shop-config', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ holidays: updated }),
                                });
                                loadBarberData();
                              }}
                              title="Remover data"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '0.3rem'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          Nenhum feriado ou folga específica registrada. Sua grade seguirá as regras semanais padrão.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 3: REGRAS (System Rules & Auto-Block Config) */}
              {scheduleViewMode === 'regras' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      Regras de Intervalo e Agendamento Automático
                    </h3>
                    <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.84rem' }}>
                      Políticas do motor V2 aplicadas em tempo real ao agendamento online dos clientes.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0284c7' }}>
                          <Clock size={18} />
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Duração Padrão do Slot</h4>
                        </div>
                        <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Intervalo base utilizado na grade executiva para todos os serviços.
                        </p>
                        <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                          30 Minutos (Fixo V2)
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#d97706' }}>
                          <Lock size={18} />
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Pausa Automática de Almoço</h4>
                        </div>
                        <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Bloqueio automático de horários para descanso diário dos barbeiros.
                        </p>
                        <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#d97706' }}>
                          12:00 às 13:00 (Ativo)
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#059669' }}>
                          <ShieldAlert size={18} />
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Fechamento Automático Seg/Dom</h4>
                        </div>
                        <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Segundas e Domingos permanecem trancados por padrão, podendo ser liberados via alternância.
                        </p>
                        <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#059669' }}>
                          Ativo no Motor V2
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. AVALIAÇÕES RECEBIDAS */}
          {activeTab === 'reviews' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>
                  Avaliações dos Seus Clientes ({reviewsList.length})
                </h3>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  ★ {barber?.rating || 5.0} / 5.0
                </div>
              </div>

              {reviewsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Você ainda não possui avaliações registradas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviewsList.map((rev) => (
                    <div key={rev.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.clientName}</span>
                        <span style={{ color: '#d97706', fontWeight: 800 }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0 0.25rem 0', color: '#475569', fontSize: '0.88rem' }}>
                        "{rev.comment}"
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. PERFIL PROFISSIONAL */}
          {activeTab === 'profile' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', maxWidth: '520px' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
                Editar Perfil Profissional
              </h3>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Nome Completo</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Especialidades e Técnicas</label>
                  <textarea
                    value={profileForm.specialty}
                    onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: '#8b5cf6', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Salvar Perfil
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
