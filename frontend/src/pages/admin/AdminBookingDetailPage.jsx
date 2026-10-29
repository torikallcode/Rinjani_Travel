import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  RefreshCw,
  Save,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, Field, Input, Select, Spinner, Textarea } from '../../components/ui/primitives';
import { BookingStatusBadge, DateTimeCell, FieldRow, Money, PaymentStatusBadge } from './AdminShared';
import { BOOKING_STATUS, formatCurrency, formatDate, formatDateTime, packageImage, statusMeta } from '../../lib/format';

const transitions = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'payment_expired', 'cancelled'],
  paid: ['confirmed', 'refunded', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'refunded'],
  completed: ['refunded'],
  payment_expired: ['cancelled'],
  cancelled: ['refunded'],
  on_hold: ['pending_payment', 'cancelled'],
};

const notificationTypes = [
  { value: 'booking_created', label: 'Invoice / booking dibuat' },
  { value: 'payment_paid', label: 'Bukti pembayaran' },
  { value: 'booking_completed', label: 'Pesanan selesai' },
  { value: 'status_update', label: 'Pembaruan status' },
];

export default function AdminBookingDetailPage() {
  const { code } = useParams();
  const { user } = useAuth();
  const canManage = ['admin_ops', 'super_admin'].includes(user?.role);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [statusForm, setStatusForm] = useState({ status: '', reason: '' });
  const [savingStatus, setSavingStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [manual, setManual] = useState({ amount: '', method: 'manual', note: '' });
  const [savingManual, setSavingManual] = useState(false);
  const [resendType, setResendType] = useState('booking_created');
  const [resending, setResending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/bookings/${code}`);
      setBooking(data);
      setNotes(data.internal_notes || '');
      setManual((current) => ({ ...current, amount: String(data.total || '') }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  const nextStatuses = useMemo(() => transitions[booking?.status] || [], [booking?.status]);
  const pkg = booking?.departure?.package;

  const runAction = async (action, successMessage) => {
    setActionError('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const updateStatus = async (event) => {
    event.preventDefault();
    if (!statusForm.status) return;
    setSavingStatus(true);
    await runAction(
      () => api.patch(`/admin/bookings/${code}/status`, statusForm),
      'Status pesanan diperbarui.',
    );
    setSavingStatus(false);
    setStatusForm({ status: '', reason: '' });
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await runAction(() => api.patch(`/admin/bookings/${code}/notes`, { internal_notes: notes }), 'Catatan internal disimpan.');
    setSavingNotes(false);
  };

  const addManualPayment = async (event) => {
    event.preventDefault();
    setSavingManual(true);
    await runAction(
      () => api.post(`/admin/bookings/${code}/payments`, { amount: Number(manual.amount), method: 'manual', note: manual.note }),
      'Pembayaran manual dicatat dan pesanan dikonfirmasi.',
    );
    setSavingManual(false);
    setManual((current) => ({ ...current, note: '' }));
  };

  const resend = async () => {
    setResending(true);
    await runAction(() => api.post(`/admin/bookings/${code}/resend?type=${resendType}`, {}), 'Notifikasi dikirim ulang.');
    setResending(false);
  };

  if (loading) return <Spinner label="Memuat detail pesanan..." />;
  if (error || !booking) {
    return (
      <div>
        <Alert tone="danger" title="Pesanan tidak ditemukan">{error || 'Data pesanan tidak tersedia.'}</Alert>
        <Button as="link" to="/admin/bookings" variant="outline" className="mt-4">Kembali ke daftar</Button>
      </div>
    );
  }

  const meta = statusMeta(BOOKING_STATUS, booking.status);

  return (
    <div>
      <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-biru-0">
        <ArrowLeft className="h-4 w-4" /> Semua pesanan
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="font-mono text-xs text-ink/50">{booking.booking_code}</span>
          </div>
          <h1 className="mt-2 font-tomorrow text-2xl font-bold text-ink">{pkg?.title || 'Detail Pesanan'}</h1>
          <p className="mt-1 text-xs text-ink/50">Dibuat {formatDateTime(booking.created_at)} · {booking.number_of_travelers} peserta</p>
        </div>
        <Money value={booking.total} />
      </div>

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {actionError && <Alert tone="danger" className="mt-4">{actionError}</Alert>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <img src={packageImage(pkg || {})} alt={pkg?.title || 'Paket'} className="h-36 w-full rounded-lg object-cover sm:h-28 sm:w-40" />
              <div className="grid flex-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-1.5 text-ink/70"><CalendarDays className="h-4 w-4 text-biru-0" /> {booking.departure ? `${formatDate(booking.departure.start_date)} – ${formatDate(booking.departure.end_date)}` : '-'}</p>
                <p className="flex items-center gap-1.5 text-ink/70"><Users className="h-4 w-4 text-biru-0" /> {booking.number_of_travelers} peserta</p>
                <p className="flex items-center gap-1.5 text-ink/70"><MapPin className="h-4 w-4 text-biru-0" /> {pkg?.departure_point || '-'}</p>
                <p className="flex items-center gap-1.5 text-ink/70"><Mail className="h-4 w-4 text-biru-0" /> {booking.organizer_email || '-'}</p>
                {booking.expires_at && <p className="text-xs text-amber-700 sm:col-span-2">Batas pembayaran: {formatDateTime(booking.expires_at)}</p>}
                {booking.cancellation_reason && <p className="text-xs text-red-600 sm:col-span-2">Alasan pembatalan: {booking.cancellation_reason}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Rincian biaya</h2>
            <div className="mt-3 space-y-2 text-sm">
              {(booking.items || []).map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-ink/65">
                  <span>{item.name_snapshot} × {item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              <div className="flex justify-between text-ink/65"><span>Subtotal</span><span>{formatCurrency(booking.subtotal)}</span></div>
              {booking.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon {booking.coupon_code && `(${booking.coupon_code})`}</span><span>−{formatCurrency(booking.discount)}</span></div>}
              {booking.tax > 0 && <div className="flex justify-between text-ink/65"><span>Pajak</span><span>{formatCurrency(booking.tax)}</span></div>}
              <div className="flex justify-between border-t border-ink/10 pt-3 font-tomorrow text-lg font-bold text-ink"><span>Total</span><span>{formatCurrency(booking.total)}</span></div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Data peserta</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-wide text-ink/45">
                    <th className="py-2 pr-4">Nama</th>
                    <th className="py-2 pr-4">Identitas</th>
                    <th className="py-2 pr-4">Kontak darurat</th>
                    <th className="py-2">Catatan kesehatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {(booking.travelers || []).map((traveler) => (
                    <tr key={traveler.id}>
                      <td className="py-2.5 pr-4">
                        <p className="font-semibold text-ink">{traveler.name} {traveler.is_organizer && <span className="ml-1 text-[10px] uppercase text-biru-0">Pemesan</span>}</p>
                        <p className="text-[11px] text-ink/45">{[traveler.nationality, traveler.gender, traveler.birth_date].filter(Boolean).join(' · ')}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-ink/60">{traveler.id_number || '-'}</td>
                      <td className="py-2.5 pr-4 text-xs text-ink/60">{traveler.emergency_contact_name ? `${traveler.emergency_contact_name} · ${traveler.emergency_contact_phone}` : '-'}</td>
                      <td className="py-2.5 text-xs text-ink/60">{traveler.health_note || '-'}{traveler.health_consent && <span className="ml-1 text-emerald-600">(consent)</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Riwayat status</h2>
            <ol className="mt-4 space-y-4 border-l border-ink/10 pl-5">
              {(booking.status_history || []).map((item) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-biru-0" />
                  <p className="text-sm font-semibold text-ink">{statusMeta(BOOKING_STATUS, item.to_status).label}</p>
                  <p className="text-xs text-ink/50">{formatDateTime(item.created_at)} · {item.changed_by_name || 'Sistem'}</p>
                  {item.reason && <p className="mt-1 text-xs text-ink/55">{item.reason}</p>}
                </li>
              ))}
              {!booking.status_history?.length && <p className="text-sm text-ink/45">Belum ada riwayat.</p>}
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Pembayaran</h2>
            <div className="mt-3 space-y-2">
              {(booking.payments || []).map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink/10 p-3 text-xs">
                  <div>
                    <PaymentStatusBadge status={payment.status} />
                    <p className="mt-1 font-mono text-ink/60">{payment.provider_reference}</p>
                    <p className="text-ink/45">{payment.method || payment.provider} · {formatDateTime(payment.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <Money value={payment.amount} />
                    {payment.paid_at && <p className="text-emerald-600">Dibayar {formatDateTime(payment.paid_at)}</p>}
                  </div>
                </div>
              ))}
              {!booking.payments?.length && <p className="text-sm text-ink/45">Belum ada pembayaran.</p>}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Pemesan</h2>
            <div className="mt-2">
              <FieldRow label="Nama">{booking.organizer_name}</FieldRow>
              <FieldRow label="WhatsApp">{booking.organizer_phone}</FieldRow>
              <FieldRow label="Email">{booking.organizer_email}</FieldRow>
              <FieldRow label="Akun">{booking.user ? <Link to={`/admin/customers?q=${encodeURIComponent(booking.user.email)}`} className="text-biru-0 hover:underline">{booking.user.email}</Link> : '-'}</FieldRow>
              <FieldRow label="Catatan pelanggan">{booking.notes}</FieldRow>
            </div>
          </Card>

          {canManage && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-ink">Ubah status</h2>
              <p className="mt-1 text-xs text-ink/50">Hanya transisi yang valid yang ditampilkan.</p>
              {nextStatuses.length === 0 ? (
                <p className="mt-3 rounded-lg bg-panel px-3 py-4 text-xs text-ink/45">Tidak ada transisi tersedia untuk status ini.</p>
              ) : (
                <form onSubmit={updateStatus} className="mt-3 space-y-3">
                  <Field label="Status berikutnya" required>
                    <Select value={statusForm.status} onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value })} required>
                      <option value="">Pilih status</option>
                      {nextStatuses.map((status) => <option key={status} value={status}>{statusMeta(BOOKING_STATUS, status).label}</option>)}
                    </Select>
                  </Field>
                  <Field label="Alasan / catatan">
                    <Textarea rows={2} value={statusForm.reason} onChange={(event) => setStatusForm({ ...statusForm, reason: event.target.value })} placeholder="Wajib untuk pembatalan/refund." />
                  </Field>
                  <Button type="submit" className="w-full" loading={savingStatus}>Simpan status</Button>
                </form>
              )}
            </Card>
          )}

          {canManage && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-ink">Catatan internal</h2>
              <Textarea className="mt-3" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Hanya terlihat oleh staf." />
              <Button variant="outline" className="mt-2 w-full" onClick={saveNotes} loading={savingNotes}>
                <Save className="h-4 w-4" /> Simpan catatan
              </Button>
            </Card>
          )}

          {canManage && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-ink">Pembayaran manual</h2>
              <p className="mt-1 text-xs text-ink/50">Nominal harus sama dengan total invoice.</p>
              <form onSubmit={addManualPayment} className="mt-3 space-y-3">
                <Field label="Nominal (IDR)" required>
                  <Input type="number" min="1" value={manual.amount} onChange={(event) => setManual({ ...manual, amount: event.target.value })} required />
                </Field>
                <Field label="Catatan rekonsiliasi">
                  <Input value={manual.note} onChange={(event) => setManual({ ...manual, note: event.target.value })} placeholder="Transfer bank, no. referensi..." />
                </Field>
                <Button type="submit" variant="dark" className="w-full" loading={savingManual}>
                  <Wallet className="h-4 w-4" /> Catat pembayaran
                </Button>
              </form>
            </Card>
          )}

          {canManage && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-ink">Kirim ulang notifikasi</h2>
              <div className="mt-3 space-y-3">
                <Select value={resendType} onChange={(event) => setResendType(event.target.value)}>
                  {notificationTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </Select>
                <Button variant="outline" className="w-full" onClick={resend} loading={resending}>
                  <RefreshCw className="h-4 w-4" /> Kirim ulang
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Ringkasan</h2>
            <div className="mt-2">
              <FieldRow label="Status"><BookingStatusBadge status={booking.status} /></FieldRow>
              <FieldRow label="Subtotal">{formatCurrency(booking.subtotal)}</FieldRow>
              <FieldRow label="Diskon">{formatCurrency(booking.discount)}</FieldRow>
              <FieldRow label="Pajak">{formatCurrency(booking.tax)}</FieldRow>
              <FieldRow label="Total"><Money value={booking.total} /></FieldRow>
              <FieldRow label="Dibuat"><DateTimeCell value={booking.created_at} /></FieldRow>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
