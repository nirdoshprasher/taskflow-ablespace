'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  requestBody?: string;
  response: string;
  open: boolean;
}

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: '#dcfce7', text: '#16a34a' },
  POST:   { bg: '#dbeafe', text: '#2563eb' },
  PUT:    { bg: '#fef3c7', text: '#d97706' },
  DELETE: { bg: '#fee2e2', text: '#dc2626' },
};

const DEFAULT_DOCS: DocSection[] = [
  {
    id: '1', open: true,
    title: 'Get All Tasks',
    method: 'GET', endpoint: '/api/tasks',
    description: 'Returns all tasks for the authenticated user. Supports filtering by status, priority, category and search.',
    response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2024-12-31",
      "category": "Work",
      "isCompleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`,
  },
  {
    id: '2', open: false,
    title: 'Create Task',
    method: 'POST', endpoint: '/api/tasks',
    description: 'Creates a new task for the authenticated user.',
    requestBody: `{
  "title": "Task title",       // required
  "description": "...",        // optional
  "status": "todo",            // todo | in_progress | completed
  "priority": "medium",        // low | medium | high
  "dueDate": "2024-12-31",    // optional
  "category": "Work"           // optional
}`,
    response: `{
  "id": "uuid",
  "title": "Task title",
  "status": "todo",
  "priority": "medium",
  "isCompleted": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}`,
  },
  {
    id: '3', open: false,
    title: 'Update Task',
    method: 'PUT', endpoint: '/api/tasks/:id',
    description: 'Updates an existing task. All fields are optional.',
    requestBody: `{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "high",
  "isCompleted": true
}`,
    response: `{
  "id": "uuid",
  "title": "Updated title",
  "status": "in_progress",
  "isCompleted": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}`,
  },
  {
    id: '4', open: false,
    title: 'Delete Task',
    method: 'DELETE', endpoint: '/api/tasks/:id',
    description: 'Permanently deletes a task. Returns 204 No Content.',
    response: `// 204 No Content`,
  },
  {
    id: '5', open: false,
    title: 'Get Task Stats',
    method: 'GET', endpoint: '/api/tasks/stats',
    description: 'Returns task statistics for the authenticated user.',
    response: `{
  "total": 10,
  "completed": 4,
  "inProgress": 3,
  "todo": 3,
  "overdue": 1
}`,
  },
  {
    id: '6', open: false,
    title: 'Guest Login',
    method: 'POST', endpoint: '/api/auth/guest',
    description: 'Creates a temporary guest account and returns a JWT token.',
    response: `{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Guest User",
    "email": "guest_xxxx@guest.local",
    "isGuest": true
  }
}`,
  },
];

export default function DocsClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<DocSection[]>(DEFAULT_DOCS);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!user) return null;

  const toggleSection = (id: string) =>
    setDocs(prev => prev.map(d => d.id === id ? { ...d, open: !d.open } : d));

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
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
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}><polyline points="9 18 15 12 9 6" /></svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>API Documentation</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 99, border: '1px solid var(--border)' }}>
          Base URL: <strong style={{ color: 'var(--text-primary)' }}>http://localhost:3001</strong>
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>TaskFlow API Docs</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            All API endpoints require a <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>Bearer token</code> in the Authorization header, except for auth endpoints.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(METHOD_COLORS).map(([m, c]) => (
              <span key={m} style={{ background: c.bg, color: c.text, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{m}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => {
            const mc = METHOD_COLORS[doc.method];
            return (
              <div key={doc.id} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${doc.open ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 12, overflow: 'hidden',
                boxShadow: doc.open ? '0 0 0 3px rgba(108,99,255,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}>
                <button
                  onClick={() => toggleSection(doc.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <span style={{ background: mc.bg, color: mc.text, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0, letterSpacing: '0.04em' }}>{doc.method}</span>
                  <code style={{ fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 10px', borderRadius: 6, flexShrink: 0 }}>{doc.endpoint}</code>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{doc.title}</span>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {doc.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>

                {doc.open && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 14, marginBottom: 14, lineHeight: 1.6 }}>{doc.description}</p>
                    {doc.requestBody && (
                      <CodeBlock label="Request Body" code={doc.requestBody} id={`req-${doc.id}`} copied={copied === `req-${doc.id}`} onCopy={() => copyToClipboard(doc.requestBody!, `req-${doc.id}`)} />
                    )}
                    <CodeBlock label="Response" code={doc.response} id={`res-${doc.id}`} copied={copied === `res-${doc.id}`} onCopy={() => copyToClipboard(doc.response, `res-${doc.id}`)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ label, code, id, copied, onCopy }: {
  label: string; code: string; id: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <button onClick={onCopy} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', border: 'none', padding: '3px 10px', borderRadius: 6, fontSize: 11, color: copied ? '#16a34a' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
          {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <pre style={{ background: '#1e1e2e', color: '#e2e8f0', borderRadius: 8, padding: '14px 16px', fontSize: 12, lineHeight: 1.7, overflow: 'auto', margin: 0, fontFamily: "'Fira Code', 'Courier New', monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {code}
      </pre>
    </div>
  );
}
