'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Flag, Calendar, Tag, Pencil, Trash2, CheckCircle2, Circle, Plus, Check } from 'lucide-react';
import { Task, Subtask, Comment, subtasksApi, commentsApi } from '@/lib/api';
import { MiniCalendar } from '@/components/ui/MiniCalendar';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  high:   { bg: '#fee2e2', text: '#dc2626' },
  medium: { bg: '#fef3c7', text: '#d97706' },
  low:    { bg: '#dcfce7', text: '#16a34a' },
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  todo:        { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' },
  in_progress: { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' },
  completed:   { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
};

export function TaskDetailPanel({ task, onClose, onEdit, onDelete, onToggleComplete }: TaskDetailPanelProps) {
  const [subtasks,    setSubtasks]    = useState<Subtask[]>([]);
  const [comments,    setComments]    = useState<Comment[]>([]);
  const [newTitle,    setNewTitle]    = useState('');
  const [newComment,  setNewComment]  = useState('');
  const [addingNew,   setAddingNew]   = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      loadSubtasks(task.id);
      loadComments(task.id);
    }
  }, [task?.id]);

  useEffect(() => {
    if (addingNew && inputRef.current) inputRef.current.focus();
  }, [addingNew]);

  const loadSubtasks = async (taskId: string) => {
    setLoadingSubs(true);
    try {
      const res = await subtasksApi.getAll(taskId);
      setSubtasks(res.data);
    } catch { setSubtasks([]); }
    finally { setLoadingSubs(false); }
  };

  const loadComments = async (taskId: string) => {
    try {
      const res = await commentsApi.getAll(taskId);
      setComments(res.data);
    } catch { setComments([]); }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newTitle.trim()) return;
    try {
      const res = await subtasksApi.create(task.id, newTitle.trim());
      setSubtasks(prev => [...prev, res.data]);
      setNewTitle('');
      setAddingNew(false);
    } catch {}
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!task) return;
    try {
      const res = await subtasksApi.update(task.id, subtask.id, { isCompleted: !subtask.isCompleted });
      setSubtasks(prev => prev.map(s => s.id === subtask.id ? res.data : s));
    } catch {}
  };

  const handleDeleteSubtask = async (subtask: Subtask) => {
    if (!task) return;
    try {
      await subtasksApi.delete(task.id, subtask.id);
      setSubtasks(prev => prev.filter(s => s.id !== subtask.id));
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setPostingComment(true);
    try {
      const res = await commentsApi.create(task.id, newComment.trim());
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch {}
    finally { setPostingComment(false); }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!task) return;
    try {
      await commentsApi.delete(task.id, comment.id);
      setComments(prev => prev.filter(c => c.id !== comment.id));
    } catch {}
  };

  if (!task) return null;

  const pc = priorityColors[task.priority] ?? priorityColors.medium;
  const sc = statusColors[task.status]     ?? statusColors.todo;
  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const completedCount = subtasks.filter(s => s.isCompleted).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div
      className="animate-slide-right"
      style={{
        width: 360, minWidth: 360,
        height: '100%',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Task Details
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onEdit(task)}
            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fee2e2', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>

        {/* Title + complete toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
          <button
            onClick={() => onToggleComplete(task)}
            style={{ marginTop: 2, flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: task.isCompleted ? '#16a34a' : 'var(--text-muted)' }}
          >
            {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
          <h2 style={{
            fontSize: 16, fontWeight: 700, lineHeight: 1.4,
            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.isCompleted ? 'line-through' : 'none',
          }}>
            {task.title}
          </h2>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task.description}</p>
          </div>
        )}

        {/* Meta details */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          {/* Status */}
          <DetailRow label="Status">
            <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
              {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </span>
          </DetailRow>

          {/* Priority */}
          <DetailRow label="Priority">
            <span style={{ background: pc.bg, color: pc.text, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Flag size={11} />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </DetailRow>

          {/* Due Date */}
          <DetailRow label="Due Date">
            {task.dueDate ? (
              <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={12} />
                {formatDate(task.dueDate)}
                {isOverdue && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '1px 7px', borderRadius: 99, fontSize: 10 }}>Overdue</span>}
              </span>
            ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not set</span>}
          </DetailRow>

          {/* Project / Category */}
          {task.category && (
            <DetailRow label="Project">
              <span style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Tag size={11} />
                {task.category}
              </span>
            </DetailRow>
          )}
        </div>

        {/* ── Calendar (due date) ── */}
        {task.dueDate && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Due Date
            </p>
            <MiniCalendar highlightDate={task.dueDate} />
          </div>
        )}

        {/* ── Subtasks ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Subtasks
              </span>
              {subtasks.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '1px 8px', borderRadius: 99 }}>
                  {completedCount}/{subtasks.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setAddingNew(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {/* Progress bar */}
          {subtasks.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{progress}% complete</p>
            </div>
          )}

          {/* Subtask list */}
          {loadingSubs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <div className="spinner-dark" style={{ width: 18, height: 18 }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 8,
                    background: sub.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  className="group"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleSubtask(sub)}
                    style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                      border: sub.isCompleted ? '2px solid var(--accent)' : '2px solid #d1d5db',
                      background: sub.isCompleted ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', padding: 0,
                    }}
                  >
                    {sub.isCompleted && <Check size={9} color="white" strokeWidth={3} />}
                  </button>

                  {/* Title */}
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: sub.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: sub.isCompleted ? 'line-through' : 'none',
                  }}>
                    {sub.title}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteSubtask(sub)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 2, display: 'flex',
                      alignItems: 'center', opacity: 0, transition: 'opacity 0.15s',
                    }}
                    className="subtask-delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add new subtask input */}
              {addingNew && (
                <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <input
                    ref={inputRef}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Subtask title..."
                    className="input-field"
                    style={{ fontSize: 13, padding: '7px 10px', flex: 1 }}
                    onKeyDown={e => { if (e.key === 'Escape') { setAddingNew(false); setNewTitle(''); } }}
                  />
                  <button
                    type="submit"
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingNew(false); setNewTitle(''); }}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'none', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={13} />
                  </button>
                </form>
              )}

              {subtasks.length === 0 && !addingNew && (
                <button
                  onClick={() => setAddingNew(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 10px', borderRadius: 8,
                    border: '1px dashed var(--border)',
                    background: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--text-muted)', fontFamily: 'inherit',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <Plus size={13} /> Add a subtask
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Comments ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Comments
              {comments.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '1px 7px', borderRadius: 99, fontWeight: 500 }}>
                  {comments.length}
                </span>
              )}
            </span>
          </div>

          {/* Add comment form */}
          <form onSubmit={handleAddComment} style={{ marginBottom: 12 }}>
            <textarea
              ref={commentRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              className="input-field"
              rows={2}
              style={{ resize: 'none', fontSize: 13, marginBottom: 6 }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddComment(e as any);
                }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!newComment.trim() || postingComment}
                style={{
                  background: 'var(--accent)', color: 'white',
                  border: 'none', borderRadius: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  opacity: newComment.trim() ? 1 : 0.5,
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {postingComment
                  ? <span className="spinner" style={{ width: 12, height: 12 }} />
                  : null
                }
                Post
              </button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              No comments yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comments.map(comment => (
                <div
                  key={comment.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 12px',
                  }}
                  className="group"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {comment.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {comment.authorName}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 2,
                        opacity: 0, transition: 'opacity 0.15s',
                        display: 'flex', alignItems: 'center',
                      }}
                      className="subtask-delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            Created: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(task.createdAt)}</span>
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Updated: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(task.updatedAt)}</span>
          </p>
        </div>
      </div>

      {/* ── Footer: Complete button ── */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={() => onToggleComplete(task)}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8,
            border: `1px solid ${task.isCompleted ? 'var(--border)' : 'var(--accent)'}`,
            background: task.isCompleted ? 'var(--bg-secondary)' : 'var(--accent)',
            color: task.isCompleted ? 'var(--text-secondary)' : 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          {task.isCompleted
            ? <><Circle size={14} /> Mark as Incomplete</>
            : <><CheckCircle2 size={14} /> Mark as Complete</>
          }
        </button>
      </div>

      {/* Hover CSS for subtask delete button */}
      <style>{`
        .group:hover .subtask-delete { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

// Helper component
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ width: 90, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}
