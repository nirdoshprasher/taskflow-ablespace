'use client';

import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Task } from '@/lib/api';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit:           (task: Task) => void;
  onDelete:         (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onNewTask:        () => void;
  onSelect?:        (task: Task) => void;
}

const columns = [
  { id: 'todo',        label: 'To Do',      color: '#6b7280', bg: '#f3f4f6' },
  { id: 'in_progress', label: 'In Progress', color: '#2563eb', bg: '#dbeafe' },
  { id: 'completed',   label: 'Completed',   color: '#059669', bg: '#d1fae5' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function KanbanBoard({ tasks, onEdit, onDelete, onToggleComplete, onNewTask, onSelect }: KanbanBoardProps) {
  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 2px 16px', alignItems: 'flex-start' }}>
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div
            key={col.id}
            style={{
              minWidth: 272, width: 272, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            {/* Column header */}
            <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{col.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: col.bg, color: col.color, borderRadius: 99, padding: '1px 7px' }}>
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={onNewTask}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 3, borderRadius: 5, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {colTasks.length === 0 && (
                <button
                  onClick={onNewTask}
                  style={{
                    padding: '14px 0', textAlign: 'center', color: 'var(--text-muted)',
                    fontSize: 12, background: 'none', border: '1px dashed var(--border)',
                    borderRadius: 8, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
                  }}
                >
                  + Add task
                </button>
              )}
              {colTasks.map(task => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleComplete={onToggleComplete}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ task, onEdit, onDelete, onToggleComplete, onSelect }: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
  onSelect?: (t: Task) => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={() => onSelect?.(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '11px 12px',
        boxShadow: hovered ? '0 4px 16px rgba(108,99,255,0.12)' : 'var(--shadow-sm)',
        transition: 'all 0.15s',
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <button
          onClick={e => { e.stopPropagation(); onToggleComplete(task); }}
          style={{
            width: 15, height: 15, borderRadius: 4, flexShrink: 0, cursor: 'pointer', marginTop: 1,
            border: task.isCompleted ? '2px solid var(--accent)' : '2px solid #d1d5db',
            background: task.isCompleted ? 'var(--accent)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            transition: 'all 0.15s',
          }}
        >
          {task.isCompleted && (
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <span style={{
          flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4,
          color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: task.isCompleted ? 'line-through' : 'none',
        }}>
          {task.title}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`pill-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.dueDate && (
            <span style={{ fontSize: 10, color: isOverdue ? '#dc2626' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
              {isOverdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div style={{
          display: 'flex', gap: 4,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
        }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(task); }}
            style={{ padding: '3px 6px', borderRadius: 5, border: 'none', background: 'var(--bg-tertiary)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
            title="Edit"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task); }}
            style={{ padding: '3px 6px', borderRadius: 5, border: 'none', background: '#fee2e2', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Project tag */}
      {task.category && (
        <div style={{ marginTop: 7 }}>
          <span style={{ fontSize: 10, color: 'var(--accent-text)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 99 }}>
            {task.category}
          </span>
        </div>
      )}
    </div>
  );
}
