import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  MapPin,
  Printer,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import { Alert, Badge, Button, Card, Field, Input, Select, Spinner, Textarea } from '../../components/ui/primitives';
import { BOOKING_STATUS, PAYMENT_STATUS, formatCurrency, formatDate, formatDateTime, packageImage, statusMeta } from '../../lib/format';

const methods = [
  { value: 'va', label: 'Transfer Virtual Account' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'qris', label: 'QRIS' },
  { value: 'card', label: 'Kartu Kredit/Debit' },
];

function Timeline({ history = [] }) {
  if (!history.length) return null;
  return (
    <ol className="relative space-y-4 border-l border-hitam-0/10 pl-5">
      {history.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-biru-0" />
          <p className="text-sm font-semibold text-hitam-0">
            {statusMeta(BOOKING_STATUS, item.to_status).label}
          </p>
          <p className="text-xs text-hitam-0/50">{formatDateTime(item.created_at)} · {item.changed_by_name || 'Sistem'}</p>
          {item.reason && <p className="mt-1 text-xs text-hitam-0/55">{item.reason}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function AccountBookingDetailPage() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('va');
  const [cancelling, setCancelling] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [reviewing, setReviewing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/bookings/${code}`);
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  const meta = useMemo(() => statusMeta(BOOKING_STATUS, booking?.status), [booking]);
  const dep = booking?.departure;
  const pkg = dep?.package;
  const pendingPayment = booking?.payments?.find((payment) => payment.status === 'pending');
  const paidPayment = booking?.payments?.find((payment) => payment.status === 'paid');
  const canCancel = ['pending_payment', 'paid', 'confirmed'].includes(booking?.status);
  const canReview = booking?.status === 'completed' && !booking?.review;

  const createPayment = async () => {
    setPaying(true);
    setActionError('');
    setActionMessage('');
    try {
      await api.post(`/bookings/${code}/payments`, { method });
      setActionMessage('Instruksi pembayaran dibuat. Selesaikan pembayaran sebelum batas waktu.');
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const simulatePayment = async (reference) => {
    setPaying(true);
    setActionError('');
    try {
      await api.post(`/dev/payments/${reference}/pay`, {}, { auth: false });
      setActionMessage('Pembayaran berhasil diverifikasi.');
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const cancelBooking = async () => {
    const reason = window.prompt('Alasan pembatalan (opsional):', '');
    if (reason === null) return;
    setCancelling(true);
    setActionError('');
    try {
      await api.post(`/bookings/${code}/cancel`, { reason });
      setActionMessage('Pesanan berhasil dibatalkan.');
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewing(true);
    setActionError('');
    try {
      await api.post(`/bookings/${code}/reviews`, reviewForm);
      setActionMessage('Terima kasih! Ulasan Anda menunggu moderasi.');
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <Spinner label="Memuat pesanan..." />;
  if (error || !booking) {
    return (
      <div>
        <Alert tone="danger" title="Pesanan tidak ditemukan">{error || 'Data pesanan tidak tersedia.'}</Alert>
        <Button as="link" to="/account/bookings" variant="outline" className="mt-4">Kembali ke daftar pesanan</Button>
      </div>
    );
  }

  return (
    <div>
      <Link to="/account/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-hitam-0/55 hover:text-biru-0">
        <ArrowLeft className="h-4 w-4" /> Semua pesanan
      </Link>

      {params.get('created') === '1' && (
        <Alert tone="success" title="Pesanan berhasil dibuat" className="mt-4">
          Kuota Anda sudah ditahan. Selesaikan pembayaran sebelum {formatDateTime(booking.expires_at)}.
        </Alert>
      )}
      {actionMessage && <Alert tone="success" className="mt-4">{actionMessage}</Alert>}
      {actionError && <Alert tone="danger" className="mt-4">{actionError}</Alert>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="font-mono text-xs text-hitam-0/50">{booking.booking_code}</span>
          </div>
          <h1 className="mt-2 font-tomorrow text-2xl font-bold text-hitam-0">{pkg?.title || 'Detail Pesanan'}</h1>
          <p className="mt-1 text-xs text-hitam-0/50">Dibuat {formatDateTime(booking.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" onClick={cancelBooking} loading={cancelling}>
              <XCircle className="h-4 w-4" /> Batalkan
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Cetak voucher
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row">
              <img src={pkg ? packageImage(pkg) : '/img/mnt4.jpg'} alt={pkg?.title} className="h-40 w-full rounded-lg object-cover sm:h-32 sm:w-44" />
              <div className="flex-1">
                <h2 className="font-tomorrow text-lg font-bold text-hitam-0">{pkg?.title}</h2>
                <div className="mt-2 grid gap-2 text-sm text-hitam-0/60 sm:grid-cols-2">
                  {dep && <p className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-biru-0" /> {formatDate(dep.start_date)} – {formatDate(dep.end_date)}</p>}
                  <p className="flex items-center gap-1.5"><Users className="h-4 w-4 text-biru-0" /> {booking.number_of_travelers} peserta</p>
                  {pkg?.departure_point && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-biru-0" /> {pkg.departure_point}</p>}
                  <p className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-biru-0" /> {formatCurrency(booking.total)}</p>
                </div>
                {pkg?.slug && (
                  <Link to={`/packages/${pkg.slug}`} className="mt-3 inline-block text-xs font-semibold text-biru-0 hover:underline">
                    Lihat detail paket →
                  </Link>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Rincian biaya</h2>
            <div className="mt-3 space-y-2 text-sm">
              {(booking.items || []).map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-hitam-0/65">
                  <span>{item.name_snapshot} × {item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon {booking.coupon_code && `(${booking.coupon_code})`}</span>
                  <span>−{formatCurrency(booking.discount)}</span>
                </div>
              )}
              {booking.tax > 0 && (
                <div className="flex justify-between text-hitam-0/65"><span>Pajak</span><span>{formatCurrency(booking.tax)}</span></div>
              )}
              <div className="flex justify-between border-t border-hitam-0/10 pt-3 font-tomorrow text-lg font-bold text-hitam-0">
                <span>Total</span><span>{formatCurrency(booking.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Data peserta</h2>
            <div className="mt-3 divide-y divide-hitam-0/10">
              {(booking.travelers || []).map((traveler, index) => (
                <div key={traveler.id || index} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-hitam-0">{traveler.name} {traveler.is_organizer && <span className="ml-1 text-[10px] font-semibold uppercase text-biru-0">Pemesan</span>}</p>
                    <p className="text-xs text-hitam-0/50">
                      {[traveler.nationality, traveler.gender === 'male' ? 'Laki-laki' : traveler.gender === 'female' ? 'Perempuan' : traveler.gender].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  {traveler.emergency_contact_phone && (
                    <p className="text-xs text-hitam-0/50">Darurat: {traveler.emergency_contact_name} · {traveler.emergency_contact_phone}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Riwayat pesanan</h2>
            <div className="mt-4">
              <Timeline history={booking.status_history} />
            </div>
          </Card>

          {canReview && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-hitam-0">Tulis ulasan</h2>
              <p className="mt-1 text-xs text-hitam-0/50">Bagikan pengalaman Anda setelah perjalanan selesai.</p>
              <form onSubmit={submitReview} className="mt-4 space-y-4">
                <Field label="Rating" required>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: value })} className="p-0.5">
                        <Star className={`h-6 w-6 ${value <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-hitam-0/20'}`} />
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Judul">
                  <Input value={reviewForm.title} onChange={(event) => setReviewForm({ ...reviewForm, title: event.target.value })} placeholder="Ringkas pengalaman Anda" />
                </Field>
                <Field label="Ulasan" required hint="Minimal 10 karakter.">
                  <Textarea value={reviewForm.content} onChange={(event) => setReviewForm({ ...reviewForm, content: event.target.value })} minLength={10} required rows={4} />
                </Field>
                <Button type="submit" loading={reviewing}>Kirim ulasan</Button>
              </form>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          {booking.status === 'pending_payment' && (
            <Card className="border-amber-200 p-5">
              <h2 className="font-tomorrow text-base font-bold text-hitam-0">Pembayaran</h2>
              <p className="mt-1 text-xs text-amber-700">Selesaikan sebelum {formatDateTime(booking.expires_at)}.</p>
              {pendingPayment ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-lg bg-[#f4f5f7] p-3">
                    <p className="text-xs text-hitam-0/50">Virtual Account / Referensi</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-hitam-0">{pendingPayment.virtual_account || pendingPayment.provider_reference}</p>
                    <p className="mt-1 text-xs text-hitam-0/50">Nominal: {formatCurrency(pendingPayment.amount)}</p>
                  </div>
                  <Button className="w-full" onClick={() => simulatePayment(pendingPayment.provider_reference)} loading={paying}>
                    Simulasikan pembayaran
                  </Button>
                  <p className="text-center text-[11px] text-hitam-0/45">Mode pengembangan: tombol ini mensimulasikan webhook gateway terverifikasi.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Field label="Metode pembayaran">
                    <Select value={method} onChange={(event) => setMethod(event.target.value)}>
                      {methods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select>
                  </Field>
                  <Button className="w-full" onClick={createPayment} loading={paying}>Buat instruksi pembayaran</Button>
                </div>
              )}
            </Card>
          )}

          {booking.status === 'confirmed' && (
            <Card className="border-emerald-200 p-5">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              <h2 className="mt-2 font-tomorrow text-base font-bold text-hitam-0">Pesanan terkonfirmasi</h2>
              <p className="mt-1 text-xs text-hitam-0/55">Tunjukkan kode booking saat tiba di titik keberangkatan.</p>
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center font-mono text-lg font-bold tracking-wider text-emerald-800">{booking.booking_code}</p>
              <Button variant="outline" className="mt-3 w-full" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Unduh / cetak voucher
              </Button>
            </Card>
          )}

          {booking.payments?.length > 0 && (
            <Card className="p-5">
              <h2 className="font-tomorrow text-base font-bold text-hitam-0">Pembayaran</h2>
              <div className="mt-3 space-y-3">
                {booking.payments.map((payment) => {
                  const pmeta = statusMeta(PAYMENT_STATUS, payment.status);
                  return (
                    <div key={payment.id} className="rounded-lg border border-hitam-0/10 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge tone={pmeta.tone}>{pmeta.label}</Badge>
                        <span className="font-semibold text-hitam-0">{formatCurrency(payment.amount)}</span>
                      </div>
                      <p className="mt-2 text-hitam-0/50">{payment.method || payment.provider} · {formatDateTime(payment.created_at)}</p>
                      {payment.paid_at && <p className="text-emerald-600">Dibayar {formatDateTime(payment.paid_at)}</p>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Informasi pemesan</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div><dt className="text-hitam-0/45">Nama</dt><dd className="font-semibold text-hitam-0">{booking.organizer_name}</dd></div>
              <div><dt className="text-hitam-0/45">WhatsApp</dt><dd className="font-semibold text-hitam-0">{booking.organizer_phone}</dd></div>
              <div><dt className="text-hitam-0/45">Email</dt><dd className="break-all font-semibold text-hitam-0">{booking.organizer_email || '-'}</dd></div>
              {booking.notes && <div><dt className="text-hitam-0/45">Catatan</dt><dd className="text-hitam-0/70">{booking.notes}</dd></div>}
            </dl>
          </Card>

          {paidPayment && booking.status === 'confirmed' && (
            <Alert tone="success" title="Pembayaran terverifikasi">
              Terima kasih. Voucher Anda sudah aktif dan tim kami akan menghubungi Anda sebelum keberangkatan.
            </Alert>
          )}
        </aside>
      </div>
    </div>
  );
}
