'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Scissors, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Store, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  PlusCircle,
  ExternalLink,
  ChevronRight,
  LogIn,
  Copy
} from 'lucide-react';
import Link from 'next/link';

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function SaaSPlatformHome() {
  const router = useRouter();
  const [barbershops, setBarbershops] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form para qualquer dono cadastrar sua barbearia
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerInstagram, setOwnerInstagram] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PRO'>('PRO');
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdLoginUrl, setCreatedLoginUrl] = useState<string | null>(null);
  const [createdAdminEmail, setCreatedAdminEmail] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/barbershops');
      const data = await res.json();
      setBarbershops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBarbershop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !ownerPhone || !adminEmail || !adminPassword) {
      alert('Preencha os campos obrigatórios (incluindo e-mail e senha de login do admin).');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/barbershops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shopName,
          ownerName,
          ownerPhone,
          adminEmail,
          adminPassword,
          address: ownerAddress || 'Centro',
          plan: selectedPlan,
          instagram: ownerInstagram,
        }),
      });

      const data = await res.json();

      if (res.ok && data.barbershop) {
        // Se escolheu o Plano PRO, redireciona imediatamente para o checkout do Mercado Pago
        if (selectedPlan === 'PRO') {
          window.location.href = 'https://mpago.la/2dCR8ZP';
          return;
        }

        setCreatedUrl(data.defaultUrl);
        setCreatedLoginUrl(data.loginUrl || `${data.defaultUrl}/login`);
        setCreatedAdminEmail(data.adminEmail || adminEmail);
        fetchBarbershops();
      } else {
        alert(data.error || 'Erro ao criar barbearia.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha ao conectar ao servidor.');
    } finally {
      setCreating(false);
    }
  };

  const getInstagramUrl = (shop: any) => {
    if (shop.instagram && typeof shop.instagram === 'string' && shop.instagram.trim()) {
      const clean = shop.instagram.trim();
      return clean.startsWith('http') ? clean : `https://instagram.com/${clean.replace('@', '')}`;
    }
    return `https://instagram.com/${shop.slug}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    if (typeof window !== 'undefined') {
      const full = text.startsWith('http') ? text : `${window.location.origin}${text}`;
      navigator.clipboard.writeText(full);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Scissors size={24} />
            </div>
            <div className="brand-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="brand-title">BARBERON</span>
                <span style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}>
                  SAAS MULTI-TENANT
                </span>
              </div>
              <span className="brand-subtitle">Plataforma de Gestão para Barbearias</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setCreatedUrl(null);
                setShowModal(true);
              }}
            >
              <PlusCircle size={18} /> Cadastrar Barbearia
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 1.5rem 3.5rem 1.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--accent-gold-light)',
          color: 'var(--accent-gold-text)',
          padding: '0.45rem 1rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} fill="#d97706" /> O Sistema Ideal Para Qualquer Dono de Barbearia
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem'
        }}>
          Transforme sua Barbearia em uma <br />
          <span style={{ color: 'var(--accent-gold)' }}>Máquina de Agendamentos e Lucro</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          Crie a conta da sua barbearia em menos de 1 minuto. Receba um link exclusivo de agendamento online para seus clientes, controle a agenda da equipe, calcule comissões automaticamente e envie lembretes no WhatsApp.
        </p>

        {/* Box de Demonstração / Exemplos das Telas do Sistema */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          maxWidth: '920px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={13} color="#059669" /> Demonstração Interativa em Tempo Real
          </div>
          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Experimente o Sistema Antes de Cadastrar
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.88rem' }}>
            Navegue pelos módulos de exemplo abaixo e alterne entre a <strong>Versão Gratuita</strong> e a <strong>Versão Paga (PRO)</strong> para ver como cada tela funciona na prática:
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/admin"
              className="btn-primary"
              style={{ padding: '0.85rem 1.35rem', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldCheck size={18} /> Ver Demo Admin (/admin)
            </Link>
            <Link
              href="/barber"
              style={{
                padding: '0.85rem 1.35rem',
                fontSize: '0.9rem',
                textDecoration: 'none',
                background: '#8b5cf6',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Scissors size={18} /> Ver Demo Barbeiro (/barber)
            </Link>
            <Link
              href="/client"
              style={{
                padding: '0.85rem 1.35rem',
                fontSize: '0.9rem',
                textDecoration: 'none',
                background: '#10b981',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Users size={18} /> Ver Demo Cliente (/client)
            </Link>
            <Link
              href="/login"
              className="btn-secondary"
              style={{ padding: '0.85rem 1.35rem', fontSize: '0.9rem', textDecoration: 'none' }}
            >
              Entrar / Login →
            </Link>
          </div>
        </div>
      </section>

      {/* Barbearias Ativas na Plataforma (Demonstração / Multi-Tenancy em Ação) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">Barbearias Cadastradas na Plataforma</h2>
            <p className="section-desc">
              Cada dono tem seu link exclusivo e dados 100% isolados. Clique para testar:
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCreatedUrl(null);
              setShowModal(true);
            }}
          >
            <PlusCircle size={17} /> Criar Mais uma Barbearia
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando barbearias da plataforma...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      background: shop.plan === 'PRO' ? 'var(--accent-gold-light)' : '#f1f5f9',
                      color: shop.plan === 'PRO' ? 'var(--accent-gold-text)' : '#0f172a',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                    }}>
                      PLANO {shop.plan}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      /b/{shop.slug}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {shop.name}
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📍 {shop.address}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Dono: <strong>{shop.ownerName}</strong></div>
                    <div>WhatsApp: <strong>{shop.ownerPhone}</strong></div>
                    <div>Horário: <strong>{shop.openHours}</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <Link
                    href={`/b/${shop.slug}`}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Calendar size={18} /> Agendar Horário ({shop.plan === 'FREE' ? 'Gratuita' : 'PRO'})
                  </Link>

                  <a
                    href={getInstagramUrl(shop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: 'transparent',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 1rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <InstagramIcon size={16} /> Conhecer no Instagram
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Planos para Donos de Barbearia */}
      <section style={{ background: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Planos Sob Medida Para Seu Negócio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '3.5rem' }}>
            Escolha como começar a gerenciar sua barbearia com o BarberOn.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            {/* Free Plan */}
            <div style={{
              background: 'var(--bg-main)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>BarberOn Free</div>
                <div style={{ fontSize: '2.6rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  Grátis <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>/ para sempre</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Até 1 Barbeiro</strong> ativo
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> Até 30 agendamentos por mês
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Link próprio da Área de Login (/b/[slug]/login)</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> Link próprio de agendamento online (/b/[slug])
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> Cadastro de clientes e serviços
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', marginTop: '2.5rem' }}
                onClick={() => {
                  setSelectedPlan('FREE');
                  setCreatedUrl(null);
                  setCreatedLoginUrl(null);
                  setShowModal(true);
                }}
              >
                Cadastrar Grátis
              </button>
            </div>

            {/* PRO Plan */}
            <div style={{
              background: '#ffffff',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                right: '24px',
                background: 'var(--accent-gold)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em'
              }}>
                RECOMENDADO
              </div>

              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>BarberOn PRO</div>
                <div style={{ fontSize: '2.6rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  R$ 89 <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>/mês</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Vários Barbeiros Ilimitados</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Agendamentos Ilimitados</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Link próprio da Área de Login (/b/[slug]/login)</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Cálculo Automático de Comissões</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Controle Financeiro & Lucro Real</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Lembretes Automáticos no WhatsApp</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} color="var(--success)" /> <strong>Histórico Completo do Cliente</strong>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', marginTop: '2.5rem' }}
                onClick={() => {
                  setSelectedPlan('PRO');
                  setCreatedUrl(null);
                  setCreatedLoginUrl(null);
                  setShowModal(true);
                }}
              >
                Começar no Plano PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE CADASTRO DA BARBEARIA */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Cadastrar Minha Barbearia</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Gere os links exclusivos da sua barbearia em segundos e comece a atender.
                </p>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {createdUrl ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <Check size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Barbearia Criada com Sucesso!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  Seus links próprios já estão ativos tanto no <strong>Plano {selectedPlan}</strong>. Compartilhe com sua equipe e clientes:
                </p>

                {/* Box de confirmação com dados de acesso do Admin */}
                {createdAdminEmail && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                      🔐 Seu Login de Administrador Criado:
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#047857' }}>
                      E-mail: <strong>{createdAdminEmail}</strong>
                    </div>
                  </div>
                )}

                {/* Único Link de Acesso Oficial (Área de Login) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem', textAlign: 'left' }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <LogIn size={15} color="#d97706" /> Link Único de Acesso da Barbearia:
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdLoginUrl || `${createdUrl}/login`, 'login')}
                        style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copiedType === 'login' ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        {copiedType === 'login' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <code style={{ fontSize: '0.88rem', color: '#b45309', wordBreak: 'break-all', fontWeight: 700 }}>
                      {typeof window !== 'undefined' ? `${window.location.origin}${createdLoginUrl || `${createdUrl}/login`}` : `${createdUrl}/login`}
                    </code>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#78350f' }}>
                      Guarde esse link exclusivo. É por ele que o administrador e os barbeiros acessam seus respectivos painéis.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link 
                    href={createdLoginUrl || `${createdUrl}/login`} 
                    className="btn-primary" 
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#d97706', padding: '0.9rem' }}
                  >
                    <LogIn size={18} /> Entrar na Área da Barbearia
                  </Link>

                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowModal(false)}
                    style={{ width: '100%' }}
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBarbershop} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Nome da Barbearia *
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Barbearia Viking, Navalha Nobre..."
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      Seu Nome (Dono) *
                    </label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Ex: Carlos Eduardo"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      WhatsApp da Barbearia *
                    </label>
                    <input
                      type="tel"
                      className="custom-input"
                      placeholder="11988887777"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Login e Senha do Dono / Admin */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="#d97706" /> Definir Login e Senha do Admin (Dono)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                        E-mail de Login *
                      </label>
                      <input
                        type="email"
                        className="custom-input"
                        placeholder="dono@barbearia.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                        Senha de Acesso *
                      </label>
                      <input
                        type="password"
                        className="custom-input"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Rua das Flores, 123 - Centro"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Instagram da Barbearia (opcional)
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: @barbeariaimperial ou link do Instagram"
                    value={ownerInstagram}
                    onChange={(e) => setOwnerInstagram(e.target.value)}
                  />
                </div>

                <div>
                  <label className="picker-label" style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Plano Desejado
                  </label>
                  <select
                    className="custom-input"
                    value={selectedPlan}
                    onChange={(e: any) => setSelectedPlan(e.target.value)}
                  >
                    <option value="PRO">Plano PRO (Múltiplos Barbeiros + Financeiro)</option>
                    <option value="FREE">Plano FREE (1 Barbeiro + 30 Agendamentos/mês)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                  style={{ marginTop: '0.5rem', padding: '1rem' }}
                >
                  {creating ? 'Criando Barbearia...' : 'Criar Barbearia e Acessar Agora'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '2.5rem 1.5rem',
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
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong>BarberOn SaaS</strong> • Sistema completo para qualquer barbearia.
          </div>
          <div>
            Todos os direitos reservados • Suporte e Vendas: (11) 98888-7777
          </div>
        </div>
      </footer>
    </div>
  );
}
