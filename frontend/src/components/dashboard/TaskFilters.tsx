'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface TaskFiltersProps {
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning', 'Other'];

export function TaskFilters({
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: TaskFiltersProps) {
  const selectClass = `
    text-sm rounded-xl px-3 py-2 cursor-pointer
    border transition-colors outline-none
  `;
  const selectStyle = {
    background: 'var(--bg-card)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="flex items-center gap-1.5 text-sm font-medium shrink-0"
        style={{ color: 'var(--text-secondary)' }}
      >
        <SlidersHorizontal size={15} />
        Filters:
      </span>

      {/* Priority */}
      <select
        className={selectClass}
        style={selectStyle}
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      {/* Category */}
      <select
        className={selectClass}
        style={selectStyle}
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        className={selectClass}
        style={selectStyle}
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort tasks"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority">By Priority</option>
        <option value="dueDate">By Due Date</option>
      </select>
    </div>
  );
}
