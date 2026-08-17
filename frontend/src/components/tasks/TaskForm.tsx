'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { getProjects, Project } from '@/lib/projects-store';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning', 'Other'];

export function TaskForm({ initialData, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [form, setForm] = useState({
    title:       initialData?.title       ?? '',
    description: initialData?.description ?? '',
    status:      initialData?.status      ?? 'todo',
    priority:    initialData?.priority    ?? 'medium',
    dueDate:     initialData?.dueDate ? initialData.dueDate.split('T')[0] : '',
    category:    initialData?.category    ?? '',
  });
  const [titleErr, setTitleErr] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => { setProjects(getProjects()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setTitleErr('Title is required'); return; }
    setTitleErr('');
    await onSubmit({ ...form, dueDate: form.dueDate || undefined, category: form.category || undefined });
  };

  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const sel: React.CSSProperties = { width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s' };

  const priorityColors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const statusColors:   Record<string, string> = { todo: '#94a3b8', in_progress: '#3b82f6', completed: '#10b981' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Title */}
      <div>
        <label style={lbl}>Task Title <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input
          className="input-field"
          value={form.title}
          onChange={e => { setForm({ ...form, title: e.target.value }); setTitleErr(''); }}
          placeholder="What needs to be done?"
          autoFocus maxLength={200}
          style={{ fontSize: 14, padding: '10px 13px' }}
        />
        {titleErr && <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 4 }}>⚠ {titleErr}</p>}
      </div>

      {/* Description */}
      <div>
        <label style={lbl}>Description</label>
        <textarea
          className="input-field"
          rows={3}
          style={{ resize: 'none', lineHeight: 1.6, fontSize: 13 }}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Add details, context, or notes…"
          maxLength={1000}
        />
      </div>

      {/* Priority + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Priority</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: priorityColors[form.priority] }} />
            <select style={{ ...sel, paddingLeft: 26 }} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Status</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: statusColors[form.status] }} />
            <select style={{ ...sel, paddingLeft: 26 }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Task['status'] })}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project + Due Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Project</label>
          <select style={sel} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">No Project</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            {projects.length === 0 && CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {form.category && projects.find(p => p.name === form.category) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: projects.find(p => p.name === form.category)?.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.category}</span>
            </div>
          )}
        </div>
        <div>
          <label style={lbl}>Due Date</label>
          <input
            type="date"
            className="input-field"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            style={{ fontSize: 13 }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6, borderTop: '1px solid var(--border-light)', marginTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel} size="md">Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading} size="md">
          {initialData?.id ? 'Save Changes' : '✓ Create Task'}
        </Button>
      </div>
    </form>
  );
}
