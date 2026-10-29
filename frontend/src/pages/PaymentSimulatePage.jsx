import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import api from '../services/api';
import { Alert, Button, Card } from '../components/ui/primitives';
import Seo from '../components/Seo';

export default function PaymentSimulatePage() {
  const [params] = useSearchParams();
  const reference = params.get('ref') || '';
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const pay = async () => {
    setProcessing(true);
    setError('');
    try {
      const event = await api.post(`/dev/payments/${encodeURIComponent(reference)}/pay`, {}, { auth: false });
      setResult(event);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-12 sm:px-6">
      <Seo title="Simulasi Pembayaran" description="Halaman simulasi pembayaran hanya tersedia di lingkungan pengembangan." noIndex={true} />
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="font-tomorrow text-lg font-bold text-ink">
          RINJANI<span className="text-biru-0">.</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <TriangleAlert className="h-3.5 w-3.5" /> Mode simulasi
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-hitam-0 px-6 py-5 text-white">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <CreditCard className="h-4 w-4" /> Gateway Pembayaran
          </p>
          <h1 className="mt-2 font-tomorrow text-2xl font-bold">Simulasi pembayaran</h1>
          <p className="mt-1 text-sm text-white/60">Halaman ini hanya tersedia di lingkungan pengembangan.</p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          {!reference ? (
            <Alert tone="danger" title="Referensi pembayaran tidak ditemukan">
              Buka halaman ini melalui tautan pembayaran yang diberikan saat membuat pesanan.
            </Alert>
          ) : result ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-tomorrow text-xl font-bold text-ink">Pembayaran berhasil diverifikasi</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
                Webhook bertanda tangan sudah diproses melalui jalur yang sama dengan gateway produksi. Status pesanan diperbarui secara otomatis.
              </p>
              <div className="mx-auto mt-5 max-w-sm rounded-lg bg-panel p-4 text-left text-xs text-ink/60">
                <p><span className="font-semibold text-ink">Kode pesanan:</span> {result.booking_code}</p>
                <p className="mt-1"><span className="font-semibold text-ink">Referensi:</span> {result.payment_reference}</p>
                <p className="mt-1"><span className="font-semibold text-ink">Event ID:</span> {result.event_id}</p>
              </div>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button as="link" to={`/account/bookings/${result.booking_code}`}>Lihat pesanan</Button>
                <Button as="link" to="/packages" variant="outline">Jelajahi paket lain</Button>
              </div>
            </div>
          ) : (
            <>
              {error && <Alert tone="danger" title="Simulasi gagal">{error}</Alert>}
              <div className="rounded-lg border border-ink/10 bg-subtle p-5">
                <p className="text-xs uppercase tracking-wide text-ink/45">Referensi pembayaran</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{reference}</p>
                <p className="mt-3 text-xs leading-relaxed text-ink/55">
                  Dengan menekan tombol di bawah, sistem akan membuat event <code className="rounded bg-ink/5 px-1">payment.paid</code> bertanda tangan HMAC dan mengirimkannya ke webhook internal.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-biru-0/5 p-4 text-xs text-ink/60">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-biru-0" />
                <p>
                  Ini bukan pembayaran nyata. Tidak ada uang yang berpindah. Di produksi, tombol ini dinonaktifkan dan pembayaran hanya dikonfirmasi oleh gateway resmi.
                </p>
              </div>
              <Button size="lg" className="w-full" loading={processing} onClick={pay}>
                <Lock className="h-4 w-4" /> Simulasikan pembayaran berhasil
              </Button>
              <p className="text-center text-xs text-ink/40">
                Butuh bantuan? <Link to="/contact" className="font-semibold text-biru-0 hover:underline">Hubungi tim kami</Link>
              </p>
            </>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-ink/40">
        <Link to="/" className="hover:text-biru-0">Kembali ke beranda</Link>
      </p>
    </div>
  );
}
