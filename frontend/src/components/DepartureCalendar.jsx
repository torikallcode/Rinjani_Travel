import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateLong } from '../lib/format';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const STATUS_LABEL = { open: 'Tersedia', full: 'Penuh', closed: 'Ditutup' };

function parseDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DepartureCalendar({ departures = [], selectedId, onSelect }) {
  const byDate = useMemo(() => {
    const map = new Map();
    departures.forEach((dep) => map.set(String(dep.start_date).slice(0, 10), dep));
    return map;
  }, [departures]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [cursor, setCursor] = useState(() => {
    const anchor = departures.find((dep) => dep.status === 'open' && dep.seats_left > 0)
      || departures[0];
    const date = anchor ? parseDate(anchor.start_date) : today;
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Reset to the first bookable month when the package changes.
  useEffect(() => {
    const anchor = departures.find((dep) => dep.status === 'open' && dep.seats_left > 0)
      || departures[0];
    const date = anchor ? parseDate(anchor.start_date) : today;
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [departures, today]);

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDeparture = departures.length ? parseDate(departures[departures.length - 1].start_date) : today;
  const maxMonth = new Date(lastDeparture.getFullYear(), lastDeparture.getMonth(), 1);
  const canPrev = cursor > minMonth;
  const canNext = cursor < maxMonth;

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const result = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= total; day += 1) result.push(new Date(year, month, day));
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [cursor]);

  if (!departures.length) {
    return (
      <p className="rounded-lg border border-dashed border-hitam-0/15 px-4 py-8 text-center text-sm text-hitam-0/50">
        Belum ada jadwal keberangkatan untuk paket ini.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          disabled={!canPrev}
          aria-label="Bulan sebelumnya"
          className="rounded-lg p-1.5 text-hitam-0/60 transition hover:bg-hitam-0/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-hitam-0">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => canNext && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          disabled={!canNext}
          aria-label="Bulan berikutnya"
          className="rounded-lg p-1.5 text-hitam-0/60 transition hover:bg-hitam-0/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-[10px] font-bold uppercase tracking-wide text-hitam-0/40">
            {day}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;
          const key = dateKey(date);
          const dep = byDate.get(key);
          const isPast = date < today;

          if (!dep) {
            return (
              <span
                key={key}
                className={`flex min-h-[52px] items-start justify-end rounded-lg p-1.5 text-xs ${isPast ? 'text-hitam-0/20' : 'text-hitam-0/35'}`}
              >
                {date.getDate()}
              </span>
            );
          }

          const selectable = dep.status === 'open' && dep.seats_left > 0;
          const selected = String(dep.id) === String(selectedId);
          const tone = selectable
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            : dep.status === 'full'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-hitam-0/10 bg-hitam-0/5 text-hitam-0/35';

          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelect?.(dep.id)}
              aria-label={`${formatDateLong(dep.start_date)} — ${STATUS_LABEL[dep.status] || dep.status}`}
              aria-pressed={selected}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border p-1 text-xs transition disabled:cursor-not-allowed ${tone} ${
                selected ? 'ring-2 ring-biru-0 ring-offset-1' : ''
              }`}
            >
              <span className="text-sm font-bold leading-none">{date.getDate()}</span>
              <span className="text-[9px] font-semibold leading-tight">
                {selectable ? `${dep.seats_left} kursi` : STATUS_LABEL[dep.status] || dep.status}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-hitam-0/55">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-100" /> Tersedia</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-amber-300 bg-amber-100" /> Penuh</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-hitam-0/15 bg-hitam-0/10" /> Ditutup</span>
      </div>
    </div>
  );
}
