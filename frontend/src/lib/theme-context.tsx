'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'purple' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const themes: Record<Theme, Record<string, string>> = {
  light: {
    '--bg-main':       '#f7f8fc',
    '--bg-card':       '#ffffff',
    '--bg-sidebar':    '#ffffff',
    '--bg-secondary':  '#f7f8fc',
    '--bg-tertiary':   '#f0f1f7',
    '--text-primary':  '#111827',
    '--text-secondary':'#4b5563',
    '--text-muted':    '#9ca3af',
    '--border':        '#e5e7eb',
    '--border-light':  '#f3f4f6',
    '--accent':        '#6c63ff',
    '--accent-hover':  '#5b52e0',
    '--accent-light':  '#ede9ff',
    '--accent-text':   '#6c63ff',
  },
  dark: {
    '--bg-main':       '#111827',
    '--bg-card':       '#1f2937',
    '--bg-sidebar':    '#111827',
    '--bg-secondary':  '#1f2937',
    '--bg-tertiary':   '#374151',
    '--text-primary':  '#f9fafb',
    '--text-secondary':'#9ca3af',
    '--text-muted':    '#6b7280',
    '--border':        '#374151',
    '--border-light':  '#1f2937',
    '--accent':        '#818cf8',
    '--accent-hover':  '#6366f1',
    '--accent-light':  '#1e1b4b',
    '--accent-text':   '#a5b4fc',
  },
  purple: {
    '--bg-main':       '#f5f3ff',
    '--bg-card':       '#ffffff',
    '--bg-sidebar':    '#ffffff',
    '--bg-secondary':  '#f5f3ff',
    '--bg-tertiary':   '#ede9fe',
    '--text-primary':  '#1e1b4b',
    '--text-secondary':'#5b21b6',
    '--text-muted':    '#8b5cf6',
    '--border':        '#ddd6fe',
    '--border-light':  '#ede9fe',
    '--accent':        '#7c3aed',
    '--accent-hover':  '#6d28d9',
    '--accent-light':  '#ede9fe',
    '--accent-text':   '#7c3aed',
  },
  ocean: {
    '--bg-main':       '#f0f9ff',
    '--bg-card':       '#ffffff',
    '--bg-sidebar':    '#ffffff',
    '--bg-secondary':  '#f0f9ff',
    '--bg-tertiary':   '#e0f2fe',
    '--text-primary':  '#0c4a6e',
    '--text-secondary':'#0369a1',
    '--text-muted':    '#38bdf8',
    '--border':        '#bae6fd',
    '--border-light':  '#e0f2fe',
    '--accent':        '#0284c7',
    '--accent-hover':  '#0369a1',
    '--accent-light':  '#e0f2fe',
    '--accent-text':   '#0284c7',
  },
};

function applyTheme(t: Theme) {
  const root = document.documentElement;
  const vars = themes[t];
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', t);
  document.body.style.backgroundColor = vars['--bg-main'];
  document.body.style.color = vars['--text-primary'];
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    let saved: Theme = 'light';
    try {
      const s = localStorage.getItem('theme') as Theme;
      if (s && themes[s]) saved = s;
    } catch {}
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem('theme', t); } catch {}
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
