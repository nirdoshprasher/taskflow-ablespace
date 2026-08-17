import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'priority-high' | 'priority-medium' | 'priority-low' | 'status-todo' | 'status-in_progress' | 'status-completed' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClass = variant !== 'default' ? variant : 'bg-gray-100 text-gray-600';

  return (
    <span className={`${base} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
