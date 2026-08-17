'use client';

import React from 'react';
import { CheckCircle2, Clock, ListTodo, AlertCircle, TrendingUp } from 'lucide-react';
import { TaskStats } from '@/lib/api';

interface StatsCardsProps {
  stats: TaskStats | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const completionRate =
    stats && stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

  const cards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: <ListTodo size={22} />,
      color: 'var(--accent)',
      bg: 'var(--accent-light)',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: <CheckCircle2 size={22} />,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: <Clock size={22} />,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      icon: <AlertCircle size={22} />,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: 100 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl p-5 animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {card.value}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {card.label}
          </p>
        </div>
      ))}

      {/* Completion rate bar – spans full width on mobile, last slot on lg */}
      {stats && stats.total > 0 && (
        <div
          className="col-span-2 lg:col-span-4 rounded-2xl p-5 animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              Overall Progress
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
              {completionRate}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%`, background: 'var(--accent)' }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>
      )}
    </div>
  );
}
