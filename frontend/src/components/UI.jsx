import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-black font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)]',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white font-bold shadow-[0_0_15px_rgba(157,80,187,0.4)]',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-black',
    ghost: 'hover:bg-white/10 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const GlassCard = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,210,255,0.1)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>}
      <input
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
          error && 'border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};
