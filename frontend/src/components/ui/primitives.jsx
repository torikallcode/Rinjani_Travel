import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const toneClasses = {
  primary: 'bg-biru-0 text-white hover:bg-[#009aa1] focus:ring-biru-0/40',
  dark: 'bg-hitam-0 text-white hover:bg-abu-0 focus:ring-hitam-0/30',
  outline: 'border border-hitam-0/20 text-hitam-0 hover:border-biru-0 hover:text-biru-0 bg-white',
  ghost: 'text-hitam-0 hover:bg-hitam-0/5',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30',
  light: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[variant]} ${sizeClasses[size]} ${className}`;
  if (as === 'link' && to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-hitam-0/15 bg-white px-3.5 py-2.5 text-sm text-hitam-0 outline-none transition placeholder:text-hitam-0/35 focus:border-biru-0 focus:ring-2 focus:ring-biru-0/20 disabled:bg-hitam-0/5 ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className = '', rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full rounded-lg border border-hitam-0/15 bg-white px-3.5 py-2.5 text-sm text-hitam-0 outline-none transition placeholder:text-hitam-0/35 focus:border-biru-0 focus:ring-2 focus:ring-biru-0/20 ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border border-hitam-0/15 bg-white px-3.5 py-2.5 text-sm text-hitam-0 outline-none transition focus:border-biru-0 focus:ring-2 focus:ring-biru-0/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({ label, hint, error, required, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-hitam-0/70">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-hitam-0/50">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const badgeTones = {
  neutral: 'bg-hitam-0/8 text-hitam-0',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  brand: 'bg-biru-0/15 text-[#007d83]',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone] || badgeTones.neutral} ${className}`}>
      {children}
    </span>
  );
}

export function Alert({ tone = 'info', title, children, className = '' }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}

export function Spinner({ label = 'Memuat data...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-hitam-0/60">
      <Loader2 className="h-5 w-5 animate-spin text-biru-0" />
      {label}
    </div>
  );
}

export function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hitam-0/15 bg-white px-6 py-16 text-center">
      <p className="text-base font-semibold text-hitam-0">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-hitam-0/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-hitam-0/10 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">{eyebrow}</p>}
        <h1 className="mt-1 font-tomorrow text-2xl font-bold text-hitam-0 md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-hitam-0/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 12)));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm text-hitam-0/60">
      <span>
        Halaman {page} dari {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-hitam-0/60 p-4">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-hitam-0/10 px-5 py-4">
          <h3 className="font-tomorrow text-lg font-bold text-hitam-0">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-hitam-0/50 hover:bg-hitam-0/5" aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-hitam-0/10 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Stars({ rating = 0, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-amber-400 ${className}`} aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 20 20" className="h-4 w-4" fill={star <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8L10 1.8z" />
        </svg>
      ))}
    </span>
  );
}
