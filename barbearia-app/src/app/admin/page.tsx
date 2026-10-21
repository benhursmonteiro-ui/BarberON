'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarClock, 
  Users, 
  UserCheck, 
  Scissors, 
  DollarSign, 
  Clock, 
  Package, 
  Tag, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit, 
  Phone, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
  ChevronRight,
  Briefcase,
  ArrowUp,
  User,
  Lock,
  CalendarDays,
  ExternalLink,
  Copy,
  Check,
  LogIn
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPortalPage() {
  const { user, role, loading: authLoading, shopSlug, demoPlan, setDemoPlan } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam === 'PRO' || planParam === 'FREE') {
      setDemoPlan(planParam);
    }
  }, [searchParams, setDemoPlan]);

  // Navigation Tabs for all 12 modules
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'appointments'
    | 'my-schedule'
    | 'barbers'
    | 'customers'
    | 'services'
    | 'finance'
    | 'schedule-config'
    | 'inventory'
    | 'promotions'
    | 'analytics'
    | 'settings'
  >('dashboard');

  // Global state across admin
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [shopConfig, setShopConfig] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterBarber, setFilterBarber] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Modals & form states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ label: '', value: '', category: 'Insumos' });

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ label: '', value: '', category: 'Avulso' });

  const [showManualFiadoModal, setShowManualFiadoModal] = useState(false);
  const [manualFiadoForm, setManualFiadoForm] = useState({
    clientName: '',
    clientPhone: '',
    barberId: '',
    serviceName: 'Corte Degradê',
    amount: '45.00',
    notes: '',
  });

  const [showBarberModal, setShowBarberModal] = useState(false);
  const [barberForm, setBarberForm] = useState({
    name: '',
    specialty: 'Cortes Modernos & Barboterapia',
    commission: 50,
    phone: '',
    email: '',
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 45,
    duration: 30,
    popular: true,
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Modelador',
    price: 40,
    stock: 10,
    minStock: 3,
  });

  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionForm, setPromotionForm] = useState({
    tag: 'COMBO',
    title: '',
    description: '',
    price: 60,
    color: '#b45309',
  });

  // Selected appointment payment update modal
  const [selectedAptForPayment, setSelectedAptForPayment] = useState<any>(null);
  const [paymentChoice, setPaymentChoice] = useState<'dinheiro' | 'pix' | 'cartao' | 'fiado'>('pix');

  // Executive Dashboard States (Paid PRO Plan)
  const [chartPeriod, setChartPeriod] = useState<'Semana' | 'Mês' | 'Ano'>('Semana');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);
  const [showMonthlyStatementModal, setShowMonthlyStatementModal] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<'PRO' | 'FREE' | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    if (typeof window !== 'undefined') {
      const full = text.startsWith('http') ? text : `${window.location.origin}${text}`;
      navigator.clipboard.writeText(full);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Se o usuário estiver autenticado em uma barbearia cadastrada (ex: Monteiro), ele não está em modo demo
  const isDemo = !shopSlug && !user?.barbershopId;
  const currentPlan = isDemo ? (previewPlan || demoPlan) : (shopConfig?.plan || (user as any)?.plan || 'FREE');
  
  // Validação de pagamento e expiração
  const subscriptionStatus = (shopConfig as any)?.subscriptionStatus || 'active';
  const subscriptionExpiresAt = (shopConfig as any)?.subscriptionExpiresAt;
  const isSubscriptionExpired = Boolean(subscriptionExpiresAt && new Date() > new Date(subscriptionExpiresAt));
  const isSubscriptionOverdue = subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid' || subscriptionStatus === 'canceled' || isSubscriptionExpired;

  // Só é PRO se o plano for PRO E (não vencido OU for demonstração)
  const isPro = currentPlan === 'PRO' && (!isSubscriptionOverdue || Boolean(isDemo));

  // Executive Schedule & Horários States (Paid PRO Plan)
  const [scheduleViewMode, setScheduleViewMode] = useState<'grade' | 'calendario' | 'regras'>('grade');
  const [selectedScheduleBarber, setSelectedScheduleBarber] = useState<string>('Marciel');
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>('2026-10-14');
  const [scheduleCustomSlots, setScheduleCustomSlots] = useState<Record<string, 'LIVRE' | 'BLOQUEADO' | 'EXTRA'>>({
    'terca-09:00': 'BLOQUEADO',
    'terca-09:30': 'BLOQUEADO',
    'quinta-08:30': 'BLOQUEADO',
    'sexta-09:30': 'BLOQUEADO',
    'sabado-11:00': 'BLOQUEADO',
  });
  const [scheduleSaveToast, setScheduleSaveToast] = useState<string | null>(null);
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

  // Automatically redirect if a PRO tab is selected while on the free plan
  useEffect(() => {
    const proOnlyTabs = ['customers', 'finance', 'schedule-config', 'inventory', 'promotions', 'analytics'];
    if (!isPro && proOnlyTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isPro, activeTab]);

  useEffect(() => {
    loadAllData();
  }, [filterDate, filterBarber, filterStatus, shopSlug, user?.barbershopId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const activeShopParam = shopSlug ? `slug=${encodeURIComponent(shopSlug)}` : (user?.barbershopId ? `shopId=${encodeURIComponent(user.barbershopId)}` : '');
      const shopQuery = activeShopParam ? `&${activeShopParam}` : '';
      const shopQueryOnly = activeShopParam ? `?${activeShopParam}` : '';

      const [
        aptsRes,
        barbersRes,
        servicesRes,
        custRes,
        prodRes,
        promoRes,
        cfgRes,
        finRes,
        anaRes,
      ] = await Promise.all([
        fetch(`/api/admin/appointments?${filterDate ? `date=${filterDate}&` : ''}barberId=${filterBarber}&status=${filterStatus}${shopQuery}`),
        fetch(`/api/admin/barbers${shopQueryOnly}`),
        fetch(`/api/admin/services${shopQueryOnly}`),
        fetch(`/api/admin/customers${shopQueryOnly}`),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/promotions'),
        fetch(`/api/admin/shop-config${shopQueryOnly}`),
        fetch('/api/admin/finance'),
        fetch('/api/admin/analytics'),
      ]);

      const [apts, barbs, servs, custs, prods, promos, cfg, fin, ana] = await Promise.all([
        aptsRes.json(),
        barbersRes.json(),
        servicesRes.json(),
        custRes.json(),
        prodRes.json(),
        promoRes.json(),
        cfgRes.json(),
        finRes.json(),
        anaRes.json(),
      ]);

      setAppointments(Array.isArray(apts) ? apts : []);
      setBarbers(Array.isArray(barbs) ? barbs : []);
      setServices(Array.isArray(servs) ? servs : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setProducts(Array.isArray(prods) ? prods : []);
      setPromotions(Array.isArray(promos) ? promos : []);
      setShopConfig(cfg);
      setFinancialData(fin);
      setAnalyticsData(ana);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  // Appointment Status Changes
  const handleUpdateStatus = async (
    id: string,
    status: string,
    paymentMethod?: string,
    paymentStatus?: string
  ) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, paymentMethod, paymentStatus }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm receipt and finish appointment
  const handleConfirmReceipt = async () => {
    if (!selectedAptForPayment) return;
    await handleUpdateStatus(
      selectedAptForPayment.id,
      'concluido',
      paymentChoice,
      paymentChoice === 'fiado' ? 'fiado' : 'pago'
    );
    setSelectedAptForPayment(null);
  };

  // Settle Fiado
  const handleSettleFiado = async (aptId: string) => {
    if (!confirm('Deseja dar baixa e liquidar este fiado agora? O valor entrará imediatamente no caixa do dia.')) return;
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'settle_fiado', appointmentId: aptId, paymentMethod: 'pix' }),
      });
      if (res.ok) {
        alert('Fiado quitado com sucesso! Receita registrada no caixa de hoje.');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run Maintenance Routine
  const handleRunMaintenance = async () => {
    if (!confirm('Executar rotina de manutenção? Agendamentos de datas passadas que ficaram pendentes serão cancelados/arquivados.')) return;
    try {
      const res = await fetch('/api/admin/maintenance', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Rotina executada.');
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Customer Block
  const handleToggleBlockCustomer = async (id: string) => {
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helpers
  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  // Today upcoming list
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  // Admin's own barber profile (e.g. "barber-admin" or matching name)
  const adminBarber = barbers.find((b) => b.userId === user?.id || b.id === 'barber-admin') || barbers[0];
  const adminOwnAppointments = appointments.filter((a) => a.barberId === adminBarber?.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Sidebar de Navegação dos 12 Módulos */}
      <aside style={{
        width: '260px',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.15rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Scissors size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shopConfig?.name || 'Marciel Barber'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Painel Administrativo
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{
                  background: isPro ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                  color: isPro ? '#fbbf24' : '#94a3b8',
                  border: isPro ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #334155',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0.12rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}>
                  {isPro ? '💎 VERSÃO PRO (PAGA)' : 'VERSÃO GRÁTIS'}
                </span>
                {isDemo && (
                  <button
                    type="button"
                    onClick={() => setPreviewPlan(isPro ? 'FREE' : 'PRO')}
                    title="Alternar entre versão paga (PRO) e versão gratuita"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f59e0b',
                      fontSize: '0.62rem',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {isPro ? 'Testar Free' : 'Ver Paga'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
            { id: 'appointments', label: 'Agendamentos Geral', icon: Calendar },
            { id: 'my-schedule', label: 'Minha Agenda (Dono)', icon: CalendarClock },
            { id: 'barbers', label: 'Barbeiros & Comissões', icon: Users },
            { id: 'customers', label: 'Clientes & Bloqueios', icon: UserCheck, proOnly: true },
            { id: 'services', label: 'Gestão de Serviços', icon: Scissors },
            { id: 'finance', label: 'Financeiro & Fiado', icon: DollarSign, proOnly: true },
            { id: 'schedule-config', label: 'Horários & Feriados', icon: Clock, proOnly: true },
            { id: 'inventory', label: 'Estoque & Produtos', icon: Package, proOnly: true },
            { id: 'promotions', label: 'Marketing & Combos', icon: Tag, proOnly: true },
            { id: 'analytics', label: 'Relatórios Analíticos', icon: BarChart3, proOnly: true },
            { id: 'settings', label: 'Configurações da Loja', icon: Settings },
          ]
            .filter((item) => isPro || !item.proOnly)
            .map((item, idx) => {
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
                    background: active ? '#d97706' : 'transparent',
                    color: active ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{idx + 1}. {item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Upgrade Card for Free Version */}
        {!isPro && (
          <div style={{
            margin: '0.5rem 0.75rem 0.75rem 0.75rem',
            padding: '0.85rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
              Módulos Exclusivos PRO
            </div>
            <div style={{ fontSize: '0.67rem', color: '#94a3b8', lineHeight: 1.35, marginBottom: '0.65rem' }}>
              Clientes, Financeiro, Horários V2, Estoque, Marketing e Relatórios estão bloqueados no plano grátis.
            </div>
            <button
              type="button"
              onClick={() => setPreviewPlan('PRO')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Sparkles size={12} /> Testar Versão PRO
            </button>
          </div>
        )}

        {/* Maintenance quick trigger */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
          <button
            type="button"
            onClick={handleRunMaintenance}
            style={{
              width: '100%',
              padding: '0.55rem',
              background: '#1e293b',
              color: '#cbd5e1',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={13} /> Limpeza de Agendamentos
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto',
        background: '#f8fafc',
        color: '#1e293b'
      }}>
        {/* Top bar */}
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
              {activeTab === 'appointments' && 'Gestão Geral de Agendamentos'}
              {activeTab === 'my-schedule' && `Minha Agenda Pessoal (${adminBarber?.name})`}
              {activeTab === 'barbers' && 'Gestão de Barbeiros & Comissionamento'}
              {activeTab === 'customers' && 'Gestão de Clientes & Histórico'}
              {activeTab === 'services' && 'Catálogo de Serviços & Preços'}
              {activeTab === 'finance' && 'Gestão Financeira, Caixa & Módulo de Fiado'}
              {activeTab === 'schedule-config' && 'Grade de Horários, Bloqueios & Feriados'}
              {activeTab === 'inventory' && 'Estoque de Produtos & Alertas'}
              {activeTab === 'promotions' && 'Marketing, Promoções & Combos'}
              {activeTab === 'analytics' && 'Relatórios e Indicadores de Performance'}
              {activeTab === 'settings' && 'Configurações Comerciais da Barbearia'}
              {activeTab === 'dashboard' && 'Painel Executivo & Indicadores Estratégicos'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
              Visão administrativa centralizada com controle total de regras e operações.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={loadAllData}
              title="Atualizar Dados"
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RefreshCw size={14} /> Atualizar
            </button>
            <Link
              href="/client"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Portal do Cliente <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ 
          padding: '2rem', 
          flex: 1 
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: isPro && activeTab === 'dashboard' ? '#94a3b8' : '#64748b' }}>
              <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
              <p>Carregando informações do sistema...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ---------------- 1. DASHBOARD GERAL ---------------- */}
              {activeTab === 'dashboard' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
                  
                  {/* Executive Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    marginBottom: '0.5rem',
                    background: '#ffffff',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div>
                      {/* Badge Painel Executivo */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#b45309',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem'
                      }}>
                        <Sparkles size={13} color="#d97706" /> PAINEL EXECUTIVO
                      </div>

                      <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        margin: 0,
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15
                      }}>
                        Relatório <span style={{ color: '#d97706' }}>Geral</span>
                      </h1>

                      <p style={{
                        color: '#64748b',
                        fontSize: '0.88rem',
                        margin: '0.35rem 0 0 0',
                        fontWeight: 400
                      }}>
                        Gestão estratégica e métricas de desempenho da {shopConfig?.name || 'Marciel Barber'}.
                      </p>
                    </div>

                    {/* Top Right Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowMonthlyStatementModal(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1.15rem',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          letterSpacing: '0.04em',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      >
                        <Calendar size={15} color="#d97706" /> EXTRATO MENSAL
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          background: '#d97706',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        GERENCIAR <ChevronRight size={15} strokeWidth={3} />
                      </button>

                      <button
                        type="button"
                        onClick={loadAllData}
                        title="Atualizar métricas"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 4 KPI Summary Cards with Glowing Sparklines */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem'
                  }}>
                    {/* Card 1: Clientes Cadastrados */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem 1.25rem 0.75rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            CLIENTES CADASTRADOS
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}>
                            ↗ +18.4%
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                              {customers.length > 0 ? customers.length : 349}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                              Base total ativa
                            </div>
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d97706'
                          }}>
                            <Users size={19} />
                          </div>
                        </div>
                      </div>

                      {/* Sparkline Graphic */}
                      <div style={{ marginTop: '0.75rem', height: '36px' }}>
                        <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,34 C 30,32 50,22 80,25 C 110,27 130,12 160,8 L 160,40 L 0,40 Z" fill="url(#sparkGrad1)" />
                          <path d="M 0,34 C 30,32 50,22 80,25 C 110,27 130,12 160,8" fill="none" stroke="#d97706" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 2: Agendamentos Hoje */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem 1.25rem 0.75rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            AGENDAMENTOS HOJE
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}>
                            ↗ +12.1%
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                              {todayAppointments.length > 0 ? String(todayAppointments.length).padStart(2, '0') : '06'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                              Horários agendados
                            </div>
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d97706'
                          }}>
                            <Calendar size={19} />
                          </div>
                        </div>
                      </div>

                      {/* Sparkline Graphic */}
                      <div style={{ marginTop: '0.75rem', height: '36px' }}>
                        <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,32 C 35,30 60,18 90,20 C 120,22 140,10 160,6 L 160,40 L 0,40 Z" fill="url(#sparkGrad2)" />
                          <path d="M 0,32 C 35,30 60,18 90,20 C 120,22 140,10 160,6" fill="none" stroke="#d97706" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 3: Faturamento Total */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem 1.25rem 0.75rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            FATURAMENTO TOTAL
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}>
                            ↗ +24.5%
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                              {financialData?.overview?.faturamentoBruto 
                                ? formatCurrency(financialData.overview.faturamentoBruto) 
                                : 'R$ 115.00'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                              Receita bruta acumulada
                            </div>
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d97706'
                          }}>
                            <DollarSign size={19} />
                          </div>
                        </div>
                      </div>

                      {/* Sparkline Graphic */}
                      <div style={{ marginTop: '0.75rem', height: '36px' }}>
                        <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,35 C 30,34 55,24 85,26 C 115,28 135,14 160,8 L 160,40 L 0,40 Z" fill="url(#sparkGrad3)" />
                          <path d="M 0,35 C 30,34 55,24 85,26 C 115,28 135,14 160,8" fill="none" stroke="#d97706" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 4: Barbeiros Ativos */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem 1.25rem 0.75rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            BARBEIROS ATIVOS
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#b45309',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}>
                            ↗ +2
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                              {barbers.filter(b => b.active !== false).length || 2}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                              Equipe em serviço
                            </div>
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d97706'
                          }}>
                            <Briefcase size={19} />
                          </div>
                        </div>
                      </div>

                      {/* Sparkline Graphic */}
                      <div style={{ marginTop: '0.75rem', height: '36px' }}>
                        <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="sparkGrad4" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,34 C 40,32 70,22 100,24 C 130,26 145,16 160,10 L 160,40 L 0,40 Z" fill="url(#sparkGrad4)" />
                          <path d="M 0,34 C 40,32 70,22 100,24 C 130,26 145,16 160,10" fill="none" stroke="#d97706" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: 2 Main Interactive Charts */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                    gap: '1rem',
                    alignItems: 'stretch'
                  }}>
                    {/* Left Chart: Evolução do Faturamento Semanal */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.4rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                            Evolução do Faturamento Semanal
                          </h3>
                          <p style={{ color: '#64748b', fontSize: '0.76rem', margin: '0.2rem 0 0 0' }}>
                            Análise comparativa de ganhos diários
                          </p>
                        </div>

                        {/* Toggle Pills: Semana | Mês | Ano */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '3px'
                        }}>
                          {(['Semana', 'Mês', 'Ano'] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setChartPeriod(period)}
                              style={{
                                padding: '0.3rem 0.85rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: chartPeriod === period ? '#d97706' : 'transparent',
                                color: chartPeriod === period ? '#ffffff' : '#64748b',
                                fontSize: '0.74rem',
                                fontWeight: chartPeriod === period ? 800 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SVG Area Chart Graphic */}
                      <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                        <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="mainAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                              <stop offset="65%" stopColor="#d97706" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines */}
                          <line x1="40" y1="50" x2="660" y2="50" stroke="#f1f5f9" strokeDasharray="3 4" strokeWidth="1" />
                          <line x1="40" y1="110" x2="660" y2="110" stroke="#f1f5f9" strokeDasharray="3 4" strokeWidth="1" />
                          <line x1="40" y1="170" x2="660" y2="170" stroke="#f1f5f9" strokeDasharray="3 4" strokeWidth="1" />

                          {/* Gradient Fill under curve */}
                          <path
                            d="M 50,175 C 90,170 120,158 150,155 C 190,152 210,140 250,138 C 290,135 320,122 350,118 C 390,115 410,48 450,45 C 490,42 510,70 550,75 C 590,80 610,162 650,165 L 650,210 L 50,210 Z"
                            fill="url(#mainAreaGrad)"
                          />

                          {/* Line */}
                          <path
                            d="M 50,175 C 90,170 120,158 150,155 C 190,152 210,140 250,138 C 290,135 320,122 350,118 C 390,115 410,48 450,45 C 490,42 510,70 550,75 C 590,80 610,162 650,165"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          {/* Vertical dashed line at Friday Peak (x = 450) */}
                          <line x1="450" y1="45" x2="450" y2="210" stroke="#d97706" strokeDasharray="3 4" strokeWidth="1.5" opacity="0.6" />

                          {/* Tooltip Badge at Friday Peak */}
                          <g transform="translate(450, 16)">
                            <rect x="-38" y="-4" width="76" height="24" rx="4" fill="#d97706" />
                            <polygon points="-5,20 5,20 0,25" fill="#d97706" />
                            <text x="0" y="12" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                              100 cortes
                            </text>
                          </g>

                          {/* Interactive Points on Curve */}
                          {[
                            { day: 'Seg', x: 50, y: 175 },
                            { day: 'Ter', x: 150, y: 155 },
                            { day: 'Qua', x: 250, y: 138 },
                            { day: 'Qui', x: 350, y: 118 },
                            { day: 'Sex', x: 450, y: 45, isPeak: true },
                            { day: 'Sáb', x: 550, y: 75 },
                            { day: 'Dom', x: 650, y: 165 },
                          ].map((pt) => (
                            <g key={pt.day}>
                              {pt.isPeak ? (
                                <>
                                  <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.4" />
                                  <circle cx={pt.x} cy={pt.y} r="5" fill="#d97706" />
                                </>
                              ) : (
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="4"
                                  fill="#d97706"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  style={{ cursor: 'pointer' }}
                                />
                              )}
                              {/* Day Label */}
                              <text
                                x={pt.x}
                                y="230"
                                fill={pt.isPeak ? '#d97706' : '#64748b'}
                                fontSize="12"
                                fontWeight={pt.isPeak ? '800' : '600'}
                                textAnchor="middle"
                              >
                                {pt.day}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Right Chart: Capacidade de Atendimento */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.4rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                            Capacidade de Atendimento
                          </h3>
                          <p style={{ color: '#64748b', fontSize: '0.76rem', margin: '0.2rem 0 0 0' }}>
                            Agendamentos por período do dia
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                            180
                          </div>
                          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#d97706', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            TOTAL DO DIA
                          </div>
                        </div>
                      </div>

                      {/* Column Bars Chart */}
                      <div style={{
                        height: '190px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '1rem 0 0 0'
                      }}>
                        {[
                          { hour: '08:00', height: '28%', peak: false },
                          { hour: '10:00', height: '48%', peak: false },
                          { hour: '12:00', height: '82%', peak: true },
                          { hour: '14:00', height: '42%', peak: false },
                          { hour: '16:00', height: '95%', peak: true },
                          { hour: '18:00', height: '60%', peak: false },
                          { hour: '20:00', height: '36%', peak: false },
                        ].map((col) => (
                          <div
                            key={col.hour}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              height: '100%',
                              justifyContent: 'flex-end',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredHour(col.hour)}
                            onMouseLeave={() => setHoveredHour(null)}
                          >
                            {/* Column Track Container */}
                            <div style={{
                              width: '100%',
                              maxWidth: '42px',
                              height: '150px',
                              background: '#f1f5f9',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'flex-end',
                              overflow: 'hidden',
                              border: '1px solid #e2e8f0',
                              position: 'relative'
                            }}>
                              {/* Filled Bar */}
                              <div style={{
                                width: '100%',
                                height: col.height,
                                background: col.peak
                                  ? '#d97706'
                                  : '#cbd5e1',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                              }} />
                            </div>

                            {/* Hour Label */}
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: col.peak ? 800 : 500,
                              color: col.peak ? '#d97706' : '#64748b',
                              marginTop: '0.6rem'
                            }}>
                              {col.hour}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Atividades Recentes + Ações Rápidas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                    gap: '1rem',
                    alignItems: 'stretch'
                  }}>
                    {/* Left Block: Atividades Recentes */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.4rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={17} color="#d97706" />
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                              Atividades Recentes
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.76rem', margin: '0.15rem 0 0 0' }}>
                              Últimos agendamentos registrados no sistema
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('appointments')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d97706',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            padding: '0.2rem 0.4rem'
                          }}
                        >
                          VER TUDO
                        </button>
                      </div>

                      {/* Recent Activities Table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>CLIENTE</th>
                              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>BARBEIRO</th>
                              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>HORÁRIO</th>
                              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'right' }}>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                id: 'act-1',
                                clientName: 'Arone Borges de Medeiros',
                                serviceName: 'Social e barba',
                                barberName: 'Marciel',
                                time: '08:00',
                                status: 'AGENDADO',
                                initial: 'A'
                              },
                              {
                                id: 'act-2',
                                clientName: 'Arone Borges de Medeiros',
                                serviceName: 'Social e barba',
                                barberName: 'Marciel',
                                time: '17:00',
                                status: 'AGENDADO',
                                initial: 'A'
                              },
                              {
                                id: 'act-3',
                                clientName: 'Raniel',
                                serviceName: 'Social',
                                barberName: 'Marciel',
                                time: '17:30',
                                status: 'AGENDADO',
                                initial: 'R'
                              },
                              ...(appointments.length > 0
                                ? appointments.slice(0, 2).map((a: any) => {
                                    const cName = a?.clientName || a?.customerName || 'Cliente';
                                    const st = (a?.status || 'AGENDADO').toUpperCase();
                                    return {
                                      id: a?.id || Math.random().toString(),
                                      clientName: cName,
                                      serviceName: a?.serviceName || 'Corte',
                                      barberName: a?.barberName || 'Barbeiro',
                                      time: a?.time || '00:00',
                                      status: st,
                                      initial: cName ? cName.charAt(0).toUpperCase() : 'C'
                                    };
                                  })
                                : [])
                            ].slice(0, 4).map((row, idx) => (
                              <tr key={`${row.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: '#eff6ff',
                                      color: '#2563eb',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 800,
                                      fontSize: '0.8rem',
                                      flexShrink: 0
                                    }}>
                                      {row.initial}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>{row.clientName}</div>
                                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.serviceName}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 500 }}>
                                  {row.barberName}
                                </td>
                                <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 800 }}>
                                  {row.time}
                                </td>
                                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.2rem 0.65rem',
                                    borderRadius: '5px',
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.04em',
                                    background: '#fef3c7',
                                    border: '1px solid #fde68a',
                                    color: '#92400e'
                                  }}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right Block: AÇÕES RÁPIDAS */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.4rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <h3 style={{
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        margin: '0 0 1rem 0'
                      }}>
                        AÇÕES RÁPIDAS
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', flex: 1 }}>
                        {/* 1. Profissionais */}
                        <button
                          type="button"
                          onClick={() => setActiveTab('barbers')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                            <Users size={17} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Profissionais</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Gerenciar barbeiros</div>
                          </div>
                        </button>

                        {/* 2. Agendamentos */}
                        <button
                          type="button"
                          onClick={() => setActiveTab('appointments')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                            <Calendar size={17} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Agendamentos</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ver agenda geral</div>
                          </div>
                        </button>

                        {/* 3. Serviços */}
                        <button
                          type="button"
                          onClick={() => setActiveTab('services')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                            <Scissors size={17} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Serviços</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tabela de preços</div>
                          </div>
                        </button>

                        {/* 4. Relatórios */}
                        <button
                          type="button"
                          onClick={() => setActiveTab('finance')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                            <BarChart3 size={17} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Relatórios</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Análise financeira</div>
                          </div>
                        </button>

                        {/* 5. Configurações */}
                        <button
                          type="button"
                          onClick={() => setActiveTab('settings')}
                          style={{
                            gridColumn: 'span 2',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                            <Settings size={17} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Configurações</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ajustes do sistema</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 1b. DASHBOARD VERSÃO GRATUITA (FREE) ---------------- */}
              {activeTab === 'dashboard' && !isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px' }}>
                  {/* Banner de Upgrade para o Plano PRO */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '16px',
                    padding: '1.75rem 2rem',
                    border: '1px solid #d97706',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#d97706', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        <Sparkles size={13} /> VERSÃO GRATUITA ATIVA
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                        Desbloqueie o Painel Executivo com Métricas Estratégicas
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0.35rem 0 0 0', maxWidth: '640px' }}>
                        O Painel Executivo com curva de faturamento semanal, análise de pico por horário e extrato detalhado é exclusivo da <strong>Versão Paga (Plano PRO)</strong>.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <a
                        href={`https://mpago.la/2dCR8ZP`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #009ee3, #007ebb)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.75rem 1.4rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 15px rgba(0, 158, 227, 0.4)'
                        }}
                      >
                        <ExternalLink size={16} /> Assinar PRO via Mercado Pago (PIX / Cartão)
                      </a>

                      <button
                        type="button"
                        onClick={() => setPreviewPlan('PRO')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Sparkles size={13} /> Pré-visualizar Modo Demo
                      </button>
                    </div>
                  </div>

                  {/* Alerta explícito de bloqueio se estiver atrasado */}
                  {isSubscriptionOverdue && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #ef4444',
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      color: '#991b1b'
                    }}>
                      <AlertTriangle size={24} color="#dc2626" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Assinatura do Plano PRO Vencida / Pendente</div>
                        <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                          O acesso aos recursos PRO e a criação de novos agendamentos estão temporariamente bloqueados. Regularize o pagamento na Kiwify para restabelecimento imediato.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Free Plan basic KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Catálogo de Serviços</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#0f172a' }}>
                        {services.length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                        Serviços ativos disponíveis
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Atendimentos de Hoje</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#d97706' }}>
                        {todayAppointments.length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {todayAppointments.filter(a => a.status === 'concluido').length} já concluídos hoje
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Limite Mensal do Plano Free</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#dc2626' }}>
                        {appointments.length} / 30
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Plano PRO possui agendamentos ilimitados
                      </div>
                    </div>
                  </div>

                  {/* Lista rápida de próximos atendimentos */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        Atendimentos de Hoje ({todayAppointments.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('appointments')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Ver todos →
                      </button>
                    </div>
                    {todayAppointments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Nenhum atendimento agendado para o dia de hoje.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                              <th style={{ padding: '0.75rem' }}>Horário</th>
                              <th style={{ padding: '0.75rem' }}>Cliente</th>
                              <th style={{ padding: '0.75rem' }}>Barbeiro</th>
                              <th style={{ padding: '0.75rem' }}>Serviço</th>
                              <th style={{ padding: '0.75rem' }}>Valor</th>
                              <th style={{ padding: '0.75rem' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayAppointments.map((apt) => (
                              <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{apt.time}</td>
                                <td style={{ padding: '0.75rem' }}>{apt.clientName}</td>
                                <td style={{ padding: '0.75rem' }}>{apt.barberName}</td>
                                <td style={{ padding: '0.75rem' }}>{apt.serviceName}</td>
                                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{formatCurrency(apt.price)}</td>
                                <td style={{ padding: '0.75rem' }}>
                                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                                    {apt.status ? apt.status.toUpperCase() : 'AGENDADO'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------- 2. GESTÃO GERAL DE AGENDAMENTOS ---------------- */}
              {activeTab === 'appointments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Filters Bar */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Data</label>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Barbeiro</label>
                      <select
                        value={filterBarber}
                        onChange={(e) => setFilterBarber(e.target.value)}
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="all">Todos os Barbeiros</option>
                        {barbers.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="all">TODOS</option>
                        <option value="agendado">AGENDADO</option>
                        <option value="confirmado">CONFIRMADO</option>
                        <option value="em atendimento">EM ATENDIMENTO</option>
                        <option value="concluido">CONCLUÍDO</option>
                        <option value="cancelado">CANCELADO</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setFilterDate(''); setFilterBarber('all'); setFilterStatus('all'); }}
                      style={{ marginTop: '1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Limpar Filtros
                    </button>
                  </div>

                  {/* Appointments Table */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                          <th style={{ padding: '0.75rem' }}>Data & Hora</th>
                          <th style={{ padding: '0.75rem' }}>Cliente</th>
                          <th style={{ padding: '0.75rem' }}>Barbeiro</th>
                          <th style={{ padding: '0.75rem' }}>Serviço</th>
                          <th style={{ padding: '0.75rem' }}>Valor & Comissão</th>
                          <th style={{ padding: '0.75rem' }}>Pagamento</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((apt) => (
                          <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 700 }}>{apt.date}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.time} ({apt.durationMinutes || 30} min)</div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>{apt.clientName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.clientPhone}</div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>{apt.barberName}</td>
                            <td style={{ padding: '0.75rem' }}>{apt.serviceName}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 700 }}>{formatCurrency(apt.price)}</div>
                              <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                                Comiss: {formatCurrency(apt.commission)}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: apt.isFiado && !apt.fiadoPaid ? '#fee2e2' : '#f1f5f9',
                                color: apt.isFiado && !apt.fiadoPaid ? '#991b1b' : '#334155'
                              }}>
                                {apt.paymentMethod?.toUpperCase()} {apt.isFiado ? (apt.fiadoPaid ? '(Quitado)' : '(FIADO)') : ''}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <select
                                value={apt.status}
                                onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                                style={{
                                  padding: '0.25rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid #cbd5e1'
                                }}
                              >
                                <option value="agendado">AGENDADO</option>
                                <option value="confirmado">CONFIRMADO</option>
                                <option value="em atendimento">EM ATENDIMENTO</option>
                                <option value="concluido">CONCLUÍDO</option>
                                <option value="cancelado">CANCELADO</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              {apt.isFiado && !apt.fiadoPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleSettleFiado(apt.id)}
                                  style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Quitar Fiado
                                </button>
                              )}
                              {apt.status !== 'concluido' && (
                                <button
                                  type="button"
                                  onClick={() => { setSelectedAptForPayment(apt); setPaymentChoice('pix'); }}
                                  style={{ marginLeft: '0.35rem', background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Receber
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 3. MINHA AGENDA (DONO / ADMIN) ---------------- */}
              {activeTab === 'my-schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        Agenda Pessoal de {adminBarber?.name || 'Administrador'}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                        Visualização exclusiva dos atendimentos vinculados ao seu próprio perfil de barbeiro.
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                        {formatCurrency(adminOwnAppointments.filter(a => a.status === 'concluido').reduce((s, a) => s + (a.commission || a.price * 0.5), 0))}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sua comissão gerada</div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    {adminOwnAppointments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                        Você não possui atendimentos vinculados na sua agenda própria no momento.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {adminOwnAppointments.map((apt) => (
                          <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{apt.time} - {apt.clientName}</div>
                              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                {apt.serviceName} • {formatCurrency(apt.price)} (Sua comissão: {formatCurrency(apt.commission)})
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9' }}>
                                {apt.status ? apt.status.toUpperCase() : 'AGENDADO'}
                              </span>
                              {apt.status !== 'concluido' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(apt.id, 'concluido')}
                                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Concluir Meu Corte
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

              {/* ---------------- 4. GESTÃO DE PROFISSIONAIS (BARBEIROS) ---------------- */}
              {activeTab === 'barbers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Equipe de Barbeiros ({barbers.length})</h3>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Defina comissão individual de 0% a 100%, horários de trabalho e folgas por profissional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBarberModal(true)}
                      style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Novo Barbeiro
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {barbers.map((b) => (
                      <div key={b.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <img
                            src={b.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                            alt={b.name}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{b.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.specialty}</div>
                            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.2rem', fontWeight: 700 }}>
                              ★ {b.rating || 5.0} ({b.reviews || 0} avaliações)
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Comissão Definida</div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2563eb' }}>{b.commission}%</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status da Escala</div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: b.active ? '#166534' : '#991b1b',
                              background: b.active ? '#dcfce7' : '#fee2e2',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px'
                            }}>
                              {b.active ? 'ATIVO' : 'DESATIVADO'}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={async () => {
                              const newRate = prompt(`Informe a nova comissão (%) para ${b.name}:`, String(b.commission));
                              if (newRate !== null) {
                                await fetch(`/api/admin/barbers/${b.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ commission: Number(newRate) }),
                                });
                                loadAllData();
                              }
                            }}
                            style={{ flex: 1, padding: '0.45rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Ajustar Comissão
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/barbers/${b.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ active: !b.active }),
                              });
                              loadAllData();
                            }}
                            style={{ padding: '0.45rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {b.active ? 'Pausar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- 5. GESTÃO DE CLIENTES (VERSÃO PAGA) ---------------- */}
              {activeTab === 'customers' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Buscar por nome ou WhatsApp..."
                        style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Total de clientes listados: <strong>{filteredCustomers.length}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                          <th style={{ padding: '0.75rem' }}>Cliente</th>
                          <th style={{ padding: '0.75rem' }}>WhatsApp</th>
                          <th style={{ padding: '0.75rem' }}>Total Visitas</th>
                          <th style={{ padding: '0.75rem' }}>Total Gasto</th>
                          <th style={{ padding: '0.75rem' }}>Última Visita</th>
                          <th style={{ padding: '0.75rem' }}>Situação</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Ações Rápidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((cust) => (
                          <tr key={cust.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{cust.name}</td>
                            <td style={{ padding: '0.75rem' }}>{cust.phone}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>{cust.totalVisits || 0} cortes</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                              {formatCurrency(cust.totalSpent || 0)}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{cust.lastVisit || 'Primeiro corte'}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: cust.blocked ? '#fee2e2' : '#dcfce7',
                                color: cust.blocked ? '#991b1b' : '#166534'
                              }}>
                                {cust.blocked ? 'BLOQUEADO' : 'LIBERADO'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              <a
                                href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(cust.name)}!%20Mensagem%20da%20Barbearia.`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: '#25D366',
                                  color: '#ffffff',
                                  textDecoration: 'none',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  marginRight: '0.35rem'
                                }}
                              >
                                <Phone size={12} /> Chamar no WhatsApp
                              </a>

                              <button
                                type="button"
                                onClick={() => handleToggleBlockCustomer(cust.id)}
                                style={{
                                  background: cust.blocked ? '#dcfce7' : '#fee2e2',
                                  color: cust.blocked ? '#166534' : '#991b1b',
                                  border: 'none',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {cust.blocked ? 'Desbloquear' : 'Bloquear'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 6. GESTÃO DE SERVIÇOS ---------------- */}
              {activeTab === 'services' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Catálogo de Serviços ({services.length})</h3>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Configure nome, preço, duração exata em minutos e tag popular.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowServiceModal(true)}
                      style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Novo Serviço
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {services.map((srv) => (
                      <div key={srv.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{srv.name}</div>
                          {srv.popular && (
                            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>{srv.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Duração: {srv.duration} min</div>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>{formatCurrency(srv.price)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Excluir serviço "${srv.name}"?`)) {
                                await fetch(`/api/admin/services/${srv.id}`, { method: 'DELETE' });
                                loadAllData();
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- 7. FINANCEIRO & MÓDULO DE FIADO (VERSÃO PAGA) ---------------- */}
              {activeTab === 'finance' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {/* Top Stats Overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Receita Bruta (Mês)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                        {formatCurrency(financialData?.overview?.faturamentoBruto)}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Comissões a Pagar</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
                        {formatCurrency(financialData?.overview?.totalComissoes)}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Despesas Lançadas</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
                        {formatCurrency(financialData?.overview?.totalDespesas)}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Receita Líquida Real</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
                        {formatCurrency(financialData?.overview?.faturamentoLiquido)}
                      </div>
                    </div>
                  </div>

                  {/* Ações de Lançamentos Rápidos */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowExpenseModal(true)}
                      style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Lançar Despesa
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowIncomeModal(true)}
                      style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Lançar Entrada Avulsa
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowManualFiadoModal(true);
                        setManualFiadoForm({
                          clientName: '',
                          clientPhone: '',
                          barberId: barbers[0]?.id || '',
                          serviceName: 'Corte Degradê',
                          amount: '45.00',
                          notes: '',
                        });
                      }}
                      style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Lançar Novo Fiado Manual
                    </button>
                  </div>

                  {/* MÓDULO DE FIADO & LISTA DE DEVEDORES */}
                  <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <AlertTriangle size={18} /> Módulo de Fiado & Devedores Pendentes
                        </h3>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#7c2d12', fontSize: '0.82rem' }}>
                          Fiado entra no faturamento bruto projetado, mas NÃO soma no caixa diário até ser explicitamente quitado!
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>
                          {formatCurrency(financialData?.fiado?.totalFiadoPending || 0)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total a receber em fiado</div>
                      </div>
                    </div>

                    {(!financialData?.fiado?.appointments || financialData.fiado.appointments.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#16a34a', fontWeight: 600 }}>
                        Nenhum cliente devedor ou fiado pendente no momento. Caixa 100% em dia!
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                              <th style={{ padding: '0.6rem' }}>Data do Corte</th>
                              <th style={{ padding: '0.6rem' }}>Cliente Devedor</th>
                              <th style={{ padding: '0.6rem' }}>Telefone</th>
                              <th style={{ padding: '0.6rem' }}>Serviço Realizado</th>
                              <th style={{ padding: '0.6rem' }}>Barbeiro</th>
                              <th style={{ padding: '0.6rem' }}>Valor Pendente</th>
                              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Ação de Baixa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financialData.fiado.appointments.map((a: any) => (
                              <tr key={a.id} style={{ borderBottom: '1px solid #fef3c7' }}>
                                <td style={{ padding: '0.6rem', fontWeight: 600 }}>{a.date}</td>
                                <td style={{ padding: '0.6rem', fontWeight: 700 }}>{a.clientName}</td>
                                <td style={{ padding: '0.6rem' }}>{a.clientPhone}</td>
                                <td style={{ padding: '0.6rem' }}>{a.serviceName}</td>
                                <td style={{ padding: '0.6rem' }}>{a.barberName}</td>
                                <td style={{ padding: '0.6rem', fontWeight: 800, color: '#dc2626' }}>{formatCurrency(a.price)}</td>
                                <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSettleFiado(a.id)}
                                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    Dar Baixa / Quitar Fiado
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Fechamento Diário de Caixa */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.1rem' }}>
                      Controle Diário & Fechamento de Caixa de Hoje ({todayStr})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Entradas de Serviços Recebidas</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                          {formatCurrency(financialData?.daily?.appointmentsRevenue || 0)}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Entradas Avulsas & Quitações</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                          {formatCurrency(financialData?.daily?.otherIncomes || 0)}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Despesas do Dia</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                          {formatCurrency(financialData?.daily?.totalExpenses || 0)}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Saldo Líquido no Caixa Hoje</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency(financialData?.daily?.netDailyCash || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 8. GESTÃO DE HORÁRIOS & FERIADOS ---------------- */}
              {activeTab === 'schedule-config' && isPro && (
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
                        Configuração de Agenda <span style={{ color: '#d97706' }}>- MB</span>
                      </h1>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Controle regras de agendamento, horários e feriados
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

                      {/* PROFISSIONAL Selector */}
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                          PROFISSIONAL
                        </div>
                        <select
                          value={selectedScheduleBarber}
                          onChange={(e) => setSelectedScheduleBarber(e.target.value)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Marciel">Marciel</option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* SALVAR ALTERAÇÕES */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleSaveToast('Alterações da grade de horários salvas com sucesso!');
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
                                            // Toggle day open on click
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
                              Feriados Nacionais & Datas Fechadas
                            </h3>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                              Bloqueia automaticamente o agendamento de clientes para todos os barbeiros nestas datas.
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
                                const merged = Array.from(new Set([...(shopConfig?.holidays || []), ...brHolidays]));
                                await fetch('/api/admin/shop-config', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ holidays: merged }),
                                });
                                setScheduleSaveToast('Feriados nacionais importados com sucesso!');
                                setTimeout(() => setScheduleSaveToast(null), 3500);
                                loadAllData();
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
                                const newHol = prompt('Digite a data do feriado (formato AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
                                if (newHol) {
                                  const updated = [...(shopConfig?.holidays || []), newHol];
                                  await fetch('/api/admin/shop-config', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ holidays: updated }),
                                  });
                                  setScheduleSaveToast(`Data ${newHol} adicionada aos feriados!`);
                                  setTimeout(() => setScheduleSaveToast(null), 3500);
                                  loadAllData();
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
                          {(shopConfig?.holidays && shopConfig.holidays.length > 0) ? (
                            shopConfig.holidays.map((h: string) => (
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
                                    Barbearia Bloqueada
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const updated = shopConfig.holidays.filter((d: string) => d !== h);
                                    await fetch('/api/admin/shop-config', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ holidays: updated }),
                                    });
                                    loadAllData();
                                  }}
                                  title="Remover feriado"
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
                              Nenhum feriado específico registrado. A barbearia seguirá apenas as regras semanais.
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

              {/* ---------------- 9. ESTOQUE & PRODUTOS (VERSÃO PAGA) ---------------- */}
              {activeTab === 'inventory' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Produtos & Controle de Estoque ({products.length})</h3>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Alerta visual automático quando a quantidade for menor ou igual ao estoque mínimo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(true)}
                      style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Novo Produto
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {products.map((prod) => {
                      const isLowStock = prod.stock <= prod.minStock;
                      return (
                        <div key={prod.id} style={{ background: '#ffffff', border: isLowStock ? '2px solid #ef4444' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', position: 'relative' }}>
                          {isLowStock && (
                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              ESTOQUE BAIXO!
                            </span>
                          )}
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=300&q=80'}
                            alt={prod.name}
                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                          />
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{prod.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{prod.category}</div>
                          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatCurrency(prod.price)}</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isLowStock ? '#dc2626' : '#16a34a' }}>
                                {prod.stock} em estoque
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mínimo: {prod.minStock}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={async () => {
                                const addQty = prompt(`Quantas unidades adicionar ao estoque de "${prod.name}"?`, '5');
                                if (addQty) {
                                  await fetch(`/api/admin/inventory/${prod.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ stock: prod.stock + Number(addQty) }),
                                  });
                                  loadAllData();
                                }
                              }}
                              style={{ flex: 1, padding: '0.4rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Repor Estoque
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Remover produto "${prod.name}"?`)) {
                                  await fetch(`/api/admin/inventory/${prod.id}`, { method: 'DELETE' });
                                  loadAllData();
                                }
                              }}
                              style={{ padding: '0.4rem 0.6rem', background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#991b1b', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------- 10. MARKETING & PROMOÇÕES (VERSÃO PAGA) ---------------- */}
              {activeTab === 'promotions' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Campanhas & Promoções ({promotions.length})</h3>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Exibidas no banner principal do portal do cliente para atração e fidelização.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPromotionModal(true)}
                      style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Nova Oferta / Combo
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {promotions.map((promo) => (
                      <div key={promo.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', borderLeft: `6px solid ${promo.color || '#b45309'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            {promo.tag}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: promo.active ? '#16a34a' : '#991b1b' }}>
                            {promo.active ? 'ATIVA' : 'PAUSADA'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{promo.title}</div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>{promo.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#d97706' }}>{formatCurrency(promo.price)}</div>
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/promotions/${promo.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ active: !promo.active }),
                              });
                              loadAllData();
                            }}
                            style={{ padding: '0.35rem 0.65rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {promo.active ? 'Pausar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- 11. RELATÓRIOS ANALÍTICOS (VERSÃO PAGA) ---------------- */}
              {activeTab === 'analytics' && isPro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
                      Desempenho Comparativo por Barbeiro (Faturamento vs Comissão Paga)
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                            <th style={{ padding: '0.75rem' }}>Profissional</th>
                            <th style={{ padding: '0.75rem' }}>Avaliação Média</th>
                            <th style={{ padding: '0.75rem' }}>Cortes Realizados</th>
                            <th style={{ padding: '0.75rem' }}>Faturamento Gerado</th>
                            <th style={{ padding: '0.75rem' }}>Comissão Paga</th>
                            <th style={{ padding: '0.75rem' }}>Margem Barbearia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData?.barberPerformance?.map((b: any) => (
                            <tr key={b.barberId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 700 }}>{b.name}</td>
                              <td style={{ padding: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ {b.rating}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{b.completedCuts} cortes</td>
                              <td style={{ padding: '0.75rem', fontWeight: 700 }}>{formatCurrency(b.faturamentoGerado)}</td>
                              <td style={{ padding: '0.75rem', color: '#d97706', fontWeight: 700 }}>{formatCurrency(b.comissaoPaga)}</td>
                              <td style={{ padding: '0.75rem', color: '#16a34a', fontWeight: 800 }}>{formatCurrency(b.lucroBarbearia)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
                      Serviços Mais Rentáveis e Mais Pedidos
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      {analyticsData?.serviceStats?.map((s: any) => (
                        <div key={s.serviceId} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Preço unitário: {formatCurrency(s.price)}
                          </div>
                          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700 }}>{s.totalVolume} vendas</span>
                            <span style={{ fontWeight: 800, color: '#16a34a' }}>{formatCurrency(s.totalRevenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 12. CONFIGURAÇÕES DA EMPRESA ---------------- */}
              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px' }}>
                  {/* Box de Links Exclusivos da Barbearia (Login e Agendamento) */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '0.35rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <LogIn size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                          Seus Links Exclusivos de Acesso
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                          Compartilhe esses links com sua equipe e com seus clientes.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.15rem' }}>
                      {/* Link Próprio da Área de Login */}
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <LogIn size={14} color="#d97706" /> Link da Área de Login da Sua Barbearia:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const slug = shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial');
                              copyToClipboard(`/b/${slug}/login`, 'admin_login');
                            }}
                            style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {copiedType === 'admin_login' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                            {copiedType === 'admin_login' ? 'Copiado!' : 'Copiar Link'}
                          </button>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#78350f' }}>
                          Página onde você (Admin), seus Barbeiros e seus Clientes realizam login exclusivo.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                          <code style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700, wordBreak: 'break-all' }}>
                            {typeof window !== 'undefined' ? `${window.location.origin}/b/${shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial')}/login` : `/b/sua-barbearia/login`}
                          </code>
                          <Link
                            href={`/b/${shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial')}/login`}
                            target="_blank"
                            style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', marginLeft: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Abrir <ExternalLink size={13} />
                          </Link>
                        </div>
                      </div>

                      {/* Link de Agendamento dos Clientes */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} color="#059669" /> Link de Agendamento Online (Clientes):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const slug = shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial');
                              copyToClipboard(`/b/${slug}`, 'admin_booking');
                            }}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {copiedType === 'admin_booking' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                            {copiedType === 'admin_booking' ? 'Copiado!' : 'Copiar Link'}
                          </button>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                          Link para colocar na bio do Instagram ou enviar no WhatsApp para seus clientes agendarem.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <code style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, wordBreak: 'break-all' }}>
                            {typeof window !== 'undefined' ? `${window.location.origin}/b/${shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial')}` : `/b/sua-barbearia`}
                          </code>
                          <Link
                            href={`/b/${shopConfig?.slug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial')}`}
                            target="_blank"
                            style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', marginLeft: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Abrir <ExternalLink size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
                      Dados Comerciais & Atendimento
                    </h3>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch('/api/admin/shop-config', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(shopConfig),
                        });
                        alert('Configurações salvas com sucesso!');
                        loadAllData();
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Nome da Barbearia</label>
                        <input
                          type="text"
                          value={shopConfig?.name || ''}
                          onChange={(e) => setShopConfig({ ...shopConfig, name: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Endereço Completo</label>
                        <input
                          type="text"
                          value={shopConfig?.address || ''}
                          onChange={(e) => setShopConfig({ ...shopConfig, address: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Telefone Fixo</label>
                          <input
                            type="text"
                            value={shopConfig?.phone || ''}
                            onChange={(e) => setShopConfig({ ...shopConfig, phone: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>WhatsApp Comercial</label>
                          <input
                            type="text"
                            value={shopConfig?.whatsapp || ''}
                            onChange={(e) => setShopConfig({ ...shopConfig, whatsapp: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Meta Financeira Mensal (R$)</label>
                        <input
                          type="number"
                          value={shopConfig?.monthlyRevenueGoal || 15000}
                          onChange={(e) => setShopConfig({ ...shopConfig, monthlyRevenueGoal: Number(e.target.value) })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{ marginTop: '0.5rem', background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Salvar Alterações
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL: CONFIRMAR RECEBIMENTO & FORMA DE PAGAMENTO */}
      {selectedAptForPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Confirmar Recebimento</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Cliente: <strong>{selectedAptForPayment.clientName}</strong><br />
              Serviço: <strong>{selectedAptForPayment.serviceName}</strong> ({formatCurrency(selectedAptForPayment.price)})
            </p>

            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Forma de Pagamento:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['pix', 'dinheiro', 'cartao', 'fiado'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentChoice(method)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: paymentChoice === method ? '2px solid #d97706' : '1px solid #cbd5e1',
                    background: paymentChoice === method ? '#fef3c7' : '#ffffff',
                    color: paymentChoice === method ? '#92400e' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedAptForPayment(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReceipt}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAR DESPESA */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Lançar Saída de Despesa</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'expense', label: expenseForm.label, value: Number(expenseForm.value), category: expenseForm.category }),
              });
              setShowExpenseModal(false);
              setExpenseForm({ label: '', value: '', category: 'Insumos' });
              loadAllData();
            }}>
              <input
                type="text"
                placeholder="Descrição (ex: Lâminas de barbear, Limpeza)"
                value={expenseForm.label}
                onChange={(e) => setExpenseForm({ ...expenseForm, label: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor em R$ (ex: 85.00)"
                value={expenseForm.value}
                onChange={(e) => setExpenseForm({ ...expenseForm, value: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#dc2626', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Salvar Despesa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAR ENTRADA AVULSA */}
      {showIncomeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Lançar Receita Avulsa</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'income', label: incomeForm.label, value: Number(incomeForm.value), category: incomeForm.category }),
              });
              setShowIncomeModal(false);
              setIncomeForm({ label: '', value: '', category: 'Avulso' });
              loadAllData();
            }}>
              <input
                type="text"
                placeholder="Descrição (ex: Venda de bebida balcão, Venda externa)"
                value={incomeForm.label}
                onChange={(e) => setIncomeForm({ ...incomeForm, label: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor em R$ (ex: 35.00)"
                value={incomeForm.value}
                onChange={(e) => setIncomeForm({ ...incomeForm, value: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowIncomeModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#16a34a', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Salvar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAR NOVO FIADO MANUAL */}
      {showManualFiadoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Lançamento Manual de Fiado</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'manual_fiado',
                  clientName: manualFiadoForm.clientName,
                  clientPhone: manualFiadoForm.clientPhone,
                  barberId: manualFiadoForm.barberId || barbers[0]?.id,
                  serviceName: manualFiadoForm.serviceName,
                  amount: Number(manualFiadoForm.amount),
                  notes: manualFiadoForm.notes,
                }),
              });
              setShowManualFiadoModal(false);
              loadAllData();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Nome do Cliente devedor"
                value={manualFiadoForm.clientName}
                onChange={(e) => setManualFiadoForm({ ...manualFiadoForm, clientName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Telefone / WhatsApp do cliente"
                value={manualFiadoForm.clientPhone}
                onChange={(e) => setManualFiadoForm({ ...manualFiadoForm, clientPhone: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <select
                value={manualFiadoForm.barberId}
                onChange={(e) => setManualFiadoForm({ ...manualFiadoForm, barberId: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Serviço ou motivo da pendência"
                value={manualFiadoForm.serviceName}
                onChange={(e) => setManualFiadoForm({ ...manualFiadoForm, serviceName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor do Fiado (R$)"
                value={manualFiadoForm.amount}
                onChange={(e) => setManualFiadoForm({ ...manualFiadoForm, amount: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowManualFiadoModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#0f172a', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Registrar Fiado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO BARBEIRO */}
      {showBarberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Cadastrar Novo Barbeiro</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/barbers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: `usr-barber-${Date.now()}`,
                  name: barberForm.name,
                  specialty: barberForm.specialty,
                  commission: Number(barberForm.commission),
                  phone: barberForm.phone,
                  email: barberForm.email,
                  active: true,
                }),
              });
              setShowBarberModal(false);
              loadAllData();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Nome completo do Barbeiro"
                value={barberForm.name}
                onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Especialidade (ex: Fade, Navalha, Barboterapia)"
                value={barberForm.specialty}
                onChange={(e) => setBarberForm({ ...barberForm, specialty: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>Porcentagem de Comissão (0 a 100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={barberForm.commission}
                  onChange={(e) => setBarberForm({ ...barberForm, commission: Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <input
                type="text"
                placeholder="Telefone / WhatsApp"
                value={barberForm.phone}
                onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowBarberModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#d97706', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Salvar Barbeiro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO SERVIÇO */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Cadastrar Novo Serviço</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: serviceForm.name,
                  description: serviceForm.description,
                  price: Number(serviceForm.price),
                  duration: Number(serviceForm.duration),
                  popular: serviceForm.popular,
                  active: true,
                }),
              });
              setShowServiceModal(false);
              loadAllData();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Nome do Serviço"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <textarea
                placeholder="Descrição do procedimento"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '70px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Duração (minutos)</label>
                  <select
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#d97706', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Salvar Serviço</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PRODUTO */}
      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Cadastrar Produto</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm),
              });
              setShowProductModal(false);
              loadAllData();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Nome do produto"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Categoria (ex: Pomada, Óleo, Shampoo)"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Estoque</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b' }}>Mínimo</label>
                  <input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowProductModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#d97706', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA PROMOÇÃO */}
      {showPromotionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Criar Promoção ou Combo</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promotionForm),
              });
              setShowPromotionModal(false);
              loadAllData();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Tag (ex: COMBO, VIP, SEXTA)"
                value={promotionForm.tag}
                onChange={(e) => setPromotionForm({ ...promotionForm, tag: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Título da oferta"
                value={promotionForm.title}
                onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <textarea
                placeholder="Descrição da oferta"
                value={promotionForm.description}
                onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '65px' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço promocional"
                value={promotionForm.price}
                onChange={(e) => setPromotionForm({ ...promotionForm, price: Number(e.target.value) })}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowPromotionModal(false)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#b45309', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Publicar Oferta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXTRATO MENSAL EXECUTIVO (VERSÃO PAGA) */}
      {showMonthlyStatementModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '560px',
            width: '100%',
            color: '#0f172a',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  PAINEL EXECUTIVO • RELATÓRIO OFICIAL
                </div>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                  Extrato Mensal Consolidado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMonthlyStatementModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.5rem 0' }}>
              Demonstrativo de receitas, despesas, comissões de barbeiros e resultado líquido da {shopConfig?.name || 'Marciel Barber'}.
            </p>

            {/* Grid de Métricas do Extrato */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Receita Bruta Total</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#d97706', marginTop: '0.25rem' }}>
                  {formatCurrency(financialData?.overview?.faturamentoBruto || 115)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Despesas Operacionais</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ef4444', marginTop: '0.25rem' }}>
                  {formatCurrency(financialData?.overview?.totalDespesas || 0)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Comissões da Equipe</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b45309', marginTop: '0.25rem' }}>
                  {formatCurrency(financialData?.overview?.totalComissoes || 57.5)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lucro Líquido Real</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginTop: '0.25rem' }}>
                  {formatCurrency(financialData?.overview?.faturamentoLiquido || 57.5)}
                </div>
              </div>
            </div>

            {/* Distribuição por Meio de Pagamento */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                Distribuição de Meios de Pagamento
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>PIX Instantâneo (85%)</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency((financialData?.overview?.faturamentoBruto || 115) * 0.85)}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#d97706', borderRadius: '999px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Cartão de Débito/Crédito (15%)</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency((financialData?.overview?.faturamentoBruto || 115) * 0.15)}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: '#3b82f6', borderRadius: '999px' }} />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Imprimir Extrato
              </button>
              <button
                type="button"
                onClick={() => setShowMonthlyStatementModal(false)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                }}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
