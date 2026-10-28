import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  TrendingUp,
  Users,
  AlertTriangle,
  Star,
  MessageSquare,
} from 'lucide-react';
import api from '../../services/api';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from '../../components/ui/primitives';
import { BookingStatusBadge, DateCell, Money, StatCard } from './AdminShared';
import { formatDate, formatNumber } from '../../lib/format';

const taskIcons = { payment: CreditCard, review: Star, contact: MessageSquare };

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/admin/dashboard')
      .then((result) => alive && setData(result))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Spinner label="Memuat dashboard..." />;
  if (error) return <EmptyState title="Gagal memuat dashboard" description={error} />;

  const series = data?.revenue_series || [];
  const maxRevenue = Math.max(...series.map((point) => Number(point.total || 0)), 1);
  const occupancyRows = data?.occupancy || [];
  const avgOccupancy = occupancyRows.length
    ? Math.round(occupancyRows.reduce((sum, row) => sum + (row.capacity ? row.reserved_count / row.capacity : 0), 0) / occupancyRows.length * 100)
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard Operasional"
        description="Pantau pesanan, pembayaran, dan keberangkatan terdekat dalam satu layar."
        actions={
          <>
            <Button as="link" to="/admin/bookings" variant="outline">Lihat pesanan</Button>
            <Button as="link" to="/admin/packages">Kelola paket</Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pesanan hari ini" value={formatNumber(data.today_bookings)} hint="Dibuat sejak 00:00" icon={CalendarCheck} />
        <StatCard label="Pendapatan hari ini" value={<Money value={data.today_revenue} />} hint="Status dibayar/terkonfirmasi" icon={TrendingUp} tone="success" />
        <StatCard label="Pembayaran menunggu" value={formatNumber(data.pending_payments)} hint="Perlu dipantau" icon={CreditCard} tone="warning" />
        <StatCard label="Keberangkatan 7 hari" value={formatNumber(data.upcoming_departures)} hint="Jadwal berstatus buka" icon={CalendarDays} tone="neutral" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pendapatan bulan ini" value={<Money value={data.month_revenue} />} icon={TrendingUp} tone="success" />
        <StatCard label="Pesanan bulan ini" value={formatNumber(data.month_bookings)} icon={CalendarCheck} />
        <StatCard label="Okupansi 7 hari" value={`${avgOccupancy}%`} hint="Rata-rata kursi terisi" icon={Users} tone="neutral" />
        <StatCard label="Tugas menunggu" value={formatNumber((data.tasks || []).length)} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Pendapatan 14 hari</h2>
              <p className="mt-1 text-xs text-hitam-0/50">Berdasarkan tanggal booking dibuat.</p>
            </div>
            <Badge tone="brand">{formatDate(new Date())}</Badge>
          </div>
          {series.length === 0 ? (
            <p className="mt-8 rounded-lg bg-[#f7f8f9] px-4 py-10 text-center text-sm text-hitam-0/45">Belum ada pendapatan tercatat.</p>
          ) : (
            <div className="mt-6 flex h-48 items-end gap-2">
              {series.map((point) => (
                <div key={point.date} className="group flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[10px] font-semibold text-hitam-0/0 transition group-hover:text-hitam-0/60">
                    {formatNumber(point.total)}
                  </span>
                  <div
                    className="w-full rounded-t bg-biru-0/80 transition hover:bg-biru-0"
                    style={{ height: `${Math.max(4, (Number(point.total || 0) / maxRevenue) * 100)}%` }}
                    title={`${point.date}: ${formatNumber(point.total)}`}
                  />
                  <span className="text-[9px] text-hitam-0/40">{String(point.date).slice(8, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Perlu tindakan</h2>
          <p className="mt-1 text-xs text-hitam-0/50">Tugas operasional yang belum selesai.</p>
          <div className="mt-4 space-y-2">
            {(data.tasks || []).length === 0 && (
              <p className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">Tidak ada tugas mendesak. 🎉</p>
            )}
            {(data.tasks || []).map((task) => {
              const Icon = taskIcons[task.type] || AlertTriangle;
              return (
                <Link
                  key={task.type}
                  to={task.link || '/admin'}
                  className="flex items-center gap-3 rounded-lg border border-hitam-0/10 p-3 transition hover:border-biru-0/40 hover:bg-biru-0/5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hitam-0">{task.label}</p>
                    <p className="text-xs text-hitam-0/50">{task.count} item</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-hitam-0/30" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-hitam-0/10 px-5 py-4">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Pesanan terbaru</h2>
            <Link to="/admin/bookings" className="text-xs font-semibold text-biru-0 hover:underline">Semua pesanan →</Link>
          </div>
          <div className="divide-y divide-hitam-0/5">
            {(data.recent_bookings || []).length === 0 && <p className="px-5 py-8 text-center text-sm text-hitam-0/45">Belum ada pesanan.</p>}
            {(data.recent_bookings || []).map((booking) => (
              <Link key={booking.id} to={`/admin/bookings/${booking.booking_code}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-biru-0/[0.03]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-hitam-0/50">{booking.booking_code}</span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-hitam-0">
                    {booking.departure?.package?.title || 'Paket'}
                  </p>
                  <p className="text-xs text-hitam-0/50">
                    {booking.organizer_name} · {formatDate(booking.created_at)}
                  </p>
                </div>
                <Money value={booking.total} />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-hitam-0/10 px-5 py-4">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Okupansi terdekat</h2>
            <Link to="/admin/departures" className="text-xs font-semibold text-biru-0 hover:underline">Jadwal →</Link>
          </div>
          <div className="divide-y divide-hitam-0/5">
            {(data.occupancy || []).length === 0 && <p className="px-5 py-8 text-center text-sm text-hitam-0/45">Belum ada jadwal.</p>}
            {(data.occupancy || []).map((row) => {
              const percent = row.capacity ? Math.round((row.reserved_count / row.capacity) * 100) : 0;
              return (
                <div key={row.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-hitam-0">{row.package_title}</p>
                    <span className="whitespace-nowrap text-xs text-hitam-0/50"><DateCell value={row.start_date} /></span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hitam-0/10">
                      <div className={`h-full rounded-full ${percent >= 90 ? 'bg-red-500' : percent >= 60 ? 'bg-amber-500' : 'bg-biru-0'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-hitam-0/50">{row.reserved_count}/{row.capacity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-hitam-0/10 px-5 py-4">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Keberangkatan mendatang</h2>
            <Link to="/admin/departures" className="text-xs font-semibold text-biru-0 hover:underline">Kelola jadwal →</Link>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {(data.upcoming || []).length === 0 && <p className="col-span-full py-6 text-center text-sm text-hitam-0/45">Belum ada keberangkatan.</p>}
            {(data.upcoming || []).map((dep) => (
              <div key={dep.id} className="rounded-lg border border-hitam-0/10 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-biru-0">{formatDate(dep.start_date)}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-hitam-0">{dep.package?.title}</p>
                <p className="mt-1 text-xs text-hitam-0/50">{dep.capacity - dep.reserved_count} kursi tersisa</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
