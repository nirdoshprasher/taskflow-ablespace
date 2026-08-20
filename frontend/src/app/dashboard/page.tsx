'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { tasksApi, Task, TaskStats } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TaskRow } from '@/components/tasks/TaskRow';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// Wrap the entire page in Suspense to handle useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <div className="spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

const FILTER_TITLES: Record<string, string> = {
  all: 'Tasks', todo: 'To Do', in_progress: 'In Progress',
  completed: 'Completed', overdue: 'Overdue',
};

const SECTION_LABELS: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', completed: 'Completed',
};

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks,           setTasks]           = useState<Task[]>([]);
  const [stats,           setStats]           = useState<TaskStats | null>(null);
  const [isLoadingTasks,  setIsLoadingTasks]  = useState(true);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [view,            setView]            = useState<'list' | 'board'>('list');
  const [activeFilter,    setActiveFilter]    = useState('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [priorityFilter,  setPriorityFilter]  = useState('');
  const [sortBy,          setSortBy]          = useState('newest');

  // Read category from URL query param (from Projects page)
  const [categoryFilter, setCategoryFilter] = useState(() => {
    return '';
  });

  useEffect(() => {
    const cat = searchParams?.get('category') ?? '';
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);
  const [collapsed,       setCollapsed]       = useState<Record<string, boolean>>({});
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingTask,     setEditingTask]     = useState<Task | null>(null);
  const [deleteConfirm,   setDeleteConfirm]   = useState<Task | null>(null);
  const [formLoading,     setFormLoading]     = useState(false);
  const [toast,           setToast]           = useState('');
  const [selectedTask,    setSelectedTask]    = useState<Task | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoadingTasks(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all' && activeFilter !== 'overdue') params.status = activeFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const [tr, sr] = await Promise.all([tasksApi.getAll(params), tasksApi.getStats()]);
      setTasks(tr.data);
      setStats(sr.data);
    } catch {}
    finally { setIsLoadingTasks(false); }
  }, [user, activeFilter, priorityFilter, categoryFilter, searchQuery]);

  useEffect(() => { if (user) fetchTasks(); }, [fetchTasks, user]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const displayedTasks = useMemo(() => {
    let r = [...tasks];
    if (activeFilter === 'overdue') {
      r = r.filter(t => t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date());
    }
    r.sort((a, b) => {
      if (sortBy === 'oldest')   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return r;
  }, [tasks, activeFilter, sortBy]);

  const sections = useMemo(() => {
    if (activeFilter !== 'all') return null;
    const g: Record<string, Task[]> = { todo: [], in_progress: [], completed: [] };
    displayedTasks.forEach(t => { if (g[t.status]) g[t.status].push(t); });
    return g;
  }, [displayedTasks, activeFilter]);

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 2500);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleCreate = async (data: Partial<Task>) => {
    setFormLoading(true);
    try { await tasksApi.create(data); await fetchTasks(); setModalOpen(false); showToast('✅ Task created'); }
    finally { setFormLoading(false); }
  };
  const handleEdit = async (data: Partial<Task>) => {
    if (!editingTask) return;
    setFormLoading(true);
    try { await tasksApi.update(editingTask.id, data); await fetchTasks(); setEditingTask(null); showToast('✏️ Task updated'); }
    finally { setFormLoading(false); }
  };
  const handleToggle = async (task: Task) => {
    try { await tasksApi.update(task.id, { isCompleted: !task.isCompleted }); await fetchTasks(); }
    catch {}
  };
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try { await tasksApi.delete(deleteConfirm.id); await fetchTasks(); setDeleteConfirm(null); showToast('🗑️ Task deleted'); }
    catch {}
  };
  const toggleSection = (id: string) =>
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <div className="spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    );
  }
  if (!user) return null;

  const sectionColors: Record<string, { bg: string; text: string; dot: string }> = {
    todo:        { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' },
    in_progress: { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' },
    completed:   { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
  };

  return (
    /* ── App shell: sidebar + main in one flex row ── */
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>

      {/* ── Sidebar (always visible on desktop) ── */}
      <Sidebar
        stats={stats}
        activeFilter={activeFilter}
        onFilterChange={f => { setActiveFilter(f); setSelectedTask(null); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top header ── */}
        <Header
          onMenuOpen={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewTask={openCreate}
          title={FILTER_TITLES[activeFilter] ?? 'Tasks'}
          view={view}
          onViewChange={setView}
        />

        {/* ── Scrollable content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'var(--bg-main)' }}>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
            {([
              { label: 'Total Tasks',  value: stats?.total      ?? 0, color: 'var(--accent)',   bg: 'var(--accent-light)', icon: '📋' },
              { label: 'To Do',        value: stats?.todo       ?? 0, color: '#64748b',          bg: '#f8fafc',             icon: '○'  },
              { label: 'In Progress',  value: stats?.inProgress ?? 0, color: 'var(--info)',      bg: 'var(--info-bg)',      icon: '⚡' },
              { label: 'Completed',    value: stats?.completed  ?? 0, color: 'var(--success)',   bg: 'var(--success-bg)',   icon: '✓'  },
              { label: 'Overdue',      value: stats?.overdue    ?? 0, color: 'var(--danger)',    bg: 'var(--danger-bg)',    icon: '⚠'  },
            ] as const).map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: 'var(--shadow-sm)',
                flex: '1 1 120px',
                minWidth: 110,
                transition: 'box-shadow 0.15s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <Filter size={12} /> Filters:
            </span>
            <select
              className="input-field"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="input-field"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {/* Projects from localStorage */}
              {typeof window !== 'undefined' && (() => {
                try {
                  const projs = JSON.parse(localStorage.getItem('taskflow_projects') ?? '[]');
                  return projs.map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ));
                } catch { return null; }
              })()}
            </select>
            <select
              className="input-field"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
            {/* Active project badge */}
            {categoryFilter && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent-light)', borderRadius: 99, padding: '3px 10px' }}>
                <span style={{ fontSize: 12, color: 'var(--accent-text)', fontWeight: 600 }}>
                  📁 {categoryFilter}
                </span>
                <button
                  onClick={() => { setCategoryFilter(''); router.replace('/dashboard'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-text)', fontSize: 14, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </div>
            )}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              {displayedTasks.length} task{displayedTasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* ── Loading skeleton ── */}
          {isLoadingTasks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="anim-pulse" style={{
                  height: 46, borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                }} />
              ))}
            </div>
          )}

          {/* ── Board view ── */}
          {!isLoadingTasks && view === 'board' && (
            <KanbanBoard
              tasks={displayedTasks}
              onEdit={t => setEditingTask(t)}
              onDelete={t => setDeleteConfirm(t)}
              onToggleComplete={handleToggle}
              onNewTask={openCreate}
              onSelect={t => setSelectedTask(t)}
            />
          )}

          {/* ── List view ── */}
          {!isLoadingTasks && view === 'list' && (
            <>
              {displayedTasks.length === 0 ? (
                <EmptyState onNewTask={openCreate} filter={activeFilter} hasSearch={!!searchQuery} />
              ) : sections ? (
                /* All tasks — grouped by section */
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <table className="task-table">
                    <colgroup>
                      <col style={{ width: '38%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '17%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(sections).map(([status, sTasks]) => {
                        const sc = sectionColors[status];
                        const isCollapsed = collapsed[status];
                        return (
                          <React.Fragment key={status}>
                            {/* Section header */}
                            <tr className="section-header-row" onClick={() => toggleSection(status)}>
                              <td colSpan={5}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                                    {isCollapsed
                                      ? <ChevronRight size={12} />
                                      : <ChevronDown  size={12} />}
                                  </span>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                                  <span style={{ color: sc.text }}>{SECTION_LABELS[status]}</span>
                                  <span style={{
                                    background: sc.bg, color: sc.text,
                                    borderRadius: 99, padding: '0 6px',
                                    fontSize: 10, fontWeight: 700,
                                  }}>
                                    {sTasks.length}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Task rows */}
                            {!isCollapsed && sTasks.map(task => (
                              <TaskRow
                                key={task.id}
                                task={task}
                                onToggleComplete={handleToggle}
                                onEdit={t => setEditingTask(t)}
                                onDelete={t => setDeleteConfirm(t)}
                                onSelect={t => setSelectedTask(t)}
                              />
                            ))}
                            {/* Add task row */}
                            {!isCollapsed && (
                              <tr>
                                <td colSpan={5}>
                                  <button
                                    onClick={openCreate}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 5,
                                      fontSize: 12, color: 'var(--text-muted)',
                                      cursor: 'pointer', background: 'none', border: 'none',
                                      padding: '2px 0',
                                    }}
                                  >
                                    <Plus size={13} /> Add Task
                                  </button>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Single filter table */
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <table className="task-table">
                    <colgroup>
                      <col style={{ width: '38%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '17%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggle}
                          onEdit={t => setEditingTask(t)}
                          onDelete={t => setDeleteConfirm(t)}
                          onSelect={t => setSelectedTask(t)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Task Detail Panel ── */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(t) => { setSelectedTask(null); setEditingTask(t); }}
          onDelete={(t) => { setSelectedTask(null); setDeleteConfirm(t); }}
          onToggleComplete={async (t) => { await handleToggle(t); setSelectedTask(prev => prev?.id === t.id ? { ...t, isCompleted: !t.isCompleted } : prev); }}
        />
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen || !!editingTask}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          initialData={editingTask ?? undefined}
          onSubmit={editingTask ? handleEdit : handleCreate}
          onCancel={() => { setModalOpen(false); setEditingTask(null); }}
          isLoading={formLoading}
        />
      </Modal>

      {/* ── Delete confirm ── */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--text-primary)' }}>&quot;{deleteConfirm?.title}&quot;</strong>?
            {' '}This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger"    onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toast && (
        <div className="animate-fade-in" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          background: '#111827', color: 'white',
          padding: '10px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNewTask, filter, hasSearch }: { onNewTask: () => void; filter: string; hasSearch: boolean }) {
  if (hasSearch) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: 15 }}>No results found</p>
      <p style={{ fontSize: 13 }}>Try different keywords or clear the search.</p>
    </div>
  );

  const msgs: Record<string, { icon: string; title: string; sub: string }> = {
    all:         { icon: '📋', title: 'No tasks yet',         sub: 'Create your first task to get started.' },
    todo:        { icon: '✅', title: 'Nothing to do',         sub: "You're all caught up!"                  },
    in_progress: { icon: '⚡', title: 'Nothing in progress',  sub: 'Start working on a task.'               },
    completed:   { icon: '🎉', title: 'No completed tasks',   sub: 'Complete a task to see it here.'        },
    overdue:     { icon: '🎊', title: 'No overdue tasks',     sub: "Great — you're on schedule!"            },
  };
  const m = msgs[filter] ?? msgs.all;

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{m.icon}</div>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: 16 }}>{m.title}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{m.sub}</p>
      {filter === 'all' && (
        <button
          onClick={onNewTask}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> New Task
        </button>
      )}
    </div>
  );
}
