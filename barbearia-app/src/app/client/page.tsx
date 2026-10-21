'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  User, 
  ShoppingBag, 
  Bell, 
  Star, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  Phone,
  RefreshCw,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BookingFlow from '@/components/BookingFlow';

export default function ClientPortalPage() {
  const { user, shopSlug, updateUserProfile, demoPlan, setDemoPlan } = useAuth();
  const searchParams = useSearchParams();
  const urlPlan = searchParams.get('plan') as 'PRO' | 'FREE' | null;

  useEffect(() => {
    if (urlPlan === 'PRO' || urlPlan === 'FREE') {
      setPreviewPlan(urlPlan);
      setDemoPlan(urlPlan);
    }
  }, [urlPlan, setDemoPlan]);

  const [currentShop, setCurrentShop] = useState<any>(null);
  const [previewPlan, setPreviewPlan] = useState<'PRO' | 'FREE' | null>(null);
  const isDemo = !shopSlug && !user?.barbershopId;
  const currentPlan = (urlPlan || previewPlan)
    ? (urlPlan || previewPlan!)
    : (isDemo ? (demoPlan || 'FREE') : (currentShop?.plan || (user as any)?.plan || 'FREE'));
  const isPro = currentPlan === 'PRO';

  const [activeTab, setActiveTab] = useState<
    'booking' | 'my-appointments' | 'home' | 'history' | 'store' | 'notifications' | 'profile'
  >('booking');

  // Booking Flow Steps (1 to 5)
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookingLoadingSlots, setBookingLoadingSlots] = useState<boolean>(false);
  const [bookingFeedback, setBookingFeedback] = useState<string>('');

  // Cart & Store
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string>('');

  // Review Modal State
  const [reviewApt, setReviewApt] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Loaded Data
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  useEffect(() => {
    async function loadShopInfo() {
      const targetSlug = shopSlug || (user?.barbershopId === 'shop-navalha' ? 'navalha-de-ouro' : 'imperial');
      try {
        const res = await fetch(`/api/barbershops/${targetSlug}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentShop(data);
        }
      } catch (err) {
        console.error('Erro ao carregar barbearia:', err);
      }
    }
    loadShopInfo();
  }, [shopSlug, user]);

  useEffect(() => {
    loadClientData();
  }, [user]);

  // Tab guard: redirect from pro-only tabs if on free plan
  useEffect(() => {
    if (!isPro && (activeTab === 'store' || activeTab === 'notifications')) {
      setActiveTab('home');
    }
  }, [isPro, activeTab]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const activeShopParam = shopSlug ? `slug=${encodeURIComponent(shopSlug)}` : (user?.barbershopId ? `shopId=${encodeURIComponent(user.barbershopId)}` : '');
      const shopQuery = activeShopParam ? `?${activeShopParam}` : '';
      const aptQuery = activeShopParam ? `&${activeShopParam}` : '';

      const [srvRes, bRes, pRes, promoRes, aptRes, notifRes] = await Promise.all([
        fetch(`/api/client/booking${shopQuery}`),
        fetch(`/api/admin/barbers${shopQuery}`),
        fetch('/api/client/products'),
        fetch('/api/admin/promotions'),
        fetch(`/api/client/appointments?clientId=${user?.id || 'usr-client-1'}${aptQuery}`),
        fetch(`/api/client/notifications?userId=${user?.id || 'usr-client-1'}`),
      ]);

      const [srvData, bData, pData, promoData, aptData, notifData] = await Promise.all([
        srvRes.json(),
        bRes.json(),
        pRes.json(),
        promoRes.json(),
        aptRes.json(),
        notifRes.json(),
      ]);

      setServices(srvData.services || []);
      setBarbers(Array.isArray(bData) ? bData.filter((b: any) => b.active) : []);
      setProducts(Array.isArray(pData) ? pData : []);
      setPromotions(Array.isArray(promoData) ? promoData.filter((p: any) => p.active) : []);
      setMyAppointments(Array.isArray(aptData) ? aptData : []);
      setNotifications(Array.isArray(notifData) ? notifData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Booking Flow: fetch available slots dynamically respecting service duration & blocks
  const fetchAvailableSlots = async (barberId: string, date: string, duration: number) => {
    try {
      setBookingLoadingSlots(true);
      const res = await fetch(`/api/client/booking?barberId=${barberId}&date=${date}&duration=${duration}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoadingSlots(false);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedBarber && selectedService) {
      fetchAvailableSlots(selectedBarber.id, date, selectedService.duration || 30);
    }
  };

  const handleSelectBarber = (barber: any) => {
    setSelectedBarber(barber);
    setSelectedTime('');
    if (selectedDate && selectedService) {
      fetchAvailableSlots(barber.id, selectedDate, selectedService.duration || 30);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    try {
      setBookingFeedback('Criando seu agendamento...');
      const res = await fetch('/api/client/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id || 'usr-client-1',
          clientName: user?.name || 'Cliente BarberOn',
          clientPhone: user?.phone || '11999991111',
          clientEmail: user?.email,
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime,
          notes: bookingNotes,
          slug: currentShop?.slug || shopSlug || 'imperial',
          barbershopId: currentShop?.id || user?.barbershopId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Agendamento realizado com sucesso!');
        setBookingStep(1);
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate('');
        setSelectedTime('');
        setBookingNotes('');
        setBookingFeedback('');
        loadClientData();
        setActiveTab('my-appointments');
      } else {
        alert(data.error || 'Erro ao realizar agendamento.');
        setBookingFeedback('');
      }
    } catch (err) {
      console.error(err);
      alert('Falha ao conectar ao servidor.');
      setBookingFeedback('');
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este horário?')) return;
    try {
      const res = await fetch('/api/client/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        alert('Agendamento cancelado com sucesso.');
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Post-service review
  const handleSubmitReview = async () => {
    if (!reviewApt) return;
    try {
      const res = await fetch('/api/client/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: reviewApt.id,
          barberId: reviewApt.barberId,
          clientId: user?.id || 'usr-client-1',
          clientName: user?.name || 'Cliente',
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        alert('Obrigado pela sua avaliação!');
        setReviewApt(null);
        setReviewComment('');
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations
  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Limite de estoque disponível atingido (${product.stock} unidades).`);
        return;
      }
      setCart(cart.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stock <= 0) {
        alert('Produto esgotado.');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              alert(`Máximo disponível: ${item.product.stock}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch('/api/client/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user?.id || 'usr-client-1',
          clientName: user?.name || 'Cliente BarberOn',
          clientPhone: user?.phone || '11999991111',
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          paymentMethod: 'pix',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCartSuccessMessage('Pedido realizado com sucesso! Seus produtos foram reservados e o estoque foi atualizado.');
        setCart([]);
        loadClientData();
      } else {
        alert(data.error || 'Erro no pedido.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch('/api/client/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadClientData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = myAppointments.filter((a) => a.date >= todayStr && a.status !== 'cancelado');
  const nextAppointment = upcomingAppointments[0];
  const historyAppointments = myAppointments.filter((a) => a.date < todayStr || a.status === 'concluido' || a.status === 'cancelado');

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#1e293b' }}>
      {/* Top Application Header - Idêntico ao design do link do cliente */}
      <header className="app-header">
        <div className="header-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon" style={{ width: '44px', height: '44px', background: '#0f172a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <Scissors size={24} />
            </div>
            <div className="brand-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  {currentShop?.name || 'Barbearia'}
                </span>
                <span style={{
                  background: isPro ? '#fef3c7' : '#f1f5f9',
                  color: isPro ? '#92400e' : '#0f172a',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}>
                  {isPro ? 'PRO' : 'FREE'}
                </span>
              </div>
              <span className="brand-subtitle" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentShop?.address || 'Rua, Avenida, Casa'}
              </span>
            </div>
          </div>

          {/* Navigation Switcher */}
          <nav className="nav-tabs" style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'booking' ? 'active' : ''}`}
              onClick={() => setActiveTab('booking')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                border: activeTab === 'booking' ? '1px solid #cbd5e1' : '1px solid transparent',
                background: activeTab === 'booking' ? '#ffffff' : 'transparent',
                color: activeTab === 'booking' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'booking' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Calendar size={17} /> Agendar Horário
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'my-appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-appointments')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                border: activeTab === 'my-appointments' ? '1px solid #cbd5e1' : '1px solid transparent',
                background: activeTab === 'my-appointments' ? '#ffffff' : 'transparent',
                color: activeTab === 'my-appointments' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'my-appointments' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Clock size={17} /> Meus Agendamentos
            </button>

            <Link
              href={shopSlug ? `/b/${shopSlug}/login` : '/login'}
              className="nav-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(217, 119, 6, 0.08)',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              <LogIn size={17} /> Entrar
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Seletor de Teste de Plano para Demonstração */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '0.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}>
              <button
                type="button"
                onClick={() => {
                  setPreviewPlan('FREE');
                  setDemoPlan('FREE');
                  const target = shopSlug ? `/client?plan=FREE` : `/client?plan=FREE`;
                  window.location.search = '?plan=FREE';
                }}
                style={{
                  background: !isPro ? '#ffffff' : 'transparent',
                  color: !isPro ? '#0f172a' : '#64748b',
                  border: 'none',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: !isPro ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                FREE
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewPlan('PRO');
                  setDemoPlan('PRO');
                  window.location.search = '?plan=PRO';
                }}
                style={{
                  background: isPro ? '#d97706' : 'transparent',
                  color: isPro ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: isPro ? '0 1px 4px rgba(217, 119, 6, 0.3)' : 'none'
                }}
              >
                💎 PRO
              </button>
            </div>

            {/* Badge Aberto Hoje */}
            <div className="header-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <span className="status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Aberto Hoje
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-wrapper" style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
        {/* 1. FLUXO COMPLETO DE AGENDAMENTO (IDÊNTICO À PÁGINA PÚBLICA / FOTO) */}
        {activeTab === 'booking' && (
          <BookingFlow 
            slug={currentShop?.slug || shopSlug || 'imperial'} 
            onBookingSuccess={() => {
              loadClientData();
              setActiveTab('my-appointments');
            }} 
          />
        )}

        {/* 3. MEUS AGENDAMENTOS FUTUROS */}
        {activeTab === 'my-appointments' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.25rem' }}>
              Meus Horários Marcados ({upcomingAppointments.length})
            </h2>

            {upcomingAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Clock size={36} style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ fontWeight: 600 }}>Você não tem nenhum horário futuro marcado.</p>
                <button
                  type="button"
                  onClick={() => { setActiveTab('booking'); setBookingStep(1); }}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Agendar Agora
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{apt.serviceName}</div>
                      <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Barbeiro: <strong>{apt.barberName}</strong> • Data: <strong>{apt.date}</strong> às <strong>{apt.time}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>
                        Valor: {formatCurrency(apt.price)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#166534' }}>
                        {apt.status.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt.id)}
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Cancelar Horário
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. HISTÓRICO DE CORTES & AVALIAÇÃO PÓS-ATENDIMENTO */}
        {activeTab === 'history' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.25rem' }}>
              Histórico de Cortes Realizados ({historyAppointments.length})
            </h2>

            {historyAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                Nenhum histórico anterior registrado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {historyAppointments.map((apt) => (
                  <div key={apt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{apt.serviceName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {apt.barberName} • Realizado em {apt.date} • {formatCurrency(apt.price)}
                      </div>
                    </div>

                    <div>
                      {apt.status === 'concluido' && isPro && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewApt(apt);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Star size={14} /> Avaliar Atendimento
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. VITRINE DE PRODUTOS & CARRINHO DE COMPRAS */}
        {activeTab === 'store' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {cartSuccessMessage && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '1rem', borderRadius: '8px', fontWeight: 600 }}>
                {cartSuccessMessage}
              </div>
            )}

            {/* Cart drawer if items exist */}
            {cart.length > 0 && (
              <div style={{ background: '#090d16', color: '#ffffff', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={20} color="#10b981" /> Seu Carrinho de Compras ({cart.length} itens)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {cart.map((item) => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {formatCurrency(item.product.price)} cada
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#1e293b', borderRadius: '6px', padding: '0.2rem 0.4rem' }}>
                          <button type="button" onClick={() => updateCartQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}><Minus size={12} /></button>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}><Plus size={12} /></button>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '70px', textAlign: 'right' }}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button type="button" onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total do Pedido: </span>
                    <strong style={{ fontSize: '1.35rem', color: '#10b981' }}>{formatCurrency(cartTotal)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckoutCart}
                    style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Finalizar Pedido (Baixa no Estoque)
                  </button>
                </div>
              </div>
            )}

            {/* Vitrine */}
            <div>
              <h2 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1.25rem' }}>
                Vitrine de Produtos Exclusivos
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {products.map((prod) => (
                  <div key={prod.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=300&q=80'}
                      alt={prod.name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                    />
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', flex: 1 }}>{prod.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.category}</div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatCurrency(prod.price)}</span>
                      <span style={{ fontSize: '0.72rem', color: prod.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {prod.stock > 0 ? `${prod.stock} em estoque` : 'Esgotado'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={prod.stock <= 0}
                      onClick={() => addToCart(prod)}
                      style={{
                        marginTop: '0.75rem',
                        background: prod.stock > 0 ? '#0f172a' : '#cbd5e1',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: prod.stock > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {prod.stock > 0 ? '+ Adicionar ao Carrinho' : 'Sem Estoque'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. NOTIFICAÇÕES */}
        {activeTab === 'notifications' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.25rem' }}>
              Central de Notificações & Avisos ({notifications.length})
            </h2>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                Nenhuma notificação nova no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkNotificationRead(n.id)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1rem',
                      background: n.read ? '#ffffff' : '#f0fdf4',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{n.title}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', color: '#475569' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. PERFIL DO CLIENTE */}
        {activeTab === 'profile' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, fontSize: '1.25rem' }}>
              Meu Perfil de Cadastro
            </h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await updateUserProfile({ name: profileName, phone: profilePhone });
              alert('Dados atualizados com sucesso!');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Nome Completo</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>E-mail</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: AVALIAÇÃO PÓS-ATENDIMENTO */}
      {reviewApt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Avaliar Atendimento</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Como foi sua experiência com <strong>{reviewApt.barberName}</strong> em {reviewApt.serviceName}?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Escreva um comentário sobre o corte ou atendimento..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', height: '80px', boxSizing: 'border-box', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setReviewApt(null)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px' }}>Cancelar</button>
              <button type="button" onClick={handleSubmitReview} style={{ flex: 1, padding: '0.6rem', border: 'none', background: '#10b981', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>Enviar Avaliação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
