'use client';

import React from 'react';
import { Search, Plus, List, LayoutGrid, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuOpen: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewTask: () => void;
  title: string;
  view: 'list' | 'board';
  onViewChange: (v: 'list' | 'board') => void;
}

export function Header({ onMenuOpen, searchQuery, onSearchChange, onNewTask, title, view, onViewChange }: HeaderProps) {
  return (
    <header style={{
      height: 58,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', gap: 14,
      flexShrink: 0, zIndex: 10,
      boxShadow: '0 1px 0 var(--border)',
    }}>

      {/* Mobile menu */}
      <button
        onClick={onMenuOpen}
        className="hide-mobile"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>Workspace</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--border)', flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
        }}>
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search tasks…"
          className="input-field"
          style={{ paddingLeft: 34, paddingTop: 7, paddingBottom: 7, fontSize: 13, width: 210, borderRadius: 8 }}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* View toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 8, padding: 3,
        border: '1px solid var(--border)',
        gap: 2, flexShrink: 0,
      }}>
        {([
          { v: 'list'  as const, Icon: List,        title: 'List view'  },
          { v: 'board' as const, Icon: LayoutGrid,  title: 'Board view' },
        ]).map(({ v, Icon, title: t }) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            title={t}
            style={{
              padding: '5px 9px', borderRadius: 6, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              background: view === v ? 'var(--bg-card)' : 'transparent',
              color:      view === v ? 'var(--accent)'  : 'var(--text-muted)',
              boxShadow:  view === v ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.14s',
            }}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Add Task */}
      <button
        onClick={onNewTask}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--accent)',
          color: 'white', border: 'none',
          borderRadius: 9, padding: '8px 16px',
          fontSize: 13, fontWeight: 700,
          cursor: 'pointer', flexShrink: 0,
          boxShadow: 'var(--shadow-accent)',
          transition: 'all 0.15s', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none'; }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Task
      </button>
    </header>
  );
}
