'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Calendar, Tag } from 'lucide-react';
import { Task } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityConfig = {
  high: { label: 'High', class: 'priority-high', dot: '🔴' },
  medium: { label: 'Medium', class: 'priority-medium', dot: '🟡' },
  low: { label: 'Low', class: 'priority-low', dot: '🟢' },
};

const statusConfig = {
  todo: { label: 'To Do', class: 'status-todo' },
  in_progress: { label: 'In Progress', class: 'status-in_progress' },
  completed: { label: 'Completed', class: 'status-completed' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.todo;

  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="task-card p-4 animate-fade-in relative group">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`custom-checkbox mt-0.5 ${task.isCompleted ? 'checked' : ''}`}
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium mb-1 truncate ${task.isCompleted ? 'line-through' : ''}`}
            style={{
              color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className="text-xs mb-2 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={priority.class as any}>
              {priority.dot} {priority.label}
            </Badge>
            <Badge variant={status.class as any}>
              {status.label}
            </Badge>
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-500' : ''
                }`}
                style={{ color: isOverdue ? undefined : 'var(--text-muted)' }}
              >
                <Calendar size={11} />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.category && (
              <span
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <Tag size={11} />
                {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-tertiary)] cursor-pointer"
            aria-label="Task options"
          >
            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg z-10 min-w-[140px] py-1 animate-scale-in"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => { setMenuOpen(false); onEdit(task); }}
              >
                <Pencil size={14} />
                Edit task
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => { setMenuOpen(false); onDelete(task); }}
              >
                <Trash2 size={14} />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
