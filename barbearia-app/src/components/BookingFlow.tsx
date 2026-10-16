'use client';

import React, { useEffect, useState } from 'react';
import { Barber, BarbershopSettings, Service } from '@/lib/types';
import { 
  Calendar, 
  Clock, 
  Check, 
  User, 
  Scissors, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MessageSquareQuote,
  Star,
  AlertCircle
} from 'lucide-react';

interface BookingFlowProps {
  slug?: string;
  onBookingSuccess?: () => void;
}

export default function BookingFlow({ slug = 'imperial', onBookingSuccess }: BookingFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  
  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Customer Form
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Load services, barbers and settings da barbearia específica
  useEffect(() => {
    async function loadData() {
      try {
        const query = `?slug=${encodeURIComponent(slug)}`;
        const [srvRes, barRes, shopRes] = await Promise.all([
          fetch(`/api/services${query}`),
          fetch(`/api/barbers${query}`),
          fetch(`/api/barbershops/${slug}`),
        ]);
        const srvData = await srvRes.json();
        const barData = await barRes.json();
        const shopData = await shopRes.json();
        setServices(Array.isArray(srvData) ? srvData : []);
        setBarbers(Array.isArray(barData) ? barData : []);
        setSettings(shopData?.name ? shopData : null);

        // Se tiver apenas 1 barbeiro, pré-seleciona
        if (Array.isArray(barData) && barData.length === 1) {
          setSelectedBarber(barData[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    loadData();
  }, [slug]);

  // Fetch slots whenever barber, date or service changes
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;
    const currentBarberId = selectedBarber.id;
    const currentDate = selectedDate;

    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const duration = selectedService?.durationMinutes || 30;
        const res = await fetch(
          `/api/availability?barberId=${currentBarberId}&date=${currentDate}&duration=${duration}&slug=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedBarber, selectedDate, selectedService, slug]);

  const filteredServices = selectedCategory === 'todos'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1 && !selectedService) {
      setErrorMsg('Por favor, selecione um serviço para continuar.');
      return;
    }
    if (step === 2 && !selectedBarber) {
      setErrorMsg('Por favor, confirme o profissional.');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setErrorMsg('Por favor, selecione data e horário disponíveis.');
      return;
    }
    if (step === 4) {
      if (!customerName.trim() || !customerPhone.trim()) {
        setErrorMsg('Por favor, informe seu nome e WhatsApp para contato.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          customerName,
          customerPhone,
          customerEmail,
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao realizar agendamento.');
        setSubmitting(false);
        return;
      }

      setConfirmedAppointment(data);
      setStep(5);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha de conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateBR = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const getWhatsAppMessageUrl = () => {
    if (!confirmedAppointment) return '#';
    const shop = settings?.name || 'Barbearia';
    const msg = `Olá! Gostaria de confirmar meu agendamento na *${shop}* via BarberOn Free:\n\n✂️ *Serviço:* ${confirmedAppointment.serviceName}\n💈 *Barbeiro:* ${confirmedAppointment.barberName}\n📅 *Data:* ${formatDateBR(confirmedAppointment.date)}\n⏰ *Horário:* ${confirmedAppointment.time}\n👤 *Cliente:* ${confirmedAppointment.customerName}\n💰 *Valor:* ${formatCurrency(confirmedAppointment.totalAmount)}`;
    const phone = settings?.phone || confirmedAppointment.customerPhone;
    return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    if (barbers.length === 1) {
      setSelectedBarber(barbers[0]);
    } else {
      setSelectedBarber(null);
    }
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setConfirmedAppointment(null);
  };

  return (
    <div>
      {/* Stepper Navigation */}
      {step < 5 && (
        <div className="stepper-nav">
          <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} onClick={() => step > 1 && setStep(1)}>
            <div className="step-circle">{step > 1 ? <Check size={18} /> : '1'}</div>
            <div className="step-label">
              <span className="step-number">Passo 1</span>
              <span className="step-title">Serviço</span>
            </div>
          </div>

          <div className="step-divider" />

          <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} onClick={() => step > 2 && setStep(2)}>
            <div className="step-circle">{step > 2 ? <Check size={18} /> : '2'}</div>
            <div className="step-label">
              <span className="step-number">Passo 2</span>
              <span className="step-title">Barbeiro</span>
            </div>
          </div>

          <div className="step-divider" />

          <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`} onClick={() => step > 3 && setStep(3)}>
            <div className="step-circle">{step > 3 ? <Check size={18} /> : '3'}</div>
            <div className="step-label">
              <span className="step-number">Passo 3</span>
              <span className="step-title">Horário</span>
            </div>
          </div>

          <div className="step-divider" />

          <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">
              <span className="step-number">Passo 4</span>
              <span className="step-title">Confirmar</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'var(--danger-light)',
          color: 'var(--danger-text)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.92rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">Escolha o Serviço</h2>
            <p className="section-desc">Selecione o corte ou procedimento na {settings?.name || 'nossa barbearia'}.</p>
          </div>

          <div className="category-pills">
            {['todos', 'cabelo', 'barba', 'combo', 'tratamento'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="services-grid">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  className={`service-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <div>
                    <div className="service-top">
                      <h3 className="service-name">{service.name}</h3>
                      {service.popular && (
                        <span className="popular-badge">
                          <Star size={12} fill="#d97706" /> Mais Escolhido
                        </span>
                      )}
                    </div>
                    <p className="service-desc">{service.description}</p>
                  </div>

                  <div className="service-bottom">
                    <div className="service-duration">
                      <Clock size={16} />
                      <span>{service.durationMinutes} min</span>
                    </div>
                    <div className="service-price">{formatCurrency(service.price)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="step-actions">
            <div />
            <button
              type="button"
              className="btn-primary"
              disabled={!selectedService}
              onClick={handleNextStep}
            >
              Continuar com {selectedService ? selectedService.name : 'o serviço'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BARBER */}
      {step === 2 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">Escolha seu Barbeiro</h2>
            <p className="section-desc">
              Selecione o profissional de sua preferência para realizar o serviço.
            </p>
          </div>

          <div className="barbers-grid" style={{ maxWidth: barbers.length === 1 ? '380px' : 'none', margin: barbers.length === 1 ? '0 auto' : '0' }}>
            {barbers.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              return (
                <div
                  key={barber.id}
                  className={`barber-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className="barber-avatar-wrap">
                    <img src={barber.avatar} alt={barber.name} className="barber-avatar-img" />
                  </div>
                  <h3 className="barber-name">{barber.name}</h3>
                  <p className="barber-specialty">{barber.specialty}</p>

                  <div className="barber-schedule-badge">
                    <Clock size={14} /> {barber.workingHours ? `${barber.workingHours.start} às ${barber.workingHours.end}` : '08:00 às 19:00'}
                  </div>

                  {barbers.length === 1 && (
                    <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--success-text)', fontWeight: 700 }}>
                      ✓ Barbeiro Selecionado
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="step-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              <ChevronLeft size={18} /> Voltar
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!selectedBarber}
              onClick={handleNextStep}
            >
              Escolher Data e Horário <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === 3 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">Selecione Data e Horário</h2>
            <p className="section-desc">
              Atendimento com {selectedBarber?.name} para {selectedService?.name}.
            </p>
          </div>

          <div className="datetime-container">
            <div className="date-picker-box">
              <label className="picker-label">
                <Calendar size={18} /> Escolha o Dia
              </label>
              <input
                type="date"
                className="custom-input"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <div style={{ marginTop: '1rem', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                ℹ️ {settings?.openHours || 'Segunda a Sábado, das 09:00 às 20:00'}.
              </div>
            </div>

            <div>
              <label className="picker-label">
                <Clock size={18} /> Horários Livres em {formatDateBR(selectedDate)}
              </label>

              {loadingSlots ? (
                <div className="empty-slots">Consultando horários disponíveis...</div>
              ) : availableSlots.length === 0 ? (
                <div className="empty-slots">
                  Nenhum horário disponível para esta data com o barbeiro selecionado.
                  Por favor, tente outra data.
                </div>
              ) : (
                <div className="slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="step-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
              <ChevronLeft size={18} /> Voltar
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!selectedDate || !selectedTime}
              onClick={handleNextStep}
            >
              Avançar para Seus Dados <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CUSTOMER DATA & SUMMARY */}
      {step === 4 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">Dados do Cliente</h2>
            <p className="section-desc">Informe seu contato para confirmação do agendamento.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="picker-label" style={{ marginBottom: '0.4rem' }}>
                    <User size={16} /> Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Carlos Oliveira"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.4rem' }}>
                    📱 WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="Ex: 11987654321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Apenas números com DDD (ex: 11999998888).
                  </span>
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.4rem' }}>
                    ✉️ E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="seuemail@exemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.4rem' }}>
                    <MessageSquareQuote size={16} /> Alguma preferência ou observação?
                  </label>
                  <textarea
                    rows={3}
                    className="custom-input"
                    placeholder="Ex: Não passar máquina 1 nas laterais..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Summary Voucher */}
            <div className="summary-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Resumo do Agendamento
              </h3>

              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label"><Scissors size={16} /> Serviço</span>
                  <span className="summary-val">{selectedService?.name}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label"><User size={16} /> Barbeiro</span>
                  <span className="summary-val">{selectedBarber?.name}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label"><Calendar size={16} /> Data</span>
                  <span className="summary-val">{formatDateBR(selectedDate)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label"><Clock size={16} /> Horário</span>
                  <span className="summary-val">{selectedTime} ({selectedService?.durationMinutes} min)</span>
                </div>

                <div className="summary-total">
                  <span className="total-title">Total a Pagar no Local</span>
                  <span className="total-amount">
                    {selectedService ? formatCurrency(selectedService.price) : 'R$ 0,00'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: '1.1rem' }}
                disabled={submitting}
                onClick={handleConfirmBooking}
              >
                {submitting ? 'Confirmando...' : 'Finalizar Agendamento'}
              </button>
            </div>
          </div>

          <div className="step-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
              <ChevronLeft size={18} /> Voltar
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS / CONFIRMATION */}
      {step === 5 && confirmedAppointment && (
        <div className="success-card">
          <div className="success-icon-wrap">
            <CheckCircle2 size={40} />
          </div>

          <h2 className="success-title">Agendamento Realizado!</h2>
          <p className="success-subtitle">
            Seu horário foi reservado na {settings?.name || 'Barbearia'}.
          </p>

          <div className="receipt-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Código do Agendamento:</strong>
              <span style={{ color: 'var(--text-muted)' }}>#{confirmedAppointment.id.slice(-6).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Cliente:</strong>
              <span>{confirmedAppointment.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Serviço:</strong>
              <span>{confirmedAppointment.serviceName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Barbeiro:</strong>
              <span>{confirmedAppointment.barberName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Data & Horário:</strong>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {formatDateBR(confirmedAppointment.date)} às {confirmedAppointment.time}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <strong>Valor Total:</strong>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                {formatCurrency(confirmedAppointment.totalAmount)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href={getWhatsAppMessageUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              📱 Enviar Confirmação via WhatsApp
            </a>

            <button type="button" className="btn-secondary" onClick={resetBooking}>
              Fazer Outro Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
