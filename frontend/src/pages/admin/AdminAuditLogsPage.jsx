import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { Card, Input, PageHeader, Select } from '../../components/ui/primitives';
import { DataTable, DateTimeCell, TableFooter } from './AdminShared';

const PAGE_SIZE = 25;

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/audit-logs${buildQuery({ action, entity_type: entity, page, page_size: PAGE_SIZE })}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [action, entity, page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'created_at', header: 'Waktu', render: (row) => <DateTimeCell value={row.created_at} /> },
    { key: 'actor', header: 'Aktor', render: (row) => <span className="text-sm text-hitam-0">{row.actor_name || `#${row.actor_id || 'sistem'}`}</span> },
    { key: 'action', header: 'Aksi', render: (row) => <span className="rounded bg-hitam-0/5 px-2 py-1 font-mono text-[11px] text-hitam-0/70">{row.action}</span> },
    { key: 'entity', header: 'Entitas', render: (row) => <span className="text-xs text-hitam-0/60">{row.entity_type}{row.entity_id ? ` · ${row.entity_id}` : ''}</span> },
    { key: 'ip', header: 'IP', render: (row) => <span className="font-mono text-[11px] text-hitam-0/45">{row.ip_address || '-'}</span> },
    {
      key: 'detail',
      header: 'Perubahan',
      render: (row) => (
        <details className="max-w-sm">
          <summary className="cursor-pointer text-xs font-semibold text-biru-0">Lihat</summary>
          <div className="mt-1 space-y-1">
            {row.before && <pre className="max-h-32 overflow-auto rounded bg-red-50 p-2 text-[10px] text-red-800">{row.before}</pre>}
            {row.after && <pre className="max-h-32 overflow-auto rounded bg-emerald-50 p-2 text-[10px] text-emerald-800">{row.after}</pre>}
            {!row.before && !row.after && <p className="text-[11px] text-hitam-0/40">Tidak ada detail.</p>}
          </div>
        </details>
      ),
    },
  ];

  return (
    <div>
      <PageHeader eyebrow="Keamanan" title="Audit Log" description="Jejak aksi penting pada pesanan, paket, pembayaran, konten, dan pengaturan." />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hitam-0/35" />
            <Input value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} placeholder="Filter aksi, contoh booking.status" className="pl-9" />
          </div>
          <Select value={entity} onChange={(event) => { setEntity(event.target.value); setPage(1); }} className="sm:w-52">
            <option value="">Semua entitas</option>
            <option value="booking">Booking</option>
            <option value="package">Package</option>
            <option value="departure">Departure</option>
            <option value="payment">Payment</option>
            <option value="coupon">Coupon</option>
            <option value="review">Review</option>
            <option value="content_page">Content page</option>
            <option value="faq">FAQ</option>
            <option value="user">User</option>
            <option value="setting">Setting</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          empty="Belum ada aktivitas tercatat."
          footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} label="aktivitas" />}
        />
      </div>
    </div>
  );
}
