'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Scissors, 
  Shield, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Store, 
  AlertCircle,
  ExternalLink,
  Phone,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

export default function BarbershopCustomLoginPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const { login, loginWithGoogle, registerClient, switchRole, resetPassword } = useAuth();

  const [barbershop, setBarbershop] = useState<any>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopNotFound, setShopNotFound] = useState(false);

  // Modo Login vs Cadastro de Cliente
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Campos de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Campos de Cadastro de Cliente
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadBarbershop() {
      if (!slug) return;
      try {
        setLoadingShop(true);
        const res = await fetch(`/api/barbershops/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          setShopNotFound(true);
          return;
        }
        const data = await res.json();
        setBarbershop(data);
      } catch (err) {
        console.error(err);
        setShopNotFound(true);
      } finally {
        setLoadingShop(false);
      }
    }
    loadBarbershop();
  }, [slug]);

  const handleCopyLoginLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    const result = await login(email, password, slug);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('As senhas digitadas não coincidem.');
      return;
    }

    setRegLoading(true);
    const res = await registerClient({
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      slug,
    });
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Erro ao realizar cadastro.');
    } else {
      setRegSuccess('Conta de cliente criada com sucesso! Redirecionando...');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await resetPassword(forgotEmail);
    setForgotFeedback(res.message);
  };

  if (loadingShop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Scissors size={40} className="status-dot" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Carregando área de login da barbearia...</p>
        </div>
      </div>
    );
  }

  if (shopNotFound || !barbershop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Barbearia não encontrada</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
            O link de login informado (<code>/b/{slug}/login</code>) não corresponde a nenhuma barbearia ativa.
          </p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  const isPro = barbershop.plan === 'PRO';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090d16' }}>
      {/* Top Banner de Identificação da Barbearia */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.9rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: isPro ? '#d97706' : '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scissors size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem' }}>{barbershop.name}</span>
              <span style={{
                background: isPro ? 'rgba(217, 119, 6, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                color: isPro ? '#fbbf24' : '#60a5fa',
                border: `1px solid ${isPro ? 'rgba(217, 119, 6, 0.4)' : 'rgba(37, 99, 235, 0.4)'}`,
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                letterSpacing: '0.04em'
              }}>
                PLANO {barbershop.plan}
              </span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{barbershop.address}</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          width: '100%',
          maxWidth: '470px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: isPro ? '#d97706' : '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem auto',
              boxShadow: isPro ? '0 8px 20px -4px rgba(217, 119, 6, 0.5)' : '0 8px 20px -4px rgba(37, 99, 235, 0.5)'
            }}>
              <Scissors size={28} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '0.75rem',
              letterSpacing: '0.03em'
            }}>
              <Store size={13} /> ÁREA EXCLUSIVA DE ACESSO
            </div>

            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
              {barbershop.name}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Login do Dono, Barbeiros e Clientes
            </p>
          </div>

          {/* Form Area */}
          <div style={{ padding: '1.75rem 1.75rem' }}>
            {/* Alternador de Modo: Entrar vs Criar Conta */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); setRegError(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: authMode === 'login' ? '#ffffff' : 'transparent',
                  color: authMode === 'login' ? '#0f172a' : '#64748b',
                  fontWeight: authMode === 'login' ? 700 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <User size={15} /> Entrar na Barbearia
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); setRegError(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: authMode === 'register' ? '#ffffff' : 'transparent',
                  color: authMode === 'register' ? (isPro ? '#d97706' : '#2563eb') : '#64748b',
                  fontWeight: authMode === 'register' ? 700 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <UserPlus size={15} /> Criar Conta (Cliente)
              </button>
            </div>

            {authMode === 'login' ? (
              <>
                {errorMessage && (
                  <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem'
                  }}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      E-mail de Acesso
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ex: seuemail@exemplo.com"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowForgotModal(true); setForgotFeedback(''); }}
                        style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: isPro ? '#d97706' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      boxShadow: isPro ? '0 4px 14px rgba(217, 119, 6, 0.4)' : '0 4px 14px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    {loading ? 'Entrando...' : `Entrar na ${barbershop.name}`} <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => loginWithGoogle(slug)}
                    style={{
                      background: '#f8fafc',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.7rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#4285F4' }}>G</span> Entrar com Google
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    Cadastro de Cliente
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Crie sua conta exclusiva em <strong>{barbershop.name}</strong> para agendar cortes e acompanhar seus horários.
                  </p>
                </div>

                {regError && (
                  <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    {regSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Seu Nome Completo *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="ex: João Carlos"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      WhatsApp / Celular *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      E-mail *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Senha *
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mín. 6 dígitos"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Repita a senha"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    style={{
                      background: isPro ? '#d97706' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      boxShadow: isPro ? '0 4px 14px rgba(217, 119, 6, 0.4)' : '0 4px 14px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    {regLoading ? 'Criando conta...' : 'Criar Minha Conta & Entrar'} <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}



            {/* Links Auxiliares */}
            <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
              <Link href="/" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none' }}>
                Ir para o Portal BarberOn SaaS
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Esqueci a Senha */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 0, marginBottom: '0.5rem', color: '#0f172a' }}>
              Recuperar Acesso da Barbearia
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Informe seu e-mail cadastrado em <strong>{barbershop.name}</strong> para enviarmos as orientações.
            </p>

            {forgotFeedback ? (
              <div style={{ background: '#f0fdf4', color: '#166534', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {forgotFeedback}
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Enviar Link de Recuperação
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#64748b',
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
