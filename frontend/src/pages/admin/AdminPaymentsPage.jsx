import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Search, Webhook } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, Input, PageHeader } from '../../components/ui/primitives';
import { DataTable, DateTimeCell, Money, PaymentStatusBadge, TableFooter } from './AdminShared';

const PAGE_SIZE = 20;

const paymentStatuses = [
  { value: '', label: 'Semua status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Lunas' },
  { value: 'failed', label: 'Gagal' },
  { value: 'expired', label: 'Kedaluwarsa' },
  { value: 'refunded', label: 'Refund' },
];

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const canManage = ['admin_ops', 'super_admin'].includes(user?.role);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'webhooks' ? 'webhooks' : 'payments';
  const page = Number(params.get('page') || 1);
  const [status, setStatus] = useState(params.get('status') || '');
  const [search, setSearch] = useState(params.get('q') || '');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refunding, setRefunding] = useState(0);

  const filters = useMemo(
    () => ({ status: params.get('status') || '', q: params.get('q') || '' }),
    [params],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const path = tab === 'webhooks' ? '/admin/webhook-events' : '/admin/payments';
      const data = await api.get(`${path}${buildQuery({ ...filters, page, page_size: PAGE_SIZE })}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setStatus(params.get('status') || '');
    setSearch(params.get('q') || '');
  }, [params]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const switchTab = (nextTab) => {
    const next = new URLSearchParams();
    next.set('tab', nextTab);
    setParams(next, { replace: true });
  };

  const refund = async (payment) => {
    const reason = window.prompt(`Alasan refund untuk ${payment.booking_code || payment.provider_reference}:`, 'Refund disetujui operator.');
    if (reason === null) return;
    setRefunding(payment.id);
    setMessage('');
    setError('');
    try {
      await api.post(`/admin/payments/${payment.id}/refund`, { reason });
      setMessage('Refund dicatat dan status pembayaran diperbarui.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefunding(0);
    }
  };

  const paymentColumns = [
    {
      key: 'reference',
      header: 'Referensi',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-hitam-0">{row.provider_reference}</p>
          {row.booking_code && <Link to={`/admin/bookings/${row.booking_code}`} className="text-[11px] font-semibold text-biru-0 hover:underline">{row.booking_code}</Link>}
        </div>
      ),
    },
    { key: 'provider', header: 'Provider / Metode', render: (row) => <span className="text-xs text-hitam-0/60">{row.provider} · {row.method || '-'}</span> },
    { key: 'status', header: 'Status', render: (row) => <PaymentStatusBadge status={row.status} /> },
    { key: 'amount', header: 'Nominal', render: (row) => <Money value={row.amount} /> },
    { key: 'paid_at', header: 'Dibayar', render: (row) => <DateTimeCell value={row.paid_at} /> },
    { key: 'created_at', header: 'Dibuat', render: (row) => <DateTimeCell value={row.created_at} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) =>
        canManage && row.status === 'paid' ? (
          <Button size="sm" variant="outline" onClick={() => refund(row)} loading={refunding === row.id}>
            <RotateCcw className="h-3.5 w-3.5" /> Refund
          </Button>
        ) : null,
    },
  ];

  const webhookColumns = [
    { key: 'event_id', header: 'Event ID', render: (row) => <span className="font-mono text-xs text-hitam-0">{row.event_id}</span> },
    { key: 'provider', header: 'Provider', render: (row) => <span className="text-xs text-hitam-0/60">{row.provider}</span> },
    { key: 'booking_code', header: 'Booking', render: (row) => row.booking_code ? <Link to={`/admin/bookings/${row.booking_code}`} className="font-mono text-xs text-biru-0 hover:underline">{row.booking_code}</Link> : '-' },
    { key: 'signature_valid', header: 'Signature', render: (row) => <Badge tone={row.signature_valid ? 'success' : 'danger'}>{row.signature_valid ? 'Valid' : 'Tidak valid'}</Badge> },
    { key: 'processed', header: 'Diproses', render: (row) => <Badge tone={row.processed ? 'success' : 'warning'}>{row.processed ? 'Ya' : 'Belum'}</Badge> },
    { key: 'created_at', header: 'Waktu', render: (row) => <DateTimeCell value={row.created_at} /> },
    {
      key: 'payload',
      header: 'Payload',
      render: (row) => (
        <details className="max-w-xs">
          <summary className="cursor-pointer text-xs font-semibold text-biru-0">Lihat</summary>
          <pre className="mt-1 max-h-40 overflow-auto rounded bg-[#f7f8f9] p-2 text-[10px] leading-relaxed text-hitam-0/70">{row.payload}</pre>
          {row.error_message && <p className="mt-1 text-[11px] text-red-600">{row.error_message}</p>}
        </details>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan"
        title="Manajemen Pembayaran"
        description="Pantau status gateway, rekonsiliasi pembayaran, catat refund, dan audit riwayat webhook."
      />

      <div className="mt-6 flex gap-2">
        <button onClick={() => switchTab('payments')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'payments' ? 'bg-hitam-0 text-white' : 'border border-hitam-0/10 bg-white text-hitam-0/60'}`}>
          Pembayaran
        </button>
        <button onClick={() => switchTab('webhooks')} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'webhooks' ? 'bg-hitam-0 text-white' : 'border border-hitam-0/10 bg-white text-hitam-0/60'}`}>
          <Webhook className="h-4 w-4" /> Webhook Events
        </button>
      </div>

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      {tab === 'payments' && (
        <Card className="mt-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <form
              className="flex flex-1 gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setParam('q', search);
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hitam-0/35" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode booking atau referensi..." className="pl-9" />
              </div>
              <Button type="submit">Cari</Button>
            </form>
            <select value={status} onChange={(event) => setParam('status', event.target.value)} className="rounded-lg border border-hitam-0/15 bg-white px-3 py-2.5 text-sm sm:w-48">
              {paymentStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </Card>
      )}

      <div className="mt-4">
        {tab === 'webhooks' ? (
          <DataTable
            columns={webhookColumns}
            rows={items}
            loading={loading}
            empty="Belum ada event webhook."
            footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={(next) => setParam('page', String(next))} label="event" />}
          />
        ) : (
          <DataTable
            columns={paymentColumns}
            rows={items}
            loading={loading}
            empty="Belum ada pembayaran."
            footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={(next) => setParam('page', String(next))} label="pembayaran" />}
          />
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Konfirmasi pembayaran hanya sah melalui webhook terverifikasi. Gunakan pembayaran manual di halaman pesanan untuk rekonsiliasi transfer di luar gateway.
      </div>
    </div>
  );
}
