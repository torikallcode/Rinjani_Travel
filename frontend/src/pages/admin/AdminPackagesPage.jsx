import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, EmptyState, Input, PageHeader, Select } from '../../components/ui/primitives';
import { DataTable, Money, TableFooter } from './AdminShared';
import { formatDate, packageImage } from '../../lib/format';

const PAGE_SIZE = 20;

export default function AdminPackagesPage() {
  const { user } = useAuth();
  const canManage = ['admin_content', 'super_admin'].includes(user?.role);
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState(params.get('q') || '');
  const [deleting, setDeleting] = useState(0);

  const page = Number(params.get('page') || 1);
  const filters = useMemo(
    () => ({ q: params.get('q') || '', status: params.get('status') || '', category: params.get('category') || '' }),
    [params],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/packages${buildQuery({ ...filters, page, page_size: PAGE_SIZE })}`);
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const remove = async (pkg) => {
    if (!window.confirm(`Hapus paket "${pkg.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(pkg.id);
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/packages/${pkg.id}`);
      setMessage('Paket berhasil dihapus.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(0);
    }
  };

  const columns = [
    {
      key: 'package',
      header: 'Paket',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={packageImage(row)} alt={row.title} className="h-12 w-16 rounded object-cover" />
          <div className="min-w-0">
            <p className="max-w-[280px] truncate text-sm font-semibold text-hitam-0">{row.title}</p>
            <p className="text-[11px] text-hitam-0/45">{row.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Kategori', render: (row) => <Badge tone={row.category === 'trekking' ? 'brand' : 'info'}>{row.category}</Badge> },
    { key: 'base_price', header: 'Harga dasar', render: (row) => <Money value={row.base_price} /> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'neutral'}>{row.status}</Badge> },
    { key: 'featured', header: 'Unggulan', render: (row) => (row.featured ? <Badge tone="warning">Ya</Badge> : <span className="text-xs text-hitam-0/40">Tidak</span>) },
    { key: 'created_at', header: 'Dibuat', render: (row) => <span className="text-xs text-hitam-0/50">{formatDate(row.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <Link to={`/packages/${row.slug}`} target="_blank" className="rounded-lg border border-hitam-0/15 p-2 text-hitam-0/60 hover:text-biru-0" title="Lihat publik">
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {canManage && (
            <>
              <Link to={`/admin/packages/${row.id}/edit`} className="rounded-lg border border-hitam-0/15 p-2 text-hitam-0/60 hover:text-biru-0" title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button onClick={() => remove(row)} disabled={deleting === row.id} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40" title="Hapus">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Katalog"
        title="Paket Wisata"
        description="Kelola paket, itinerary, fasilitas, add-on, FAQ, SEO, dan status publikasi."
        actions={canManage && <Button as="link" to="/admin/packages/new"><Plus className="h-4 w-4" /> Paket baru</Button>}
      />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setParam('q', search);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hitam-0/35" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau slug..." className="pl-9" />
            </div>
            <Button type="submit">Cari</Button>
          </form>
          <Select value={filters.category} onChange={(event) => setParam('category', event.target.value)} className="lg:w-44">
            <option value="">Semua kategori</option>
            <option value="trekking">Trekking</option>
            <option value="tour">Tour</option>
          </Select>
          <Select value={filters.status} onChange={(event) => setParam('status', event.target.value)} className="lg:w-44">
            <option value="">Semua status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {error && !items.length ? (
          <EmptyState title="Gagal memuat paket" description={error} />
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            loading={loading}
            empty="Belum ada paket."
            footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={(next) => setParam('page', String(next))} label="paket" />}
          />
        )}
      </div>
    </div>
  );
}
