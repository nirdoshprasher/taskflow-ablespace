'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Camera, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    bio:      '',
    username: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/login'); return; }
    setForm({
      name:     user.name     ?? '',
      email:    user.email    ?? '',
      bio:      '',
      username: user.email?.split('@')[0] ?? '',
    });
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLeave = () => {
    logout();
    router.replace('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Workspace</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Profile</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 600 }}>

          {/* Profile card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
          }}>

            {/* Header banner */}
            <div style={{
              height: 100,
              background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
            }} />

            {/* Avatar */}
            <div style={{ padding: '0 24px', marginTop: -36, marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '3px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: 'white',
                }}>
                  {user?.avatar
                    ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
                <button style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}>
                  <Camera size={12} />
                </button>
              </div>
              {user?.isGuest && (
                <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
                  Guest Session
                </span>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ padding: '8px 24px 24px' }}>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {user?.name ?? 'User'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                {user?.isGuest ? 'Guest Account' : user?.email}
              </p>

              {/* Full name */}
              <Field label="Full Name">
                <input
                  className="profile-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  disabled={user?.isGuest}
                />
              </Field>

              {/* Email */}
              <Field label="Email">
                <input
                  className="profile-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  disabled={user?.isGuest}
                />
              </Field>

              {/* Username */}
              <Field label="Username">
                <input
                  className="profile-input"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="username"
                  disabled={user?.isGuest}
                />
              </Field>

              {/* Bio */}
              <Field label="Bio">
                <textarea
                  className="profile-input"
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  style={{ resize: 'none' }}
                  disabled={user?.isGuest}
                />
              </Field>

              {/* Save button */}
              {!user?.isGuest && (
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)', color: 'white',
                    border: 'none', borderRadius: 8,
                    padding: '9px 24px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', marginTop: 8, marginBottom: 24,
                    transition: 'background 0.15s',
                  }}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Danger Zone
                </p>
                <button
                  type="button"
                  onClick={handleLeave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#fee2e2', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: 8,
                    padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Leave this workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .profile-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .profile-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.12);
        }
        .profile-input:disabled {
          background: var(--bg-secondary);
          color: var(--text-muted);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
