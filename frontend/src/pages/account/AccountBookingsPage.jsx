import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { Badge, Button, EmptyState, PageHeader, Pagination, Spinner } from '../../components/ui/primitives';
import { BOOKING_STATUS, formatCurrency, formatDate, packageImage, statusMeta } from '../../lib/format';

const tabs = [
  { value: '', label: 'Semua' },
  { value: 'pending_payment', label: 'Menunggu bayar' },
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const PAGE_SIZE = 8;

export default function AccountBookingsPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(`/me/bookings${buildQuery({ status, page, page_size: PAGE_SIZE })}`)
      .then((data) => {
        if (!alive) return;
        setItems(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [status, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Akun"
        title="Pesanan Saya"
        description="Pantau status pembayaran, voucher, dan detail perjalanan Anda."
        actions={<Button as="link" to="/packages" variant="outline">Pesan paket baru</Button>}
      />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setParam('status', tab.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              status === tab.value ? 'bg-hitam-0 text-white' : 'border border-hitam-0/10 bg-white text-hitam-0/60 hover:text-hitam-0'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState title="Gagal memuat pesanan" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Saatnya merencanakan perjalanan pertama Anda ke Lombok."
          action={<Button as="link" to="/packages">Jelajahi paket</Button>}
        />
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((booking) => {
            const meta = statusMeta(BOOKING_STATUS, booking.status);
            const dep = booking.departure;
            const pkg = dep?.package;
            return (
              <Link
                key={booking.id}
                to={`/account/bookings/${booking.booking_code}`}
                className="group flex flex-col gap-4 rounded-xl border border-hitam-0/10 bg-white p-4 shadow-sm transition hover:border-biru-0/40 hover:shadow-md sm:flex-row sm:items-center"
              >
                <img
                  src={pkg ? packageImage(pkg) : '/img/mnt4.jpg'}
                  alt={pkg?.title || 'Paket'}
                  className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-32"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span className="text-xs font-mono text-hitam-0/45">{booking.booking_code}</span>
                  </div>
                  <h3 className="mt-1.5 truncate font-tomorrow text-base font-bold text-hitam-0 group-hover:text-biru-0">
                    {pkg?.title || 'Paket Rinjani Travel'}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-hitam-0/55">
                    {dep && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(dep.start_date)}</span>}
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {booking.number_of_travelers} peserta</span>
                    {pkg?.departure_point && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pkg.departure_point}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-hitam-0/10 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-hitam-0/40">Total</p>
                    <p className="font-tomorrow text-base font-bold text-hitam-0">{formatCurrency(booking.total)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-biru-0">
                    Detail <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={(next) => setParam('page', String(next))} />
        </div>
      )}
    </div>
  );
}
