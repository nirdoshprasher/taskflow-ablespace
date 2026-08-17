'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  highlightDate?: string; // ISO date string
  onDateSelect?: (date: string) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export function MiniCalendar({ highlightDate, onDateSelect }: MiniCalendarProps) {
  const today = new Date();
  const [current, setCurrent] = useState(() => {
    if (highlightDate) {
      const d = new Date(highlightDate);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const highlight = highlightDate ? new Date(highlightDate) : null;

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrent(c => {
      if (c.month === 0) return { year: c.year - 1, month: 11 };
      return { year: c.year, month: c.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrent(c => {
      if (c.month === 11) return { year: c.year + 1, month: 0 };
      return { year: c.year, month: c.month + 1 };
    });
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  const isHighlighted = (day: number) =>
    highlight &&
    day === highlight.getDate() &&
    current.month === highlight.getMonth() &&
    current.year === highlight.getFullYear();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDayClick = (day: number | null) => {
    if (!day || !onDateSelect) return;
    const m = String(current.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onDateSelect(`${current.year}-${m}-${d}`);
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
          {MONTHS[current.month]} {current.year}
        </span>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => (
          <button
            key={i}
            onClick={() => handleDayClick(day)}
            disabled={!day}
            style={{
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: isHighlighted(day ?? 0) || isToday(day ?? 0) ? 700 : 400,
              borderRadius: 6, border: 'none',
              cursor: day ? 'pointer' : 'default',
              background: isHighlighted(day ?? 0)
                ? 'var(--accent)'
                : isToday(day ?? 0)
                ? 'var(--accent-light)'
                : 'transparent',
              color: isHighlighted(day ?? 0)
                ? 'white'
                : isToday(day ?? 0)
                ? 'var(--accent-text)'
                : day
                ? 'var(--text-primary)'
                : 'transparent',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => {
              if (day && !isHighlighted(day) && !isToday(day))
                (e.target as HTMLElement).style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={e => {
              if (day && !isHighlighted(day) && !isToday(day))
                (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {day ?? ''}
          </button>
        ))}
      </div>

      {/* Legend */}
      {highlight && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Due: {highlight.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}
