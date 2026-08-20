'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckSquare, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type Mode = 'login' | 'register';

export default function LoginClient() {
  const { login, register, guestLogin } = useAuth();
  const router = useRouter();

  const [mode,          setMode]          = useState<Mode>('login');
  const [form,          setForm]          = useState({ name: '', email: '', password: '' });
  const [showPass,      setShowPass]      = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [guestLoading,  setGuestLoading]  = useState(false);
  const [error,         setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setIsLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.'));
    } finally { setIsLoading(false); }
  };

  const handleGuest = async () => {
    setGuestLoading(true); setError('');
    try { await guestLogin(); router.replace('/dashboard'); }
    catch { setError('Guest login failed.'); }
    finally { setGuestLoading(false); }
  };

  const toggleMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fc 0%, #eef2ff 50%, #faf5ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'inherit',
    }}>

      {/* ── Card ── */}
      <div
        className="animate-scale-in"
        style={{
          width: '100%', maxWidth: 400,
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(108,99,255,0.12), 0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(108,99,255,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Gradient top strip */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6c63ff, #a78bfa, #6c63ff)', backgroundSize: '200% 100%' }} />

        <div style={{ padding: '36px 32px 32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 6px 20px rgba(108,99,255,0.3)',
            }}>
              <CheckSquare size={26} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4, textAlign: 'center' }}>
              {mode === 'login' ? "Welcome back 👋" : "Create account"}
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              {mode === 'login' ? 'Sign in to your workspace' : 'Start managing tasks for free'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#dc2626', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 15 }}>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'register' && (
              <InputField icon={<User size={15} />} label="Full Name" placeholder="Jane Doe"
                type="text" value={form.name} onChange={v => setForm({ ...form, name: v })}
                required autoComplete="name"
              />
            )}

            <InputField icon={<Mail size={15} />} label="Email" placeholder="you@example.com"
              type="email" value={form.email} onChange={v => setForm({ ...form, email: v })}
              required autoComplete="email"
            />

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isLoading ? '#8b83ff' : 'linear-gradient(135deg, #6c63ff, #8b83ff)',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '12px 0', fontSize: 14, fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
                transition: 'all 0.2s', marginTop: 4, fontFamily: 'inherit',
              }}
            >
              {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <ArrowRight size={16} />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            disabled={guestLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#f8f9fc', color: '#475569',
              border: '1.5px solid #e2e8f0', borderRadius: 10,
              padding: '11px 0', fontSize: 13.5, fontWeight: 600,
              cursor: guestLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.color = '#6c63ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
          >
            {guestLoading
              ? <span className="spinner-dark" style={{ width: 15, height: 15 }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            }
            Continue as Guest
          </button>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button" onClick={toggleMode}
              style={{ color: '#6c63ff', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, label, placeholder, type, value, onChange, required, autoComplete }: {
  icon: React.ReactNode; label: string; placeholder: string;
  type: string; value: string; onChange: (v: string) => void;
  required?: boolean; autoComplete?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
          {icon}
        </span>
        <input
          type={type} className="input-field" style={{ paddingLeft: 38 }}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          required={required} autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
