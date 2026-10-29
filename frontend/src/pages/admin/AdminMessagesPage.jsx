import { useCallback, useEffect, useState } from 'react';
import { Archive, CheckCheck, Eye, Mail, Phone, Search } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { Alert, Badge, Button, Card, Input, Modal, PageHeader, Select } from '../../components/ui/primitives';
import { DataTable, TableFooter } from './AdminShared';
import { formatDateTime } from '../../lib/format';

const PAGE_SIZE = 20;
const statusTone = { new: 'warning', read: 'info', replied: 'success', archived: 'neutral' };

export default function AdminMessagesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/messages${buildQuery({ status, page, page_size: PAGE_SIZE })}`);
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

  const open = async (item) => {
    setSelected(item);
    if (item.status === 'new') {
      try {
        await api.patch(`/admin/messages/${item.id}`, { status: 'read' });
        await load();
      } catch {
        // Keep the message readable even if the status update fails.
      }
    }
  };

  const updateStatus = async (item, nextStatus) => {
    setBusy(item.id);
    setMessage('');
    setError('');
    try {
      await api.patch(`/admin/messages/${item.id}`, { status: nextStatus });
      setMessage('Status pesan diperbarui.');
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(0);
    }
  };

  const columns = [
    {
      key: 'from',
      header: 'Pengirim',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-ink">{row.name}</p>
          <p className="text-[11px] text-ink/45">{row.email}</p>
        </div>
      ),
    },
    { key: 'subject', header: 'Subjek', render: (row) => <span className="block max-w-xs truncate text-sm text-ink">{row.subject || '(tanpa subjek)'}</span> },
    { key: 'message', header: 'Pesan', render: (row) => <span className="line-clamp-2 max-w-md text-xs text-ink/55">{row.message}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status] || 'neutral'}>{row.status}</Badge> },
    { key: 'created_at', header: 'Diterima', render: (row) => <span className="text-xs text-ink/50">{formatDateTime(row.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => open(row)}>
          <Eye className="h-3.5 w-3.5" /> Baca
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader eyebrow="Komunikasi" title="Pesan Masuk" description="Tanggapi pertanyaan calon pelanggan dan tandai pesan yang sudah selesai." />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input disabled placeholder="Gunakan filter status untuk mempersempit daftar." className="pl-9" />
          </div>
          <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="sm:w-48">
            <option value="">Semua status</option>
            <option value="new">Baru</option>
            <option value="read">Dibaca</option>
            <option value="replied">Dibalas</option>
            <option value="archived">Arsip</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          empty="Belum ada pesan masuk."
          footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} label="pesan" />}
        />
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.subject || 'Pesan Masuk'} wide>
        {selected && (
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink/55">
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {selected.email}</span>
              {selected.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {selected.phone}</span>}
              <span>{formatDateTime(selected.created_at)}</span>
              <Badge tone={statusTone[selected.status] || 'neutral'}>{selected.status}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">{selected.name}</p>
            <div className="mt-2 whitespace-pre-line rounded-lg bg-panel p-4 text-sm leading-relaxed text-ink/75">{selected.message}</div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>Tutup</Button>
              {selected.status !== 'replied' && (
                <Button variant="outline" onClick={() => updateStatus(selected, 'replied')} loading={busy === selected.id}>
                  <CheckCheck className="h-4 w-4" /> Tandai dibalas
                </Button>
              )}
              {selected.status !== 'archived' && (
                <Button variant="dark" onClick={() => updateStatus(selected, 'archived')} loading={busy === selected.id}>
                  <Archive className="h-4 w-4" /> Arsipkan
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
