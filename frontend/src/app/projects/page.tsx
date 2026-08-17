'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getProjects, addProject, deleteProject, Project } from '@/lib/projects-store';
import { tasksApi } from '@/lib/api';

const PROJECT_COLORS = [
  '#6c63ff','#f59e0b','#10b981','#3b82f6',
  '#ef4444','#8b5cf6','#ec4899','#14b8a6',
];

export default function ProjectsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [projects,  setProjects]  = useState<Project[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [showForm,  setShowForm]  = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newColor,  setNewColor]  = useState(PROJECT_COLORS[0]);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setProjects(getProjects());
      // Load task counts per project
      tasksApi.getAll().then(res => {
        const counts: Record<string, number> = {};
        res.data.forEach((t: any) => {
          if (t.category) {
            counts[t.category] = (counts[t.category] ?? 0) + 1;
          }
        });
        setTaskCounts(counts);
      }).catch(() => {});
    }
  }, [user]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!user) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const p = addProject(newName, newColor);
    setProjects(getProjects());
    setNewName('');
    setNewColor(PROJECT_COLORS[0]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setDeleting(id);
    setTimeout(() => {
      deleteProject(id);
      setProjects(getProjects());
      setDeleting(null);
    }, 300);
  };

  const handleOpenProject = (projectName: string) => {
    // Navigate to dashboard filtered by this project (category)
    router.push(`/dashboard?category=${encodeURIComponent(projectName)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Projects</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 8, padding: '7px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', maxWidth: 900, width: '100%', margin: '0 auto' }}>

        {/* New project form */}
        {showForm && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            borderRadius: 12, padding: '20px',
            marginBottom: 20,
            boxShadow: '0 0 0 3px rgba(108,99,255,0.08)',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              New Project
            </h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>
                  Project Name
                </label>
                <input
                  className="input-field"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Design Homepage"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setNewColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: c,
                        border: newColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer', padding: 0, outline: 'none',
                        transition: 'border 0.15s',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)', color: 'white', border: 'none',
                    borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewName(''); }}
                  style={{
                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No projects yet</p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>Create a project and assign tasks to it.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + New Project
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>

            {/* Projects table */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Project', 'Tasks', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 16px',
                        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: i < projects.length - 1 ? '1px solid var(--border-light)' : 'none',
                        opacity: deleting === p.id ? 0.4 : 1,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '13px 16px' }}>
                        <button
                          onClick={() => handleOpenProject(p.name)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, fontFamily: 'inherit',
                          }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.name}
                          </span>
                        </button>
                      </td>

                      {/* Task count */}
                      <td style={{ padding: '13px 16px' }}>
                        <button
                          onClick={() => handleOpenProject(p.name)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, fontFamily: 'inherit',
                          }}
                        >
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            background: taskCounts[p.name] > 0 ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                            color: taskCounts[p.name] > 0 ? 'var(--accent-text)' : 'var(--text-muted)',
                            padding: '3px 12px', borderRadius: 99,
                          }}>
                            {taskCounts[p.name] ?? 0} task{(taskCounts[p.name] ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </button>
                      </td>

                      {/* Created */}
                      <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {p.createdAt}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleOpenProject(p.name)}
                            style={{
                              background: 'var(--accent-light)', color: 'var(--accent-text)',
                              border: 'none', borderRadius: 6,
                              padding: '5px 12px', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            View Tasks
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            style={{
                              background: '#fee2e2', color: '#dc2626',
                              border: 'none', borderRadius: 6,
                              padding: '5px 10px', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
