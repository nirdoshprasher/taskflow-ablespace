import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', isLoading = false, children, className = '', disabled, style, ...props }: ButtonProps) {

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    fontWeight: 700, fontFamily: 'inherit', borderRadius: 9,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    border: 'none',
    transition: 'all 0.15s',
    fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13.5,
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 24px' : '9px 18px',
    lineHeight: 1,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--accent)', color: 'white', boxShadow: 'var(--shadow-accent)' },
    secondary: { background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' },
    danger:    { background: 'var(--danger)', color: 'white' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)' },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading && (
        <span
          className="spinner"
          style={{
            width: 13, height: 13,
            borderColor: variant === 'primary' || variant === 'danger' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
            borderTopColor: variant === 'primary' || variant === 'danger' ? 'white' : 'var(--text-primary)',
          }}
        />
      )}
      {children}
    </button>
  );
}
