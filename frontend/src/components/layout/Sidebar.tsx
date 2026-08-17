'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Palette, ChevronDown, CheckSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme, Theme } from '@/lib/theme-context';
import { TaskStats } from '@/lib/api';

interface SidebarProps {
  stats: TaskStats | null;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const themeOptions: { key: Theme; label: string; color: string }[] = [
  { key: 'light',  label: 'Light',  color: '#6c63ff' },
  { key: 'dark',   label: 'Dark',   color: '#334155' },
  { key: 'purple', label: 'Purple', color: '#7c3aed' },
  { key: 'ocean',  label: 'Ocean',  color: '#0284c7' },
];

const taskNav = [
  { id: 'all',         label: 'All Tasks',   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  )},
  { id: 'todo',        label: 'To Do',       icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/></svg>
  )},
  { id: 'in_progress', label: 'In Progress', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
  )},
  { id: 'completed',   label: 'Completed',   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
  )},
  { id: 'overdue', label: 'Overdue', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/></svg>
  ), danger: true },
];

export function Sidebar({ stats, activeFilter, onFilterChange, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();
  const [themeOpen, setThemeOpen] = useState(false);

  const counts: Record<string, number> = {
    all:         stats?.total      ?? 0,
    todo:        stats?.todo       ?? 0,
    in_progress: stats?.inProgress ?? 0,
    completed:   stats?.completed  ?? 0,
    overdue:     stats?.overdue    ?? 0,
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'G';

  const go = (path: string) => { onClose(); router.push(path); };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 39 }} />}

      <aside style={{
        width: 230, minWidth: 230,
        height: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, overflowY: 'auto', overflowX: 'hidden',
        position: 'relative', zIndex: 40,
      }}>

        {/* ── Logo ── */}
        <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)',
            flexShrink: 0,
          }}>
            <CheckSquare size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              TaskFlow
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Workspace</p>
          </div>
        </div>

        {/* ── User card ── */}
        <div style={{ padding: '0 12px 16px' }}>
          <button
            onClick={() => go('/profile')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 11px', borderRadius: 10,
              background: pathname === '/profile' ? 'var(--accent-light)' : 'var(--bg-secondary)',
              border: `1.5px solid ${pathname === '/profile' ? 'var(--accent-muted)' : 'var(--border)'}`,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (pathname !== '/profile') { e.currentTarget.style.background = 'var(--bg-tertiary)'; } }}
            onMouseLeave={e => { if (pathname !== '/profile') { e.currentTarget.style.background = 'var(--bg-secondary)'; } }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
                : initials
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'Guest'}
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.isGuest ? '👤 Guest session' : user?.email ?? ''}
              </p>
            </div>
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: '0 10px' }}>

          {/* Tasks */}
          <SectionLabel>Tasks</SectionLabel>
          {taskNav.map(item => {
            const active = pathname === '/dashboard' && activeFilter === item.id;
            const count = counts[item.id];
            const isDanger = (item as any).danger && count > 0;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (pathname !== '/dashboard') router.push('/dashboard');
                  onFilterChange(item.id); onClose();
                }}
                className={`nav-btn${active ? ' active' : ''}`}
                style={{
                  marginBottom: 1,
                  color: active ? undefined : isDanger ? 'var(--danger)' : undefined,
                  background: active ? undefined : undefined,
                }}
              >
                <span style={{ opacity: 0.8, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {count > 0 && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, borderRadius: 99, padding: '1px 7px', minWidth: 20, textAlign: 'center',
                    background: active ? 'rgba(255,255,255,0.25)' : isDanger ? 'var(--danger-bg)' : 'var(--bg-tertiary)',
                    color: active ? 'white' : isDanger ? 'var(--danger)' : 'var(--text-muted)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Projects */}
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Projects</SectionLabel>
            <button
              onClick={() => go('/projects')}
              className={`nav-btn${pathname === '/projects' ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.8, flexShrink: 0 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              All Projects
            </button>
          </div>

          {/* Theme */}
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                width: '100%', padding: '4px 4px 6px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontFamily: 'inherit',
              }}
            >
              <Palette size={11} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Theme</span>
              <ChevronDown size={11} style={{ marginLeft: 'auto', transform: themeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {themeOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '2px 2px 4px' }}>
                {themeOptions.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '6px 9px', borderRadius: 8,
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      background: theme === t.key ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      color: theme === t.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                      border: `1.5px solid ${theme === t.key ? 'var(--accent-muted)' : 'transparent'}`,
                      transition: 'all 0.14s',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Footer ── */}
        <div style={{ padding: '10px 10px 20px', borderTop: '1px solid var(--border-light)', marginTop: 8 }}>
          <button
            onClick={() => go('/profile')}
            className="nav-btn"
            style={{ color: 'var(--text-secondary)', marginBottom: 2 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.7 }}>
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Profile
          </button>
          <button
            onClick={logout}
            className="nav-btn"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={15} style={{ flexShrink: 0, opacity: 0.7 }} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700,
      color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.09em',
      marginBottom: 5, paddingLeft: 4,
    }}>
      {children}
    </p>
  );
}
