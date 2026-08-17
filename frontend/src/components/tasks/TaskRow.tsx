'use client';

import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Task } from '@/lib/api';

interface TaskRowProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit:   (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function avatarColor(name: string) {
  const colors = ['#6c63ff','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export function TaskRow({ task, onToggleComplete, onEdit, onDelete, onSelect }: TaskRowProps) {
  const overdue = !!(task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date());
  const assignee = task.category ?? 'General';
  const bg = avatarColor(assignee);

  return (
    <tr onClick={() => onSelect(task)} className="task-row-hover" style={{ cursor: 'pointer' }}>

      {/* Task */}
      <td onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <button
            onClick={e => { e.stopPropagation(); onToggleComplete(task); }}
            style={{
              width: 17, height: 17, borderRadius: 5, flexShrink: 0, cursor: 'pointer', padding: 0,
              border: task.isCompleted ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: task.isCompleted ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {task.isCompleted && (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span style={{
            fontSize: 13, fontWeight: task.isCompleted ? 400 : 500,
            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 260,
          }} title={task.title}>
            {task.title}
          </span>
        </div>
      </td>

      {/* Priority */}
      <td>
        <span className={`pill-${task.priority}`}>
          {task.priority === 'high' ? '↑ High' : task.priority === 'medium' ? '→ Med' : '↓ Low'}
        </span>
      </td>

      {/* Assignee */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            {assignee.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
            {assignee}
          </span>
        </div>
      </td>

      {/* Due Date */}
      <td>
        {task.dueDate ? (
          <span style={{
            fontSize: 12, fontWeight: overdue ? 600 : 400,
            color: overdue ? 'var(--danger)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {overdue && <span style={{ fontSize: 13 }}>⚠</span>}
            {fmtDate(task.dueDate)}
          </span>
        ) : <span style={{ color: 'var(--border)', fontSize: 12 }}>—</span>}
      </td>

      {/* Actions */}
      <td onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={e => { e.stopPropagation(); onSelect(task); }}
            title="View details"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 7, border: 'none',
              background: 'var(--accent-light)', color: 'var(--accent-text)',
              cursor: 'pointer', fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit',
              transition: 'all 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(task); }}
            title="Edit"
            style={{
              padding: '4px 7px', borderRadius: 7, border: 'none',
              background: 'var(--bg-tertiary)', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              transition: 'all 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--info-bg)'; e.currentTarget.style.color = 'var(--info)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task); }}
            title="Delete"
            style={{
              padding: '4px 7px', borderRadius: 7, border: 'none',
              background: 'var(--danger-bg)', cursor: 'pointer',
              color: 'var(--danger)', display: 'flex', alignItems: 'center',
              transition: 'all 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}
