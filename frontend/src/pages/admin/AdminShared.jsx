import { Badge, Spinner } from '../../components/ui/primitives';
import { BOOKING_STATUS, PAYMENT_STATUS, formatCurrency, formatDate, formatDateTime, statusMeta } from '../../lib/format';

export function StatCard({ label, value, hint, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-biru-0/10 text-biru-0',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-hitam-0/8 text-hitam-0',
  };
  return (
    <div className="rounded-xl border border-hitam-0/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-hitam-0/45">{label}</p>
          <p className="mt-2 font-tomorrow text-2xl font-bold text-hitam-0">{value}</p>
          {hint && <p className="mt-1 text-xs text-hitam-0/50">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.brand}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}

export function BookingStatusBadge({ status }) {
  const meta = statusMeta(BOOKING_STATUS, status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PaymentStatusBadge({ status }) {
  const meta = statusMeta(PAYMENT_STATUS, status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function DataTable({ columns, rows, rowKey = (row) => row.id, loading, empty = 'Belum ada data.', footer }) {
  if (loading) return <Spinner />;
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-dashed border-hitam-0/15 bg-white px-6 py-14 text-center text-sm text-hitam-0/50">
        {empty}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-hitam-0/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-hitam-0/10 text-sm">
          <thead className="bg-[#f7f8f9]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-hitam-0/50 ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hitam-0/5">
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="transition hover:bg-biru-0/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 align-middle ${column.cellClassName || ''}`}>
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}

export function TableFooter({ page, total, pageSize, onChange, label = 'data' }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 20)));
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col gap-2 border-t border-hitam-0/10 px-4 py-3 text-xs text-hitam-0/55 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Menampilkan halaman {page} dari {totalPages} · {total} {label}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-hitam-0/15 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-hitam-0/15 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export function Money({ value }) {
  return <span className="whitespace-nowrap font-semibold text-hitam-0">{formatCurrency(value)}</span>;
}

export function DateCell({ value }) {
  return <span className="whitespace-nowrap text-hitam-0/70">{formatDate(value)}</span>;
}

export function DateTimeCell({ value }) {
  return <span className="whitespace-nowrap text-hitam-0/60">{formatDateTime(value)}</span>;
}

export function FieldRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hitam-0/5 py-2 text-sm last:border-0">
      <span className="text-hitam-0/50">{label}</span>
      <span className="text-right font-medium text-hitam-0">{children || '-'}</span>
    </div>
  );
}
