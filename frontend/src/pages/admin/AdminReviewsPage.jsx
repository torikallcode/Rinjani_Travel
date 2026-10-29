import { useCallback, useEffect, useState } from 'react';
import { Check, MessageSquare, Search, Star, X } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, Input, PageHeader, Select } from '../../components/ui/primitives';
import { DataTable, TableFooter } from './AdminShared';
import { formatDateTime } from '../../lib/format';

const PAGE_SIZE = 20;
const statusTone = { published: 'success', pending: 'warning', rejected: 'danger' };

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const canManage = ['admin_content', 'super_admin'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(0);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/reviews${buildQuery({ status, page, page_size: PAGE_SIZE })}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = query
    ? items.filter((item) => `${item.title} ${item.content} ${item.user?.name || ''} ${item.package_title || ''}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  const moderate = async (review, nextStatus, adminNote = '') => {
    setBusyId(review.id);
    setMessage('');
    setError('');
    try {
      await api.patch(`/admin/reviews/${review.id}`, { status: nextStatus, admin_note: adminNote });
      setMessage(nextStatus === 'published' ? 'Ulasan dipublikasikan.' : nextStatus === 'rejected' ? 'Ulasan ditolak.' : 'Ulasan dikembalikan ke pending.');
      setNoteFor(null);
      setNote('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(0);
    }
  };

  const columns = [
    {
      key: 'review',
      header: 'Ulasan',
      render: (row) => (
        <div className="max-w-md">
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={`h-3.5 w-3.5 ${index < row.rating ? 'fill-amber-400' : 'text-ink/15'}`} />
            ))}
          </div>
          <p className="mt-1 text-sm font-semibold text-ink">{row.title || '(tanpa judul)'}</p>
          <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-ink/60">{row.content}</p>
          {row.admin_note && <p className="mt-1 text-[11px] text-amber-700">Catatan admin: {row.admin_note}</p>}
        </div>
      ),
    },
    {
      key: 'context',
      header: 'Konteks',
      render: (row) => (
        <div className="text-xs text-ink/60">
          <p className="font-semibold text-ink">{row.user?.name || 'Pelanggan'}</p>
          <p>{row.package_title || '-'}</p>
          <p className="font-mono text-[10px] text-ink/40">{row.booking_code}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status] || 'neutral'}>{row.status}</Badge> },
    { key: 'created_at', header: 'Dikirim', render: (row) => <span className="text-xs text-ink/50">{formatDateTime(row.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) =>
        canManage ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            {row.status !== 'published' && (
              <Button size="sm" variant="outline" onClick={() => moderate(row, 'published')} loading={busyId === row.id}>
                <Check className="h-3.5 w-3.5" /> Publikasikan
              </Button>
            )}
            {row.status !== 'rejected' && (
              <Button size="sm" variant="ghost" onClick={() => { setNoteFor(row); setNote(row.admin_note || ''); }}>
                <X className="h-3.5 w-3.5" /> Tolak
              </Button>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader eyebrow="Reputasi" title="Moderasi Ulasan" description="Tinjau ulasan pelanggan sebelum dipublikasikan di halaman paket." />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input value={search} onChange={(event) => { setSearch(event.target.value); setQuery(event.target.value); }} placeholder="Cari isi ulasan, pelanggan, atau paket..." className="pl-9" />
          </div>
          <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="sm:w-48">
            <option value="">Semua status</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          empty="Belum ada ulasan."
          footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} label="ulasan" />}
        />
      </div>

      {noteFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-hitam-0/60 p-4">
          <Card className="w-full max-w-md p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-biru-0" />
              <h3 className="font-tomorrow text-lg font-bold text-ink">Tolak ulasan</h3>
            </div>
            <p className="mt-1 text-xs text-ink/55">Berikan alasan agar pelanggan memahami keputusan moderasi.</p>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" placeholder="Alasan penolakan..." />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setNoteFor(null)}>Batal</Button>
              <Button variant="danger" onClick={() => moderate(noteFor, 'rejected', note)} loading={busyId === noteFor.id}>Tolak ulasan</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
