import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from '../../components/ui/primitives';
import { DataTable, TableFooter } from './AdminShared';
import { formatDate } from '../../lib/format';

const PAGE_SIZE = 20;
const emptyForm = {
  code: '',
  description: '',
  type: 'percent',
  value: 10,
  min_spend: 0,
  max_discount: 0,
  usage_limit: 0,
  starts_at: '',
  ends_at: '',
  active: true,
};

const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const canManage = ['admin_content', 'super_admin'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/admin/coupons${buildQuery({ q: query, page, page_size: PAGE_SIZE })}`);
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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      min_spend: coupon.min_spend,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      starts_at: toLocalInput(coupon.starts_at),
      ends_at: toLocalInput(coupon.ends_at),
      active: coupon.active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      min_spend: Number(form.min_spend) || 0,
      max_discount: Number(form.max_discount) || 0,
      usage_limit: Number(form.usage_limit) || 0,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    try {
      if (editing) await api.put(`/admin/coupons/${editing.id}`, payload);
      else await api.post('/admin/coupons', payload);
      setMessage(editing ? 'Kode promo diperbarui.' : 'Kode promo dibuat.');
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Hapus kode promo ${coupon.code}?`)) return;
    setDeleting(coupon.id);
    setMessage('');
    setError('');
    try {
      await api.delete(`/admin/coupons/${coupon.id}`);
      setMessage('Kode promo dihapus.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(0);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Kode',
      render: (row) => (
        <div>
          <p className="font-mono text-sm font-bold text-hitam-0">{row.code}</p>
          <p className="max-w-[220px] truncate text-[11px] text-hitam-0/45">{row.description || '-'}</p>
        </div>
      ),
    },
    { key: 'value', header: 'Nilai', render: (row) => <span className="text-sm font-semibold text-hitam-0">{row.type === 'percent' ? `${row.value}%` : formatRupiah(row.value)}</span> },
    { key: 'min_spend', header: 'Min. belanja', render: (row) => <span className="text-xs text-hitam-0/60">{row.min_spend ? formatRupiah(row.min_spend) : '-'}</span> },
    { key: 'usage', header: 'Pemakaian', render: (row) => <Badge tone="neutral">{row.used_count}{row.usage_limit ? ` / ${row.usage_limit}` : ''}</Badge> },
    { key: 'period', header: 'Periode', render: (row) => <span className="text-xs text-hitam-0/55">{formatDate(row.starts_at)} – {formatDate(row.ends_at)}</span> },
    { key: 'active', header: 'Status', render: (row) => <Badge tone={row.active ? 'success' : 'neutral'}>{row.active ? 'Aktif' : 'Nonaktif'}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) =>
        canManage ? (
          <div className="flex justify-end gap-1.5">
            <button onClick={() => openEdit(row)} className="rounded-lg border border-hitam-0/15 p-2 text-hitam-0/60 hover:text-biru-0" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => remove(row)} disabled={deleting === row.id} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Promosi"
        title="Kode Promo"
        description="Kelola diskon persentase atau nominal tetap, batas pemakaian, dan masa berlaku."
        actions={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Kode baru</Button>}
      />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

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
            <Input value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} placeholder="Cari kode promo..." className="pl-9 uppercase" />
          </div>
          <Button type="submit">Cari</Button>
        </form>
      </Card>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          empty="Belum ada kode promo."
          footer={<TableFooter page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} label="kode" />}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Kode Promo' : 'Kode Promo Baru'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" form="coupon-form" loading={saving}>Simpan</Button>
          </>
        }
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="coupon-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Kode" required><Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="uppercase" required /></Field>
          <Field label="Tipe" required>
            <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="percent">Persentase</option>
              <option value="fixed">Nominal tetap</option>
            </Select>
          </Field>
          <Field label={form.type === 'percent' ? 'Nilai (%)' : 'Nilai (IDR)'} required>
            <Input type="number" min="1" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} required />
          </Field>
          <Field label="Maks. diskon (IDR)" hint="0 = tanpa batas. Berlaku untuk tipe persentase.">
            <Input type="number" min="0" value={form.max_discount} onChange={(event) => setForm({ ...form, max_discount: event.target.value })} />
          </Field>
          <Field label="Min. belanja (IDR)">
            <Input type="number" min="0" value={form.min_spend} onChange={(event) => setForm({ ...form, min_spend: event.target.value })} />
          </Field>
          <Field label="Batas pemakaian" hint="0 = tanpa batas.">
            <Input type="number" min="0" value={form.usage_limit} onChange={(event) => setForm({ ...form, usage_limit: event.target.value })} />
          </Field>
          <Field label="Mulai berlaku">
            <Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
          </Field>
          <Field label="Berakhir">
            <Input type="datetime-local" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
          </Field>
          <Field label="Deskripsi" className="sm:col-span-2">
            <Textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-hitam-0/70 sm:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 rounded border-hitam-0/30 text-biru-0" />
            Aktif dan dapat digunakan pelanggan
          </label>
        </form>
      </Modal>
    </div>
  );
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}
