import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Eye, Filter, Search, X } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { Button, Card, EmptyState, Field, Input, PageHeader, Select } from '../../components/ui/primitives';
import { BookingStatusBadge, DataTable, DateCell, DateTimeCell, Money, TableFooter } from './AdminShared';

const PAGE_SIZE = 20;
const statuses = [
  { value: '', label: 'Semua status' },
  { value: 'pending_payment', label: 'Menunggu pembayaran' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'payment_expired', label: 'Kedaluwarsa' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Refund' },
];

export default function AdminBookingsPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(params.get('page') || 1);
  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      status: params.get('status') || '',
      date_from: params.get('date_from') || '',
      date_to: params.get('date_to') || '',
    }),
    [params],
  );
  const [search, setSearch] = useState(filters.q);

  useEffect(() => setSearch(filters.q), [filters.q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(`/admin/bookings${buildQuery({ ...filters, page, page_size: PAGE_SIZE })}`)
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
  }, [filters, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const clearFilters = () => setParams({}, { replace: true });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.download(`/admin/bookings/export${buildQuery(filters)}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rinjani-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const activeCount = ['q', 'status', 'date_from', 'date_to'].filter((key) => params.get(key)).length;

  const columns = [
    {
      key: 'code',
      header: 'Kode / Dibuat',
      render: (row) => (
        <div>
          <Link to={`/admin/bookings/${row.booking_code}`} className="font-mono text-xs font-semibold text-biru-0 hover:underline">
            {row.booking_code}
          </Link>
          <p className="mt-1 text-[11px] text-ink/45"><DateTimeCell value={row.created_at} /></p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Pemesan',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-ink">{row.organizer_name}</p>
          <p className="text-[11px] text-ink/50">{row.organizer_phone}</p>
        </div>
      ),
    },
    {
      key: 'package',
      header: 'Paket / Keberangkatan',
      render: (row) => (
        <div>
          <p className="max-w-[240px] truncate text-sm text-ink">{row.departure?.package?.title || '-'}</p>
          <p className="text-[11px] text-ink/50">{row.departure ? <DateCell value={row.departure.start_date} /> : '-'}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <BookingStatusBadge status={row.status} /> },
    { key: 'travelers', header: 'Peserta', render: (row) => <span className="text-ink/70">{row.number_of_travelers} org</span> },
    { key: 'total', header: 'Total', render: (row) => <Money value={row.total} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Link to={`/admin/bookings/${row.booking_code}`} className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-biru-0 hover:text-biru-0">
          <Eye className="h-3.5 w-3.5" /> Detail
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Operasional"
        title="Manajemen Pesanan"
        description="Cari, filter, periksa detail peserta, ubah status terkontrol, dan ekspor data pesanan."
        actions={
          <>
            <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>
              <Filter className="h-4 w-4" /> Filter {activeCount > 0 && `(${activeCount})`}
            </Button>
            <Button variant="outline" onClick={exportCsv} loading={exporting}>
              <Download className="h-4 w-4" /> Ekspor CSV
            </Button>
          </>
        }
      />

      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setParam('q', search);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode booking, nama, email, atau WhatsApp..." className="pl-9" />
            </div>
            <Button type="submit">Cari</Button>
          </form>
          <Select value={filters.status} onChange={(event) => setParam('status', event.target.value)} className="sm:w-52">
            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </Select>
        </div>
        {showFilters && (
          <div className="mt-4 grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-3">
            <Field label="Dibuat dari tanggal">
              <Input type="date" value={filters.date_from} onChange={(event) => setParam('date_from', event.target.value)} />
            </Field>
            <Field label="Sampai tanggal">
              <Input type="date" value={filters.date_to} onChange={(event) => setParam('date_to', event.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button variant="ghost" onClick={clearFilters} className="w-full"><X className="h-4 w-4" /> Reset filter</Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-4 text-xs text-ink/50">{total} pesanan ditemukan.</p>

      <div className="mt-2">
        {error ? (
          <EmptyState title="Gagal memuat pesanan" description={error} />
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            loading={loading}
            empty="Tidak ada pesanan yang cocok dengan filter."
            footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={(next) => setParam('page', String(next))} label="pesanan" />}
          />
        )}
      </div>
    </div>
  );
}
