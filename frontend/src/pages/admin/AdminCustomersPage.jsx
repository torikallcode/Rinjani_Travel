import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Search, UserRound } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { Badge, Button, Card, Input, Modal, PageHeader, Spinner } from '../../components/ui/primitives';
import { BookingStatusBadge, DataTable, FieldRow, Money, TableFooter } from './AdminShared';
import { formatDate, formatDateTime, initials } from '../../lib/format';

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/customers${buildQuery({ q: query, page, page_size: PAGE_SIZE })}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (customer) => {
    setDetail({ user: customer, bookings: null });
    setDetailLoading(true);
    try {
      const data = await api.get(`/admin/customers/${customer.id}`);
      setDetail(data);
    } catch (err) {
      setDetail({ user: customer, bookings: [], error: err.message });
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'customer',
      header: 'Pelanggan',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-biru-0/15 text-xs font-bold text-biru-0">{initials(row.name)}</span>
          <div>
            <p className="text-sm font-semibold text-hitam-0">{row.name}</p>
            <p className="text-[11px] text-hitam-0/45">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'WhatsApp', render: (row) => <span className="text-xs text-hitam-0/60">{row.phone || '-'}</span> },
    { key: 'country', header: 'Negara', render: (row) => <span className="text-xs text-hitam-0/60">{row.country || '-'}</span> },
    { key: 'bookings', header: 'Pesanan', render: (row) => <Badge tone="neutral">{row.booking_count || 0}</Badge> },
    { key: 'spent', header: 'Total belanja', render: (row) => <Money value={row.total_spent} /> },
    { key: 'created_at', header: 'Terdaftar', render: (row) => <span className="text-xs text-hitam-0/50">{formatDate(row.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => <Button size="sm" variant="outline" onClick={() => openDetail(row)}><UserRound className="h-3.5 w-3.5" /> Detail</Button>,
    },
  ];

  return (
    <div>
      <PageHeader eyebrow="CRM" title="Pelanggan" description="Lihat profil pelanggan, riwayat pesanan, dan nilai transaksi." />

      <Card className="mt-4 p-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hitam-0/35" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, atau telepon..." className="pl-9" />
          </div>
          <Button type="submit">Cari</Button>
        </form>
      </Card>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          empty="Belum ada pelanggan."
          footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} label="pelanggan" />}
        />
      </div>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Pelanggan" wide>
        {detail && (
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-biru-0 text-base font-bold text-white">{initials(detail.user.name)}</span>
              <div>
                <p className="font-tomorrow text-lg font-bold text-hitam-0">{detail.user.name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-hitam-0/55">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {detail.user.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {detail.user.phone || '-'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <FieldRow label="Negara">{detail.user.country}</FieldRow>
                <FieldRow label="Kontak darurat">{detail.user.emergency_contact_name}</FieldRow>
                <FieldRow label="Telepon darurat">{detail.user.emergency_contact_phone}</FieldRow>
                <FieldRow label="Email terverifikasi">{detail.user.email_verified_at ? <Badge tone="success">Ya</Badge> : <Badge tone="warning">Belum</Badge>}</FieldRow>
                <FieldRow label="Status akun">{detail.user.is_active ? <Badge tone="success">Aktif</Badge> : <Badge tone="danger">Nonaktif</Badge>}</FieldRow>
                <FieldRow label="Terdaftar">{formatDateTime(detail.user.created_at)}</FieldRow>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-hitam-0/45">Riwayat pesanan</p>
                {detailLoading ? (
                  <Spinner label="Memuat..." />
                ) : (detail.bookings || []).length === 0 ? (
                  <p className="mt-3 text-sm text-hitam-0/45">Belum ada pesanan.</p>
                ) : (
                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {(detail.bookings || []).map((booking) => (
                      <Link key={booking.id} to={`/admin/bookings/${booking.booking_code}`} className="block rounded-lg border border-hitam-0/10 p-3 hover:border-biru-0/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-biru-0">{booking.booking_code}</span>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="mt-1 truncate text-xs text-hitam-0/60">{booking.departure?.package?.title || '-'}</p>
                        <div className="mt-1 flex justify-between text-[11px] text-hitam-0/45">
                          <span>{formatDate(booking.departure?.start_date)}</span>
                          <Money value={booking.total} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
