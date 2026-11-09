'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Appointment,
  Barber,
  Barbershop,
  Promotion,
  Service,
  User,
} from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  BadgePercent,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gift,
  History,
  Home,
  LoaderCircle,
  LogOut,
  Scissors,
  Star,
  UserRound,
  UserRoundPen,
  X,
} from 'lucide-react';
import styles from './ClientProArea.module.css';

type ClientTab = 'dashboard' | 'booking' | 'appointments' | 'history' | 'reviews' | 'promotions' | 'profile';
type StoredReview = Record<string, number>;
type StoredProfile = { name?: string; phone?: string };

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch (error) {
    console.error(`Não foi possível ler ${key} do armazenamento local:`, error);
    return fallback;
  }
}

interface ClientProAreaProps {
  user: User | null;
  shopSlug: string | null;
}

const NAV_ITEMS: Array<{ id: ClientTab; label: string; icon: typeof Home }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'booking', label: 'Agendar Horário', icon: CalendarDays },
  { id: 'appointments', label: 'Meus Agendamentos', icon: Clock3 },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'reviews', label: 'Avaliar', icon: Star },
  { id: 'promotions', label: 'Promoções', icon: Gift },
  { id: 'profile', label: 'Meu Perfil', icon: UserRoundPen },
];

const PROMO_CARDS = [
  { icon: Scissors, title: 'Combo degradê + barba', description: 'Combine seus serviços favoritos e saia com o visual completo.' },
  { icon: Gift, title: 'Indique um amigo', description: 'Traga um amigo para conhecer a barbearia e aproveitem juntos.' },
  { icon: BadgePercent, title: 'Cliente fiel', description: 'A cada 8 cortes, ganhe uma condição especial no próximo atendimento.' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const dateFromISO = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  dateFromISO(value).toLocaleDateString('pt-BR', options || { day: 'numeric', month: 'long', year: 'numeric' });

const localISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getAppointmentServices = (appointment: Appointment) =>
  appointment.services?.length
    ? appointment.services
    : [{
        id: appointment.serviceId,
        name: appointment.serviceName,
        price: appointment.price,
        durationMinutes: appointment.durationMinutes || 30,
      }];

export default function ClientProArea({ user, shopSlug }: ClientProAreaProps) {
  const { updateUserProfile, logout } = useAuth();
  const shop = shopSlug || user?.barbershopId || 'imperial';
  const clientId = user?.id || 'usr-client-1';
  const profileStorageKey = `barberon_client_profile_${clientId}`;
  const reviewStorageKey = `barberon_client_reviews_${clientId}`;
  const [storedProfile] = useState(() => readLocalStorage<StoredProfile>(profileStorageKey, {}));
  const [storedReviews] = useState(() => readLocalStorage<StoredReview>(reviewStorageKey, {}));
  const [tab, setTab] = useState<ClientTab>('dashboard');
  const [shopInfo, setShopInfo] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [profileName, setProfileName] = useState(storedProfile.name || user?.name || '');
  const [profilePhone, setProfilePhone] = useState(storedProfile.phone || user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [reviews, setReviews] = useState<StoredReview>(storedReviews);

  const [step, setStep] = useState(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [bookingName, setBookingName] = useState(storedProfile.name || user?.name || '');
  const [bookingPhone, setBookingPhone] = useState(storedProfile.phone || user?.phone || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const shopQuery = `slug=${encodeURIComponent(shop)}`;
      const [shopRes, serviceRes, barberRes, appointmentRes, promotionRes] = await Promise.all([
        fetch(`/api/barbershops/${encodeURIComponent(shop)}`),
        fetch(`/api/client/booking?${shopQuery}`),
        fetch(`/api/barbers?${shopQuery}`),
        fetch(`/api/client/appointments?clientId=${encodeURIComponent(clientId)}&${shopQuery}`),
        fetch(`/api/admin/promotions?${shopQuery}`),
      ]);
      if (!shopRes.ok || !serviceRes.ok || !barberRes.ok || !appointmentRes.ok) {
        throw new Error('Não foi possível carregar as informações da barbearia. Tente novamente.');
      }
      const [shopData, serviceData, barberData, appointmentData, promotionData] = await Promise.all([
        shopRes.json(),
        serviceRes.json(),
        barberRes.json(),
        appointmentRes.json(),
        promotionRes.ok ? promotionRes.json() : [],
      ]);
      setLoadError('');
      setShopInfo(shopData);
      setServices(Array.isArray(serviceData.services) ? serviceData.services : []);
      setBarbers(Array.isArray(barberData) ? barberData.filter((barber: Barber) => barber.active !== false) : []);
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      setPromotions(Array.isArray(promotionData) ? promotionData.filter((promotion: Promotion) => promotion.active) : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Erro ao carregar a área do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId, shop]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const today = localISODate(new Date());
  const nextAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.date >= today && appointment.status !== 'cancelado' && appointment.status !== 'concluido')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [appointments, today],
  );
  const historyAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.status === 'cancelado' || appointment.status === 'concluido' || appointment.date < today)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    [appointments, today],
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'concluido' || appointment.date < today,
  );
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));
  const totalDuration = selectedServices.reduce(
    (total, service) => total + (service.durationMinutes || service.duration || 30),
    0,
  );
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);
  const selectedBarber = barbers.find((barber) => barber.id === selectedBarberId);
  const nextAppointment = nextAppointments[0];
  const cutsCompleted = appointments.filter((appointment) => appointment.status === 'concluido').length;
  const firstName = profileName.trim().split(/\s+/)[0] || 'Cliente';

  const bookingDays = useMemo(() => {
    const days: Date[] = [];
    for (let offset = 0; days.length < 14; offset += 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + offset);
      if (date.getDay() !== 0) days.push(date);
    }
    return days;
  }, []);

  useEffect(() => {
    if (step !== 3 || !selectedDate || selectedServices.length === 0) return;
    let active = true;
    const loadSlots = async () => {
      setSlotLoading(true);
      setAvailableSlots([]);
      setSelectedTime('');
      try {
        const candidates = selectedBarberId
          ? [selectedBarberId]
          : barbers.map((barber) => barber.id);
        const responses = await Promise.all(candidates.map(async (barberId) => {
          const response = await fetch(
            `/api/availability?barberId=${encodeURIComponent(barberId)}&date=${selectedDate}&duration=${totalDuration}&slug=${encodeURIComponent(shop)}`,
          );
          const data = await response.json();
          return { barberId, slots: response.ok && Array.isArray(data.slots) ? data.slots as string[] : [] };
        }));
        if (!active) return;
        const slotTimes = Array.from({ length: 19 }, (_, index) => {
          const minutes = 9 * 60 + index * 30;
          return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        }).filter((time) => time < '12:00' || time >= '13:30');
        const todayNow = new Date();
        const available = slotTimes.filter((time) => {
          const [hour, minute] = time.split(':').map(Number);
          const slotIsPast = selectedDate === today &&
            (hour < todayNow.getHours() || (hour === todayNow.getHours() && minute <= todayNow.getMinutes()));
          return !slotIsPast && responses.some((candidate) => candidate.slots.includes(time));
        });
        setAvailableSlots(available);
      } catch (error) {
        if (active) setBookingError(error instanceof Error ? error.message : 'Não foi possível consultar os horários.');
      } finally {
        if (active) setSlotLoading(false);
      }
    };
    void loadSlots();
    return () => { active = false; };
  }, [barbers, selectedBarberId, selectedDate, selectedServiceIds, selectedServices.length, shop, step, today, totalDuration]);

  const startBooking = () => {
    setBookingSuccess(null);
    setBookingError('');
    setReschedulingId(null);
    setStep(1);
    setSelectedServiceIds([]);
    setSelectedBarberId('');
    setSelectedDate('');
    setSelectedTime('');
    setBookingName(profileName);
    setBookingPhone(profilePhone);
    setBookingNotes('');
    setTab('booking');
  };

  const startReschedule = (appointment: Appointment) => {
    setReschedulingId(appointment.id);
    setSelectedServiceIds(getAppointmentServices(appointment).map((service) => service.id));
    setSelectedBarberId(appointment.barberId || '');
    setSelectedDate('');
    setSelectedTime('');
    setBookingName(appointment.clientName || profileName);
    setBookingPhone(appointment.clientPhone || profilePhone);
    setBookingNotes(appointment.notes || '');
    setBookingSuccess(null);
    setBookingError('');
    setStep(3);
    setTab('booking');
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((current) =>
      current.includes(id) ? current.filter((serviceId) => serviceId !== id) : [...current, id],
    );
    setSelectedTime('');
  };

  const completeStep = () => {
    setBookingError('');
    if (step === 1 && selectedServiceIds.length === 0) return;
    if (step === 2 && barbers.length > 0 && selectedBarberId === 'none') return;
    if (step === 3 && (!selectedDate || !selectedTime)) return;
    if (step === 4) {
      if (bookingName.trim().split(/\s+/).length < 2) {
        setBookingError('Informe seu nome e sobrenome.');
        return;
      }
      if (bookingPhone.replace(/\D/g, '').length < 10) {
        setBookingError('Informe um telefone com DDD.');
        return;
      }
      void confirmBooking();
      return;
    }
    setStep((current) => current + 1);
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    setBookingError('');
    try {
      const candidates = selectedBarberId && selectedBarberId !== 'none'
        ? [selectedBarberId]
        : barbers.map((barber) => barber.id);
      const availability = await Promise.all(candidates.map(async (barberId) => {
        const response = await fetch(
          `/api/availability?barberId=${encodeURIComponent(barberId)}&date=${selectedDate}&duration=${totalDuration}&slug=${encodeURIComponent(shop)}`,
        );
        const data = await response.json();
        return { barberId, slots: response.ok && Array.isArray(data.slots) ? data.slots as string[] : [] };
      }));
      const chosen = availability.find((candidate) => candidate.slots.includes(selectedTime));
      if (!chosen) {
        setBookingError('Esse horário acabou de ser ocupado. Escolha outro horário disponível.');
        setStep(3);
        return;
      }

      const response = await fetch('/api/client/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientName: bookingName.trim(),
          clientPhone: bookingPhone.trim(),
          clientEmail: user?.email,
          barberId: chosen.barberId,
          serviceId: selectedServiceIds[0],
          serviceIds: selectedServiceIds,
          date: selectedDate,
          time: selectedTime,
          notes: bookingNotes.trim(),
          slug: shop,
          barbershopId: user?.barbershopId || shopInfo?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível concluir o agendamento.');

      if (reschedulingId) {
        const cancelResponse = await fetch('/api/client/appointments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reschedulingId }),
        });
        if (!cancelResponse.ok) {
          setBookingError('O novo horário foi reservado, mas não foi possível cancelar o horário anterior. Entre em contato com a barbearia.');
        }
      }

      setBookingSuccess(data as Appointment);
      setReschedulingId(null);
      setStep(5);
      await loadData();
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Erro ao agendar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (appointment: Appointment) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      const response = await fetch('/api/client/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointment.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível cancelar o agendamento.');
      await loadData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Erro ao cancelar agendamento.');
    }
  };

  const saveReview = (appointmentId: string, rating: number) => {
    const updated = { ...reviews, [appointmentId]: rating };
    setReviews(updated);
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Não foi possível salvar a avaliação no navegador:', error);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaved(false);
    try {
      const profile = { name: profileName.trim(), phone: profilePhone.trim() };
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      await updateUserProfile(profile);
      setBookingName(profile.name);
      setBookingPhone(profile.phone);
      setProfileSaved(true);
    } catch (error) {
      console.error('Não foi possível salvar o perfil do cliente:', error);
      setLoadError('Não foi possível salvar os dados. Verifique o armazenamento do navegador.');
    }
  };

  const renderBooking = () => {
    if (bookingSuccess) {
      const barberName = barbers.find((barber) => barber.id === bookingSuccess.barberId)?.name || bookingSuccess.barberName;
      return (
        <section className={styles.successCard}>
          <CheckCircle2 size={54} />
          <p className={styles.eyebrow}>Agendamento confirmado</p>
          <h2>Está marcado, {firstName}!</h2>
          <p>{bookingSuccess.serviceName} · {formatDate(bookingSuccess.date)} às {bookingSuccess.time}</p>
          <p>Com {barberName} · {formatCurrency(bookingSuccess.price)}</p>
          <button className={styles.primaryButton} onClick={() => { setBookingSuccess(null); setTab('appointments'); }} type="button">Ver meus agendamentos</button>
        </section>
      );
    }

    return (
      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{reschedulingId ? 'Remarcar horário' : 'Sua próxima visita'}</p>
            <h2>Agendar horário</h2>
          </div>
          <span className={styles.stepCount}>Etapa {step} de 4</span>
        </div>
        <div className={styles.progressTrack} aria-label={`Etapa ${step} de 4`}>
          {[1, 2, 3, 4].map((number) => <span key={number} className={number <= step ? styles.progressActive : ''} />)}
        </div>
        <div className={styles.bookingContent}>
          {step === 1 && (
            <>
              <h3>Escolha um ou mais serviços</h3>
              <div className={styles.choiceGrid}>
                {services.map((service) => {
                  const selected = selectedServiceIds.includes(service.id);
                  return (
                    <button key={service.id} type="button" aria-pressed={selected} className={`${styles.serviceChoice} ${selected ? styles.choiceSelected : ''}`} onClick={() => toggleService(service.id)}>
                      <span className={styles.choiceCheck}>{selected && <Check size={15} />}</span>
                      <strong>{service.name}</strong>
                      <span>{service.description || 'Um cuidado especial para o seu visual.'}</span>
                      <small>{service.durationMinutes || service.duration || 30} min <b>{formatCurrency(service.price)}</b></small>
                    </button>
                  );
                })}
              </div>
              {services.length === 0 && <p className={styles.emptyState}>Não há serviços disponíveis para agendamento.</p>}
            </>
          )}
          {step === 2 && (
            <>
              <h3>Escolha seu profissional</h3>
              <div className={styles.choiceGrid}>
                <button type="button" aria-pressed={selectedBarberId === 'none'} className={`${styles.barberChoice} ${selectedBarberId === 'none' ? styles.choiceSelected : ''}`} onClick={() => { setSelectedBarberId('none'); setSelectedTime(''); }}>
                  <UserRound size={22} /><strong>Sem preferência</strong><span>Escolhemos o primeiro profissional com horário livre.</span>
                </button>
                {barbers.map((barber) => (
                  <button key={barber.id} type="button" aria-pressed={selectedBarberId === barber.id} className={`${styles.barberChoice} ${selectedBarberId === barber.id ? styles.choiceSelected : ''}`} onClick={() => { setSelectedBarberId(barber.id); setSelectedTime(''); }}>
                    <UserRound size={22} /><strong>{barber.name}</strong><span>{barber.specialty || 'Barbeiro profissional'}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h3>Escolha a data e o horário</h3>
              <div className={styles.dateStrip}>
                {bookingDays.map((date) => {
                  const iso = localISODate(date);
                  return (
                    <button type="button" key={iso} aria-pressed={selectedDate === iso} className={`${styles.dateChoice} ${selectedDate === iso ? styles.dateSelected : ''}`} onClick={() => { setSelectedDate(iso); setSelectedTime(''); }}>
                      <span>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><strong>{date.getDate()}</strong><small>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small>
                    </button>
                  );
                })}
              </div>
              {!selectedDate && <p className={styles.muted}>Selecione um dia para consultar os horários disponíveis.</p>}
              {selectedDate && slotLoading && <p className={styles.muted}><LoaderCircle className={styles.spin} size={16} /> Buscando horários...</p>}
              {selectedDate && !slotLoading && (
                <>
                  {['Manhã', 'Tarde'].map((period) => {
                    const times = availableSlots.filter((time) => period === 'Manhã' ? time < '12:00' : time >= '13:30');
                    return <div key={period} className={styles.periodGroup}><h4>{period}</h4>{times.length ? <div className={styles.timeGrid}>{times.map((time) => <button key={time} type="button" aria-pressed={selectedTime === time} className={`${styles.timeChoice} ${selectedTime === time ? styles.timeSelected : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>)}</div> : <p className={styles.muted}>Sem horários disponíveis.</p>}</div>;
                  })}
                </>
              )}
            </>
          )}
          {step === 4 && (
            <>
              <h3>Revise e confirme</h3>
              <div className={styles.reviewSummary}>
                <div><span>Serviços</span><strong>{selectedServices.map((service) => service.name).join(' + ')}</strong></div>
                <div><span>Profissional</span><strong>{selectedBarber?.name || 'Sem preferência'}</strong></div>
                <div><span>Data e hora</span><strong>{selectedDate && formatDate(selectedDate)} às {selectedTime}</strong></div>
                <div><span>Duração</span><strong>{totalDuration} minutos</strong></div>
                <div><span>Total</span><strong>{formatCurrency(totalPrice)}</strong></div>
              </div>
              <div className={styles.formGrid}>
                <label>Nome completo<input required autoComplete="name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} placeholder="Nome e sobrenome" /></label>
                <label>WhatsApp com DDD<input required autoComplete="tel" inputMode="tel" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} placeholder="(11) 99999-9999" /></label>
                <label className={styles.fullWidth}>Observações (opcional)<textarea value={bookingNotes} onChange={(event) => setBookingNotes(event.target.value)} rows={3} placeholder="Algum detalhe que devemos saber?" /></label>
              </div>
              <p className={styles.paymentNotice}>Pagamento no local. Cancelamento gratuito até 2 horas antes.</p>
            </>
          )}
        </div>
        {bookingError && <p className={styles.errorMessage} role="alert">{bookingError}</p>}
        <div className={styles.bookingFooter}>
          <div><strong>{totalDuration} min</strong><span>{selectedServiceIds.length} serviço(s)</span><strong>{formatCurrency(totalPrice)}</strong></div>
          {step > 1 && <button className={styles.secondaryButton} type="button" onClick={() => { setBookingError(''); setStep((current) => current - 1); }}><ChevronLeft size={17} /> Voltar</button>}
          <button className={styles.primaryButton} type="button" disabled={submitting || (step === 1 && !selectedServiceIds.length) || (step === 2 && !selectedBarberId) || (step === 3 && (!selectedDate || !selectedTime || slotLoading)) || (step === 4 && (bookingName.trim().split(/\s+/).length < 2 || bookingPhone.replace(/\D/g, '').length < 10))} onClick={completeStep}>
            {submitting ? 'Confirmando...' : step === 4 ? 'Confirmar' : 'Continuar'} {!submitting && step < 4 && <ChevronRight size={17} />}
          </button>
        </div>
      </section>
    );
  };

  const renderDashboard = () => {
    const nextService = nextAppointment ? getAppointmentServices(nextAppointment).map((service) => service.name).join(' + ') : '—';
    const barber = nextAppointment ? barbers.find((item) => item.id === nextAppointment.barberId) : undefined;
    return (
      <>
        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}><span>Próximo atendimento</span><strong>{nextAppointment ? `${formatDate(nextAppointment.date, { day: 'numeric', month: 'short' })} · ${nextAppointment.time}` : '—'}</strong><CalendarDays /></article>
          <article className={styles.summaryCard}><span>Barbeiro</span><strong>{nextAppointment?.barberName || '—'}</strong><small>{barber?.specialty || (nextAppointment ? 'Seu profissional' : 'Sem atendimento marcado')}</small><UserRound /></article>
          <article className={styles.summaryCard}><span>Serviço</span><strong>{nextService}</strong><small>{nextAppointment ? formatCurrency(nextAppointment.price) : '—'}</small><Scissors /></article>
          <article className={styles.summaryCard}><span>Total de cortes</span><strong>{cutsCompleted}</strong><small>Atendimentos concluídos</small><CheckCircle2 /></article>
        </section>
        <section className={styles.welcomeCard}>
          <div><p className={styles.eyebrow}>Seu próximo visual começa aqui</p><h2>Olá, {firstName}! Pronto para seu novo visual?</h2><p>Escolha seu serviço favorito e reserve um horário com nossa equipe.</p></div>
          <button className={styles.primaryButton} type="button" onClick={startBooking}>Agendar agora <ChevronRight size={17} /></button>
        </section>
        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Cuidados selecionados</p><h2>Produtos para Você</h2></div><span className={styles.availableTag}>Disponíveis na loja</span></div>
          <div className={styles.emptyProducts}><ShoppingBagIcon /><strong>Novos produtos chegando em breve</strong><span>Estamos preparando uma seleção especial para você.</span></div>
        </section>
      </>
    );
  };

  const renderAppointments = () => (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Sua agenda</p><h2>Meus Agendamentos</h2></div><button className={styles.primaryButton} onClick={startBooking} type="button">Agendar horário</button></div>
      {nextAppointments.length === 0 ? <div className={styles.emptyState}><CalendarDays size={34} /><strong>Você não tem agendamentos futuros.</strong><button className={styles.primaryButton} onClick={startBooking} type="button">Agendar agora</button></div> : <div className={styles.appointmentList}>{nextAppointments.map((appointment) => <article className={styles.appointmentCard} key={appointment.id}><div className={styles.appointmentDate}><strong>{dateFromISO(appointment.date).getDate()}</strong><span>{dateFromISO(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}</span></div><div className={styles.appointmentDetails}><div className={styles.statusRow}><strong>{getAppointmentServices(appointment).map((service) => service.name).join(' + ')}</strong><span className={styles.confirmedTag}>Confirmado</span></div><p>{formatDate(appointment.date)} às {appointment.time} · {appointment.barberName}</p><strong>{formatCurrency(appointment.price)}</strong></div><div className={styles.appointmentActions}><button type="button" className={styles.secondaryButton} onClick={() => startReschedule(appointment)}>Remarcar</button><button type="button" className={styles.cancelButton} onClick={() => void cancelAppointment(appointment)}>Cancelar</button></div></article>)}</div>}
    </section>
  );

  const renderHistory = () => (
    <section className={styles.panel}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Suas visitas</p><h2>Histórico</h2></div></div>
      {historyAppointments.length === 0 ? <div className={styles.emptyState}><History size={34} /><strong>Nenhum registro ainda</strong></div> : <div className={styles.appointmentList}>{historyAppointments.map((appointment) => <article className={styles.appointmentCard} key={appointment.id}><div className={styles.appointmentDate}><strong>{dateFromISO(appointment.date).getDate()}</strong><span>{dateFromISO(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}</span></div><div className={styles.appointmentDetails}><div className={styles.statusRow}><strong>{getAppointmentServices(appointment).map((service) => service.name).join(' + ')}</strong><span className={appointment.status === 'cancelado' ? styles.cancelledTag : styles.completedTag}>{appointment.status === 'cancelado' ? 'Cancelado' : 'Concluído'}</span></div><p>{formatDate(appointment.date)} às {appointment.time} · {appointment.barberName}</p><strong>{formatCurrency(appointment.price)}</strong></div></article>)}</div>}
    </section>
  );

  const renderReviews = () => (
    <section className={styles.panel}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Conte como foi</p><h2>Avalie seu atendimento</h2></div></div>
      {completedAppointments.length === 0 ? <div className={styles.emptyState}><Star size={34} /><strong>Nenhum atendimento para avaliar</strong></div> : <div className={styles.appointmentList}>{completedAppointments.map((appointment) => <article className={styles.reviewCard} key={appointment.id}><div><strong>{appointment.serviceName}</strong><p>{formatDate(appointment.date)} · {appointment.barberName}</p></div><div className={styles.stars} aria-label="Avalie de 1 a 5 estrelas">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={reviews[appointment.id] === rating} onClick={() => saveReview(appointment.id, rating)}><Star size={23} fill={(reviews[appointment.id] || 0) >= rating ? 'currentColor' : 'none'} /></button>)}</div></article>)}</div>}
    </section>
  );

  const renderProfile = () => (
    <section className={`${styles.panel} ${styles.profilePanel}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Suas informações</p><h2>Meu Perfil</h2></div></div>
      <form className={styles.formGrid} onSubmit={(event) => void saveProfile(event)}>
        <label>Nome completo<input required autoComplete="name" value={profileName} onChange={(event) => { setProfileSaved(false); setProfileName(event.target.value); }} /></label>
        <label>WhatsApp<input required autoComplete="tel" inputMode="tel" value={profilePhone} onChange={(event) => { setProfileSaved(false); setProfilePhone(event.target.value); }} /></label>
        <label className={styles.fullWidth}>E-mail<input value={user?.email || ''} disabled /></label>
        <button className={styles.primaryButton} type="submit">Salvar dados</button>
        {profileSaved && <p role="status" className={styles.successMessage}>Seus dados foram salvos e serão preenchidos no agendamento.</p>}
      </form>
    </section>
  );

  const activeTitle = NAV_ITEMS.find((item) => item.id === tab)?.label || 'Dashboard';

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><div className={styles.brandIcon}><Scissors size={21} /></div><div><strong>{shopInfo?.name || 'BarberON'}</strong><span>Área do cliente</span></div></div>
        <div className={styles.vipCard}><Star size={17} /><div><strong>Membro VIP</strong><span>Experiência BarberON PRO</span></div></div>
        <nav className={styles.sideNav} aria-label="Navegação do cliente">{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={tab === id ? styles.navActive : ''} onClick={() => { setTab(id); setBookingSuccess(null); }}><Icon size={18} /><span>{label}</span>{tab === id && <ChevronRight size={15} />}</button>)}</nav>
        <button className={styles.logoutButton} type="button" onClick={logout}><LogOut size={17} /> Sair</button>
      </aside>
      <div className={styles.mainColumn}>
        <header className={styles.topbar}><div><span>{activeTitle}</span><strong>Bem-vindo(a), {firstName}</strong></div><div className={styles.topbarUser}><div><strong>{profileName || user?.name || 'Cliente'}</strong><span><Star size={13} fill="currentColor" /> Membro VIP</span></div><div className={styles.avatar}><UserRound size={19} /></div></div></header>
        <main className={styles.content}>
          {loadError && <div className={styles.errorMessage} role="alert">{loadError}<button type="button" aria-label="Fechar aviso" onClick={() => setLoadError('')}><X size={15} /></button></div>}
          {loading ? <div className={styles.loadingState}><LoaderCircle className={styles.spin} /> Carregando sua área...</div> : <>
            {tab === 'dashboard' && renderDashboard()}
            {tab === 'booking' && renderBooking()}
            {tab === 'appointments' && renderAppointments()}
            {tab === 'history' && renderHistory()}
            {tab === 'reviews' && renderReviews()}
            {tab === 'promotions' && <section className={styles.panel}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Vantagens para você</p><h2>Promoções</h2></div></div><div className={styles.promoGrid}>{(promotions.length ? promotions.map((promotion) => ({ id: promotion.id, title: promotion.title, description: promotion.description })) : PROMO_CARDS.map((promotion) => ({ ...promotion, id: promotion.title }))).map((promotion, index) => { const Icon = PROMO_CARDS[index % PROMO_CARDS.length].icon; return <article className={styles.promoCard} key={promotion.id}><div><Icon size={21} /></div><h3>{promotion.title}</h3><p>{promotion.description}</p></article>; })}</div></section>}
            {tab === 'profile' && renderProfile()}
          </>}
        </main>
      </div>
      <nav className={styles.mobileNav} aria-label="Navegação do cliente">{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} className={tab === id ? styles.mobileActive : ''} onClick={() => { setTab(id); setBookingSuccess(null); }}><Icon size={19} /><span>{label}</span></button>)}</nav>
    </div>
  );
}

function ShoppingBagIcon() {
  return <Gift size={25} aria-hidden="true" />;
}
