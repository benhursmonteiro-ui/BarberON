'use client';

import React, { useEffect, useState } from 'react';
import { 
  Appointment, 
  Barber, 
  BarbershopSettings, 
  Customer, 
  DashboardStats, 
  FinancialSummary, 
  FinancialTransaction, 
  Service 
} from '@/lib/types';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  Scissors, 
  Check, 
  RefreshCw, 
  PhoneCall, 
  UserCheck, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  MessageSquare, 
  History, 
  ShieldCheck,
  Send,
  Eye,
  Percent,
  Search,
  LogIn,
  Copy,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  slug?: string;
}

export default function AdminDashboard({ slug = 'imperial' }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  // Active Sub-tab
  const [subTab, setSubTab] = useState<'agenda' | 'financeiro' | 'barbeiros' | 'clientes' | 'lembretes' | 'servicos' | 'barbearia'>('agenda');

  // Filters for Agenda
  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [filterBarber, setFilterBarber] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // Customer History Modal
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<{ customer: Customer; appointments: Appointment[] } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Barber Form
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberPhone, setNewBarberPhone] = useState('');
  const [newBarberCommission, setNewBarberCommission] = useState('50');
  const [savingBarber, setSavingBarber] = useState(false);

  // New Expense/Transaction Form
  const [txType, setTxType] = useState<'despesa' | 'receita'>('despesa');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('produtos');
  const [txPaymentMethod, setTxPaymentMethod] = useState('pix');
  const [savingTx, setSavingTx] = useState(false);

  // Service form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState<'cabelo' | 'barba' | 'combo' | 'tratamento'>('cabelo');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePopular, setNewServicePopular] = useState(false);
  const [savingService, setSavingService] = useState(false);

  // Customer search & form
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Barbershop settings form
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopHours, setShopHours] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const query = `?slug=${encodeURIComponent(slug)}`;
      const [statsRes, aptsRes, srvRes, barRes, setRes, custRes, finRes, remRes] = await Promise.all([
        fetch(`/api/stats${query}`),
        fetch(`/api/appointments?date=${filterDate}&barberId=${filterBarber}&status=${filterStatus}&slug=${encodeURIComponent(slug)}`),
        fetch(`/api/services${query}`),
        fetch(`/api/barbers${query}`),
        fetch(`/api/barbershops/${slug}`),
        fetch(`/api/customers${query}`),
        fetch(`/api/financial${query}`),
        fetch(`/api/reminders${query}`),
      ]);

      const [statsData, aptsData, srvData, barData, setData, custData, finData, remData] = await Promise.all([
        statsRes.json(),
        aptsRes.json(),
        srvRes.json(),
        barRes.json(),
        setRes.json(),
        custRes.json(),
        finRes.json(),
        remRes.json(),
      ]);

      setStats(statsData);
      setAppointments(Array.isArray(aptsData) ? aptsData : []);
      setServices(Array.isArray(srvData) ? srvData : []);
      setBarbers(Array.isArray(barData) ? barData : []);
      setSettings(setData);
      setCustomers(Array.isArray(custData) ? custData : []);
      setFinancial(finData);
      setReminders(Array.isArray(remData) ? remData : []);

      if (setData) {
        setShopName(setData.name || '');
        setShopAddress(setData.address || '');
        setShopPhone(setData.phone || '');
        setShopHours(setData.openHours || '');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterDate, filterBarber, filterStatus]);

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        fetchDashboardData();
        showToast(`Agendamento atualizado para "${status}".`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    }
  };

  // CUSTOMER HISTORY
  const handleOpenCustomerHistory = async (customer: Customer) => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/customers/${encodeURIComponent(customer.phone)}/history?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setSelectedCustomerHistory({
        customer,
        appointments: data.appointments || [],
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar histórico do cliente.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // CREATE BARBER (MULTI-BARBERS NO PRO)
  const handleCreateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName || !newBarberPhone) {
      alert('Nome e WhatsApp do barbeiro são obrigatórios.');
      return;
    }

    setSavingBarber(true);
    try {
      const res = await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: settings?.id,
          slug,
          name: newBarberName,
          specialty: newBarberSpecialty || 'Barbeiro Profissional',
          phone: newBarberPhone,
          commissionRate: parseFloat(newBarberCommission) || 50,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          workingHours: {
            start: '09:00',
            end: '19:00',
            lunchStart: '12:00',
            lunchEnd: '13:00',
          },
          daysOfWeek: [1, 2, 3, 4, 5, 6],
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setBarbers((prev) => [...prev, added]);
        setNewBarberName('');
        setNewBarberSpecialty('');
        setNewBarberPhone('');
        setNewBarberCommission('50');
        showToast('Novo barbeiro cadastrado na equipe com sucesso!');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar barbeiro.');
    } finally {
      setSavingBarber(false);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm('Deseja realmente remover este barbeiro da equipe?')) return;
    try {
      const res = await fetch(`/api/barbers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBarbers((prev) => prev.filter((b) => b.id !== id));
        showToast('Barbeiro removido com sucesso.');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir barbeiro.');
    }
  };

  // FINANCIAL TRANSACTION (DESPESA / RECEITA)
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) {
      alert('Preencha descrição e valor.');
      return;
    }

    setSavingTx(true);
    try {
      const res = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: settings?.id,
          slug,
          type: txType,
          description: txDesc,
          amount: parseFloat(txAmount),
          category: txCategory,
          paymentMethod: txPaymentMethod,
          date: todayStr,
        }),
      });

      if (res.ok) {
        setTxDesc('');
        setTxAmount('');
        showToast('Lançamento financeiro cadastrado com sucesso!');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar transação.');
    } finally {
      setSavingTx(false);
    }
  };

  // SERVICES
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !newServiceDuration) {
      alert('Preencha nome, preço e duração.');
      return;
    }

    setSavingService(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: settings?.id,
          slug,
          name: newServiceName,
          price: parseFloat(newServicePrice),
          durationMinutes: parseInt(newServiceDuration, 10),
          category: newServiceCategory,
          description: newServiceDesc,
          popular: newServicePopular,
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setServices((prev) => [...prev, added]);
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDesc('');
        setNewServicePopular(false);
        showToast('Serviço cadastrado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar serviço.');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Deseja excluir este serviço do catálogo?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        showToast('Serviço removido.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir serviço.');
    }
  };

  // CUSTOMERS
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert('Nome e WhatsApp são obrigatórios.');
      return;
    }

    setSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: settings?.id,
          slug,
          name: newCustName,
          phone: newCustPhone,
          email: newCustEmail,
          notes: newCustNotes,
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setCustomers((prev) => [added, ...prev.filter((c) => c.id !== added.id)]);
        setNewCustName('');
        setNewCustPhone('');
        setNewCustEmail('');
        setNewCustNotes('');
        showToast('Cliente cadastrado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente.');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Deseja remover este cliente?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        showToast('Cliente excluído.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir cliente.');
    }
  };

  // SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/barbershops/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shopName,
          address: shopAddress,
          phone: shopPhone,
          openHours: shopHours,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        showToast('Dados da barbearia atualizados!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar barbearia.');
    } finally {
      setSavingSettings(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateBR = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const sendWhatsAppNotification = (apt: Appointment) => {
    const cleanPhone = (apt.customerPhone || apt.clientPhone || '').replace(/\D/g, '');
    const clientName = apt.customerName || apt.clientName || 'Cliente';
    const msg = `Olá, ${clientName}! 💈 Aqui é da *${settings?.name || 'Barbearia'}*. Confirmamos seu horário agendado para o serviço *${apt.serviceName}* com o barbeiro *${apt.barberName}* em *${formatDateBR(apt.date)}* às *${apt.time}*. Te aguardamos!`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const filteredCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
      )
    : customers;

  // REGRAS DE PLANO FREE vs PRO
  const isFree = settings?.plan === 'FREE' || stats?.plan === 'FREE';
  const monthAppointmentsUsed = stats?.monthAppointmentsCount || appointments.filter((a) => {
    const m = todayStr.substring(0, 7);
    return a.date?.startsWith(m) && a.status !== 'cancelado';
  }).length;
  const freeMonthlyLimit = 30;
  const usagePercentage = Math.min(100, Math.round((monthAppointmentsUsed / freeMonthlyLimit) * 100));
  const isLimitReached = isFree && monthAppointmentsUsed >= freeMonthlyLimit;

  const handleUpgradeToPro = async () => {
    try {
      const shopIdentifier = settings?.slug || slug;
      const res = await fetch(`/api/barbershops/${encodeURIComponent(shopIdentifier)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PRO' }),
      });
      if (res.ok) {
        showToast('🎉 Parabéns! Sua barbearia foi promovida para o Plano PRO com agendamentos ilimitados!');
        fetchDashboardData();
      } else {
        alert('Erro ao atualizar para o plano PRO.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar upgrade.');
    }
  };

  const UpgradePlanCard = ({ title, description, features }: { title: string; description: string; features: string[] }) => (
    <div style={{
      background: '#ffffff',
      border: '2px solid #fbbf24',
      borderRadius: '16px',
      padding: '3rem 2rem',
      textAlign: 'center',
      maxWidth: '650px',
      margin: '2rem auto',
      boxShadow: '0 20px 25px -5px rgba(217, 119, 6, 0.1)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
        boxShadow: '0 10px 20px rgba(217, 119, 6, 0.3)'
      }}>
        <Sparkles size={32} />
      </div>

      <span style={{
        background: 'rgba(217, 119, 6, 0.15)',
        color: '#b45309',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 800,
        letterSpacing: '0.04em'
      }}>
        RECURSO DO PLANO PRO
      </span>

      <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '1rem 0 0.5rem 0' }}>
        {title}
      </h3>

      <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto 1.75rem auto' }}>
        {description}
      </p>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.75rem',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Vantagens exclusivas do BarberOn PRO:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#1e293b' }}>
              <CheckCircle size={16} color="#16a34a" /> {feat}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleUpgradeToPro}
        style={{
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '0.85rem 2rem',
          borderRadius: '10px',
          fontSize: '0.95rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Sparkles size={18} /> Ativar Plano PRO para {settings?.name || 'sua barbearia'}
      </button>
    </div>
  );

  return (
    <div>
      {/* Banner Principal de Identificação do Plano */}
      {isFree ? (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <ShieldCheck size={16} /> PLANO GRATUITO
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {settings?.name || 'Sua Barbearia'} • Plano Gratuito (Starter)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Limite de 30 agendamentos/mês • Gestão de serviços e agenda liberados
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Medidor de Agendamentos */}
            <div style={{ minWidth: '190px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                <span style={{ color: isLimitReached ? '#dc2626' : '#475569' }}>Cota Mensal:</span>
                <span style={{ color: isLimitReached ? '#dc2626' : '#0f172a' }}>{monthAppointmentsUsed} / {freeMonthlyLimit}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${usagePercentage}%`,
                  height: '100%',
                  background: isLimitReached ? '#dc2626' : usagePercentage > 80 ? '#f59e0b' : '#10b981',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {isLimitReached && (
                <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                  Limite de 30 cortes atingido!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleUpgradeToPro}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
              }}
            >
              <Sparkles size={16} /> Upgrade PRO (Ilimitado)
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#f8fafc',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
            }}>
              <Sparkles size={16} color="#fbbf24" fill="#fbbf24" /> BARBERON PRO
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {settings?.name || 'Barbearia Imperial'} • Versão PRO Completa
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Agendamentos ilimitados • Múltiplos barbeiros • Gestão financeira com comissões • Lembretes WhatsApp
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>
                Barbeiros na Equipe
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {barbers.length} profissionais
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>
                Lucro Líquido Mês
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)' }}>
                {financial ? formatCurrency(financial.netProfit) : 'R$ 0,00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="section-title">
            Painel do Administrador {isFree ? '(Plano Gratuito)' : 'BarberOn PRO'}
          </h2>
          <p className="section-desc">
            {isFree 
              ? 'Gerenciamento de agenda e cadastro de serviços da barbearia.' 
              : 'Controle completo de agenda, financeiro, clientes, equipe e automações.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pill-btn ${subTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setSubTab('agenda')}
          >
            📅 Agenda
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setSubTab('servicos')}
          >
            ✂️ Serviços ({services.length})
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'barbeiros' ? 'active' : ''}`}
            onClick={() => setSubTab('barbeiros')}
          >
            💈 Barbeiros {isFree ? `(${barbers.length}/1)` : `(${barbers.length})`}
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => setSubTab('financeiro')}
            style={isFree ? { borderColor: '#fcd34d', color: '#b45309' } : {}}
          >
            📊 Financeiro {isFree && '🔒 PRO'}
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setSubTab('clientes')}
            style={isFree ? { borderColor: '#fcd34d', color: '#b45309' } : {}}
          >
            👥 Clientes {isFree && '🔒 PRO'}
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'lembretes' ? 'active' : ''}`}
            onClick={() => setSubTab('lembretes')}
            style={isFree ? { borderColor: '#fcd34d', color: '#b45309' } : {}}
          >
            🔔 Lembretes {isFree && '🔒 PRO'}
          </button>
          <button
            type="button"
            className={`pill-btn ${subTab === 'barbearia' ? 'active' : ''}`}
            onClick={() => setSubTab('barbearia')}
          >
            ⚙️ Barbearia
          </button>
          <button
            type="button"
            className="btn-icon-action"
            title="Atualizar dados"
            onClick={fetchDashboardData}
            style={{ width: '38px', height: '38px' }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats ? stats.todayAppointmentsCount : 0}</span>
            <span className="stat-label">Agendamentos Hoje</span>
          </div>
        </div>

        {isFree ? (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: isLimitReached ? '#fee2e2' : '#f0fdf4', color: isLimitReached ? '#b91c1c' : '#166534' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{monthAppointmentsUsed} / 30</span>
                <span className="stat-label">Cota Mensal (Plano Gratuito)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Scissors size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{services.length}</span>
                <span className="stat-label">Serviços Cadastrados</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{barbers.length} / 1</span>
                <span className="stat-label">Barbeiro Cadastrado (Máx 1)</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-text)' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats ? formatCurrency(stats.monthRevenue) : 'R$ 0,00'}</span>
                <span className="stat-label">Faturamento Bruto Mês</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <TrendingDown size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{financial ? formatCurrency(financial.totalExpenses) : 'R$ 0,00'}</span>
                <span className="stat-label">Despesas no Mês</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-text)' }}>
                <Percent size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{financial ? formatCurrency(financial.totalCommissions) : 'R$ 0,00'}</span>
                <span className="stat-label">Comissões a Pagar</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SUB-TAB 1: AGENDA COMPLETA */}
      {subTab === 'agenda' && (
        <div className="table-card">
          <div className="table-header-bar">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Agenda Geral ({appointments.length} atendimentos)
            </h3>

            <div className="filters-row">
              <input
                type="date"
                className="custom-input"
                style={{ padding: '0.45rem 0.75rem', width: 'auto', fontSize: '0.85rem' }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />

              <button
                type="button"
                className="pill-btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                onClick={() => setFilterDate('')}
              >
                Todas as Datas
              </button>

              <select
                className="filter-select"
                value={filterBarber}
                onChange={(e) => setFilterBarber(e.target.value)}
              >
                <option value="all">Todos os Barbeiros</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="concluido">Concluídos</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando agendamentos...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum agendamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Barbeiro</th>
                    <th>Valor</th>
                    <th>Comissão</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{apt.time}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDateBR(apt.date)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.customerName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{apt.customerPhone}</div>
                        {apt.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold-text)', fontStyle: 'italic' }}>
                            Obs: {apt.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{apt.serviceName}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                          💈 {apt.barberName}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {formatCurrency(apt.totalAmount ?? apt.price ?? 0)}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {apt.barberCommission ? formatCurrency(apt.barberCommission) : '-'}
                      </td>
                      <td>
                        <span className={`badge-status ${apt.status}`}>{apt.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-icon-action whatsapp"
                            title="Lembrar via WhatsApp"
                            onClick={() => sendWhatsAppNotification(apt)}
                          >
                            <PhoneCall size={16} />
                          </button>

                          {apt.status === 'pendente' && (
                            <button
                              type="button"
                              className="btn-icon-action success"
                              title="Confirmar"
                              onClick={() => handleUpdateStatus(apt.id, 'confirmado')}
                            >
                              <Check size={16} />
                            </button>
                          )}

                          {apt.status !== 'concluido' && apt.status !== 'cancelado' && (
                            <button
                              type="button"
                              className="btn-icon-action success"
                              title="Concluir Atendimento"
                              onClick={() => handleUpdateStatus(apt.id, 'concluido')}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {apt.status !== 'cancelado' && (
                            <button
                              type="button"
                              className="btn-icon-action danger"
                              title="Cancelar"
                              onClick={() => handleUpdateStatus(apt.id, 'cancelado')}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: FINANCEIRO & RELATÓRIOS PRO */}
      {subTab === 'financeiro' && (
        isFree ? (
          <UpgradePlanCard
            title="Controle Financeiro & Comissões"
            description="O módulo financeiro com receitas, fluxo de caixa e cálculo automatizado de comissões por barbeiro está disponível exclusivamente no Plano PRO."
            features={[
              'Fluxo de caixa detalhado com receitas e despesas da barbearia',
              'Relatório automatizado de comissões da equipe de barbeiros',
              'Indicadores de faturamento bruto e lucro líquido mensal',
              'Faturamento e agendamentos ilimitados para o seu negócio'
            ]}
          />
        ) : financial ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Resumo Consolidado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="summary-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Receita Bruta Total</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                {formatCurrency(financial.totalRevenue)}
              </div>
            </div>

            <div className="summary-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>(-) Comissões da Equipe</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.35rem' }}>
                {formatCurrency(financial.totalCommissions)}
              </div>
            </div>

            <div className="summary-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>(-) Despesas Operacionais</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.35rem' }}>
                {formatCurrency(financial.totalExpenses)}
              </div>
            </div>

            <div className="summary-card" style={{ padding: '1.5rem', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--success-text)', fontWeight: 700 }}>(=) Lucro Líquido da Barbearia</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--success)', marginTop: '0.35rem' }}>
                {formatCurrency(financial.netProfit)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2rem' }}>
            {/* Relatório de Comissões por Barbeiro */}
            <div className="table-card" style={{ marginBottom: 0 }}>
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Comissões a Pagar por Barbeiro</h3>
              </div>

              <div style={{ padding: '1rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Barbeiro</th>
                      <th>Cortes</th>
                      <th>Faturamento</th>
                      <th>Taxa</th>
                      <th>Comissão Devida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financial.commissionsByBarber.map((cb: any) => (
                      <tr key={cb.barberId}>
                        <td style={{ fontWeight: 700 }}>{cb.barberName}</td>
                        <td>{cb.cutsCount} atendimentos</td>
                        <td>{formatCurrency(cb.totalGenerated)}</td>
                        <td>{cb.commissionRate}%</td>
                        <td style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {formatCurrency(cb.commissionDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cadastro de Despesa / Movimentação */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Lançar Despesa ou Saída
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Cadastre custos (produtos, lâminas, energia, aluguel) para cálculo do lucro real.
              </p>

              <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Descrição do Gasto *
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Pomadas, toalhas, conta de luz..."
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="custom-input"
                      placeholder="150.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      Categoria
                    </label>
                    <select
                      className="custom-input"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                    >
                      <option value="produtos">Produtos & Cosméticos</option>
                      <option value="aluguel">Aluguel do Ponto</option>
                      <option value="energia">Energia & Água</option>
                      <option value="manutencao">Manutenção de Máquinas</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingTx}
                >
                  <Plus size={18} /> {savingTx ? 'Salvando...' : 'Lançar Despesa'}
                </button>
              </form>
            </div>
          </div>

          {/* Histórico de Transações Recentes */}
          <div className="table-card">
            <div className="table-header-bar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fluxo de Caixa do Mês (Extrato)</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Forma</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {financial.recentTransactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td>{formatDateBR(tx.date)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          color: tx.type === 'receita' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{tx.category}</td>
                      <td>{tx.description}</td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.82rem' }}>{tx.paymentMethod}</td>
                      <td style={{
                        fontWeight: 800,
                        color: tx.type === 'receita' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null)}

      {/* SUB-TAB 3: EQUIPE DE BARBEIROS (MÚLTIPLOS NO PRO) */}
      {subTab === 'barbeiros' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div className="table-card" style={{ marginBottom: 0 }}>
            <div className="table-header-bar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Barbeiros da Equipe ({barbers.length})</h3>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {barbers.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="barber-avatar-wrap" style={{ width: '60px', height: '60px', margin: 0 }}>
                      <img src={b.avatar} alt={b.name} className="barber-avatar-img" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{b.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.specialty}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '0.25rem' }}>
                        Comissão: {b.commissionRate || 50}% • 📱 {b.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {barbers.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon-action danger"
                        title="Remover Barbeiro"
                        onClick={() => handleDeleteBarber(b.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Cadastro de Novo Barbeiro */}
          <div style={{
            background: '#ffffff',
            border: isFree && barbers.length >= 1 ? '1.5px solid #fcd34d' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {isFree && barbers.length >= 1 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(217, 119, 6, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.15rem auto'
                }}>
                  <Scissors size={26} />
                </div>
                <span style={{
                  background: 'rgba(217, 119, 6, 0.15)',
                  color: '#b45309',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}>
                  PLANO GRATUITO: 1 BARBEIRO
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.4rem 0' }}>
                  Limite de 1 Barbeiro Atingido
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  O <strong>Plano Gratuito</strong> permite 1 profissional da barbearia ativo. Para cadastrar múltiplos barbeiros na equipe, gerenciar agendas individuais e comissões automáticas, faça o upgrade para o <strong>BarberOn PRO</strong>!
                </p>
                <button
                  type="button"
                  onClick={handleUpgradeToPro}
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  <Sparkles size={16} /> Liberar Equipe Ilimitada no PRO
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Adicionar Novo Barbeiro
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  No plano PRO você pode cadastrar quantos barbeiros desejar, cada um com sua comissão e agenda.
                </p>

                <form onSubmit={handleCreateBarber} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Ex: Matheus Duarte"
                      value={newBarberName}
                      onChange={(e) => setNewBarberName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      Especialidades *
                    </label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Ex: Cortes Modernos, Visagismo e Fade"
                      value={newBarberSpecialty}
                      onChange={(e) => setNewBarberSpecialty(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        className="custom-input"
                        placeholder="11988884444"
                        value={newBarberPhone}
                        onChange={(e) => setNewBarberPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                        Comissão (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="custom-input"
                        placeholder="50"
                        value={newBarberCommission}
                        onChange={(e) => setNewBarberCommission(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={savingBarber}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <Plus size={18} /> {savingBarber ? 'Cadastrando...' : 'Cadastrar Barbeiro'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CLIENTES & HISTÓRICO COMPLETO */}
      {subTab === 'clientes' && (
        isFree ? (
          <UpgradePlanCard
            title="CRM de Clientes & Ficha Técnica"
            description="No Plano Gratuito o foco é na gestão ágil de agenda e serviços. A base de clientes com histórico de visitas, faturamento individual e ficha técnica de corte é exclusiva do Plano PRO."
            features={[
              'Histórico detalhado de todos os atendimentos e cortes por cliente',
              'Ficha técnica com preferências de cortes, visagismo e barba',
              'Métricas de clientes mais fiéis e ticket médio de consumo',
              'Opção de bloqueio preventivo e anotações confidenciais'
            ]}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2rem' }}>
          <div className="table-card" style={{ marginBottom: 0 }}>
            <div className="table-header-bar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Base de Clientes ({customers.length})</h3>
              
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  placeholder="Buscar cliente..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '550px', overflowY: 'auto' }}>
              {filteredCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Nenhum cliente encontrado.
                </div>
              ) : (
                filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      background: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>{cust.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        📱 {cust.phone} {cust.email && `• ✉️ ${cust.email}`}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        Total de Cortes: <strong>{cust.totalVisits}</strong> {cust.lastVisit && `• Último: ${formatDateBR(cust.lastVisit)}`}
                      </div>
                      {cust.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold-text)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                          Ficha: {cust.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', gap: '0.35rem' }}
                        title="Ver Histórico Completo de Cortes"
                        onClick={() => handleOpenCustomerHistory(cust)}
                      >
                        <History size={15} /> Histórico
                      </button>

                      <a
                        href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon-action whatsapp"
                        title="Conversar no WhatsApp"
                      >
                        <PhoneCall size={16} />
                      </a>

                      <button
                        type="button"
                        className="btn-icon-action danger"
                        title="Excluir Cliente"
                        onClick={() => handleDeleteCustomer(cust.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Cadastro de Cliente */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Cadastrar Novo Cliente
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Salve dados de contato e ficha de preferências de corte do cliente.
            </p>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Ex: Lucas Ferreira"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  WhatsApp / Celular *
                </label>
                <input
                  type="tel"
                  className="custom-input"
                  placeholder="11988887777"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  className="custom-input"
                  placeholder="cliente@email.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Ficha Técnica & Observações
                </label>
                <textarea
                  rows={3}
                  className="custom-input"
                  placeholder="Ex: Corte degrade navalhado na 0.5, barba com linha reta..."
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={savingCustomer}
              >
                <Plus size={18} /> {savingCustomer ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </form>
          </div>
        </div>
        )
      )}

      {/* MODAL: HISTÓRICO COMPLETO DO CLIENTE */}
      {selectedCustomerHistory && (
        <div className="modal-overlay" onClick={() => setSelectedCustomerHistory(null)}>
          <div className="modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Histórico de Atendimentos</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Cliente: <strong>{selectedCustomerHistory.customer.name}</strong> • 📱 {selectedCustomerHistory.customer.phone}
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedCustomerHistory(null)}
              >
                <XCircle size={22} />
              </button>
            </div>

            {selectedCustomerHistory.appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Nenhum atendimento registrado até o momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto' }}>
                {selectedCustomerHistory.appointments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{a.serviceName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Barbeiro: <strong>{a.barberName}</strong> • {formatDateBR(a.date)} às {a.time}
                      </div>
                      {a.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold-text)', marginTop: '0.25rem' }}>
                          Nota: {a.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(a.totalAmount ?? a.price ?? 0)}</div>
                      <span className={`badge-status ${a.status}`} style={{ marginTop: '0.3rem' }}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LEMBRETES AUTOMÁTICOS WHATSAPP */}
      {subTab === 'lembretes' && (
        isFree ? (
          <UpgradePlanCard
            title="Automação & Lembretes no WhatsApp"
            description="Reduza até 80% das faltas e atrasos na sua barbearia disparando mensagens automáticas de confirmação e lembretes de horário pré-corte via WhatsApp."
            features={[
              'Disparo de lembretes com 1 clique para agendamentos de hoje e amanhã',
              'Mensagens personalizadas com o nome da barbearia, horário e barbeiro',
              'Canal direto com o cliente para confirmações e reagendamento ágil',
              'Disparos e agendamentos ilimitados no plano PRO'
            ]}
          />
        ) : (
          <div className="table-card">
            <div className="table-header-bar">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Disparo de Lembretes Automáticos ({reminders.length} pendentes)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Envie lembretes com 1 clique para os clientes agendados para hoje e amanhã no WhatsApp.
                </p>
              </div>
            </div>

            {reminders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum lembrete pendente para os horários de hoje ou amanhã.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Quando</th>
                      <th>Horário</th>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>Barbeiro</th>
                      <th style={{ textAlign: 'right' }}>Ação de Disparo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: r.type === 'hoje' ? 'var(--warning-light)' : 'var(--bg-subtle)',
                            color: r.type === 'hoje' ? 'var(--warning-text)' : 'var(--text-main)',
                            textTransform: 'uppercase'
                          }}>
                            {r.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{r.time}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.customerName}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.customerPhone}</div>
                        </td>
                        <td>{r.serviceName}</td>
                        <td>💈 {r.barberName}</td>
                        <td style={{ textAlign: 'right' }}>
                          <a
                            href={r.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp"
                            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                          >
                            <Send size={15} /> Disparar no WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* SUB-TAB 6: SERVIÇOS */}
      {subTab === 'servicos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div className="table-card" style={{ marginBottom: 0 }}>
            <div className="table-header-bar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Serviços Ativos ({services.length})</h3>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {services.map((srv) => (
                <div
                  key={srv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{srv.name}</span>
                      {srv.popular && <span className="popular-badge">Mais Escolhido</span>}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {srv.description}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.35rem' }}>
                      Duração: <strong>{srv.durationMinutes} min</strong> • Categoria: <strong>{srv.category}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                      {formatCurrency(srv.price)}
                    </span>
                    <button
                      type="button"
                      className="btn-icon-action danger"
                      title="Excluir Serviço"
                      onClick={() => handleDeleteService(srv.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Cadastrar Novo Serviço
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Defina os procedimentos, valores e duração para agendamento online.
            </p>

            <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Ex: Corte Infantil, Barba Terapia..."
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    placeholder="45.00"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    className="custom-input"
                    placeholder="30"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Categoria *
                </label>
                <select
                  className="custom-input"
                  value={newServiceCategory}
                  onChange={(e: any) => setNewServiceCategory(e.target.value)}
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="barba">Barba</option>
                  <option value="combo">Combo</option>
                  <option value="tratamento">Tratamento</option>
                </select>
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  className="custom-input"
                  placeholder="Diferenciais do procedimento..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={newServicePopular}
                  onChange={(e) => setNewServicePopular(e.target.checked)}
                />
                Marcar como "Mais Escolhido"
              </label>

              <button
                type="submit"
                className="btn-primary"
                disabled={savingService}
              >
                <Plus size={18} /> {savingService ? 'Salvando...' : 'Adicionar Serviço'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: CONFIGURAÇÕES DA BARBEARIA */}
      {subTab === 'barbearia' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card com os Links Oficiais e Próprios da Barbearia */}
          <div style={{
            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Links Próprios da Sua Barbearia
                </h3>
              </div>
              <span style={{
                background: settings?.plan === 'PRO' ? 'rgba(217, 119, 6, 0.3)' : 'rgba(37, 99, 235, 0.3)',
                color: settings?.plan === 'PRO' ? '#fbbf24' : '#60a5fa',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}>
                PLANO {settings?.plan || 'PRO'}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Tanto no plano <strong>FREE</strong> quanto no <strong>PRO</strong>, sua barbearia possui links próprios dedicados para agendamento dos clientes e área de login da equipe:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Link de Agendamento */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} color="#34d399" /> Link de Agendamento (Clientes):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/b/${slug}`;
                        navigator.clipboard.writeText(url);
                        setCopiedLinkType('booking');
                        setTimeout(() => setCopiedLinkType(null), 2500);
                      }}
                      style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {copiedLinkType === 'booking' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                      {copiedLinkType === 'booking' ? 'Copiado!' : 'Copiar'}
                    </button>
                    <a
                      href={`/b/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <code style={{ fontSize: '0.82rem', color: '#38bdf8' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/b/${slug}` : `/b/${slug}`}
                </code>
              </div>

              {/* Link Próprio da Área de Login */}
              <div style={{ background: 'rgba(217, 119, 6, 0.12)', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fde68a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LogIn size={14} color="#fbbf24" /> Link Próprio da Área de Login (Dono, Barbeiros e Clientes):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/b/${slug}/login`;
                        navigator.clipboard.writeText(url);
                        setCopiedLinkType('login');
                        setTimeout(() => setCopiedLinkType(null), 2500);
                      }}
                      style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {copiedLinkType === 'login' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                      {copiedLinkType === 'login' ? 'Copiado!' : 'Copiar Link de Login'}
                    </button>
                    <a
                      href={`/b/${slug}/login`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#fbbf24', display: 'flex', alignItems: 'center' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <code style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/b/${slug}/login` : `/b/${slug}/login`}
                </code>
              </div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Dados da Barbearia ({settings?.plan === 'PRO' ? 'BarberOn PRO' : 'BarberOn FREE'})
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Estas informações aparecem para os clientes no agendamento e nas mensagens de WhatsApp.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Nome da Barbearia *
                </label>
                <input
                  type="text"
                  className="custom-input"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  className="custom-input"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  WhatsApp Comercial da Barbearia *
                </label>
                <input
                  type="tel"
                  className="custom-input"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Horário de Funcionamento *
                </label>
                <input
                  type="text"
                  className="custom-input"
                  value={shopHours}
                  onChange={(e) => setShopHours(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={savingSettings}
              >
                {savingSettings ? 'Salvando...' : 'Salvar Dados da Barbearia'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast-notice">{toastMsg}</div>}
    </div>
  );
}
