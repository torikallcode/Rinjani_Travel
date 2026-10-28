import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api, { buildQuery } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from '../../components/ui/primitives';
import { DataTable, DateCell, Money } from './AdminShared';
import { formatCurrency, formatDate, toDateInput } from '../../lib/format';

const emptyForm = {
  package_id: '',
  start_date: '',
  end_date: '',
  capacity: 12,
  price_override: '',
  booking_cutoff: '',
  status: 'open',
  guide_name: '',
  porter_name: '',
  notes: '',
};

const statusTone = { open: 'success', full: 'warning', closed: 'neutral' };

export default function AdminDeparturesPage() {
  const { user } = useAuth();
  const canManage = ['admin_ops', 'super_admin'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [search, setSearch] = useState('');
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
      const [depData, pkgData] = await Promise.all([
        api.get(`/admin/departures${buildQuery({ package_id: packageFilter })}`),
        api.get('/admin/packages?page_size=100'),
      ]);
      setItems(depData?.items || []);
      setPackages(pkgData?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [packageFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((dep) => `${dep.package?.title || ''} ${dep.guide_name || ''} ${dep.start_date}`.toLowerCase().includes(term));
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, package_id: packageFilter || packages[0]?.id || '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (dep) => {
    setEditing(dep);
    setForm({
      package_id: dep.package_id,
      start_date: toDateInput(dep.start_date),
      end_date: toDateInput(dep.end_date),
      capacity: dep.capacity,
      price_override: dep.price_override ?? '',
      booking_cutoff: toDateInput(dep.booking_cutoff),
      status: dep.status,
      guide_name: dep.guide_name || '',
      porter_name: dep.porter_name || '',
      notes: dep.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      package_id: Number(form.package_id),
      start_date: form.start_date,
      end_date: form.end_date,
      capacity: Number(form.capacity),
      price_override: form.price_override === '' ? null : Number(form.price_override),
      booking_cutoff: form.booking_cutoff || null,
      status: form.status,
      guide_name: form.guide_name,
      porter_name: form.porter_name,
      notes: form.notes,
    };
    try {
      if (editing) await api.put(`/admin/departures/${editing.id}`, payload);
      else await api.post('/admin/departures', payload);
      setMessage(editing ? 'Jadwal diperbarui.' : 'Jadwal baru dibuat.');
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (dep) => {
    if (!window.confirm(`Hapus jadwal ${formatDate(dep.start_date)} untuk ${dep.package?.title || 'paket ini'}?`)) return;
    setDeleting(dep.id);
    setMessage('');
    setError('');
    try {
      await api.delete(`/admin/departures/${dep.id}`);
      setMessage('Jadwal dihapus.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(0);
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-hitam-0">{formatDate(row.start_date)}</p>
          <p className="text-[11px] text-hitam-0/45">s.d. {formatDate(row.end_date)}</p>
        </div>
      ),
    },
    { key: 'package', header: 'Paket', render: (row) => <span className="block max-w-[260px] truncate text-sm text-hitam-0">{row.package?.title || '-'}</span> },
    {
      key: 'capacity',
      header: 'Kuota',
      render: (row) => (
        <div>
          <p className="text-sm text-hitam-0">{row.reserved_count}/{row.capacity}</p>
          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-hitam-0/10">
            <div className="h-full rounded-full bg-biru-0" style={{ width: `${row.capacity ? Math.min(100, (row.reserved_count / row.capacity) * 100) : 0}%` }} />
          </div>
        </div>
      ),
    },
    { key: 'price', header: 'Harga', render: (row) => (row.price_override ? <Money value={row.price_override} /> : <span className="text-xs text-hitam-0/40">Harga dasar</span>) },
    { key: 'cutoff', header: 'Cut-off', render: (row) => <DateCell value={row.booking_cutoff} /> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status] || 'neutral'}>{row.status}</Badge> },
    { key: 'guide', header: 'Guide', render: (row) => <span className="text-xs text-hitam-0/60">{row.guide_name || '-'}</span> },
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
        eyebrow="Operasional"
        title="Jadwal Keberangkatan"
        description="Atur tanggal, kapasitas, harga khusus, cut-off, status buka/tutup, serta guide dan porter."
        actions={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Jadwal baru</Button>}
      />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hitam-0/35" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari paket, guide, atau tanggal..." className="pl-9" />
          </div>
          <Select value={packageFilter} onChange={(event) => setPackageFilter(event.target.value)} className="sm:w-64">
            <option value="">Semua paket</option>
            {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.title}</option>)}
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        <DataTable columns={columns} rows={filtered} loading={loading} empty="Belum ada jadwal keberangkatan." />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Jadwal' : 'Jadwal Baru'}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" form="departure-form" loading={saving}>Simpan</Button>
          </>
        }
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="departure-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Paket" required className="sm:col-span-2">
            <Select value={form.package_id} onChange={(event) => setForm({ ...form, package_id: event.target.value })} required>
              <option value="">Pilih paket</option>
              {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.title}</option>)}
            </Select>
          </Field>
          <Field label="Tanggal mulai" required>
            <Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required />
          </Field>
          <Field label="Tanggal selesai" required>
            <Input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required />
          </Field>
          <Field label="Kapasitas" required>
            <Input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required />
          </Field>
          <Field label="Harga khusus (opsional)" hint="Kosongkan untuk memakai harga dasar paket.">
            <Input type="number" min="0" value={form.price_override} onChange={(event) => setForm({ ...form, price_override: event.target.value })} placeholder={formatCurrency(0)} />
          </Field>
          <Field label="Batas pemesanan (cut-off)">
            <Input type="date" value={form.booking_cutoff} onChange={(event) => setForm({ ...form, booking_cutoff: event.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="open">Buka</option>
              <option value="full">Penuh</option>
              <option value="closed">Tutup</option>
            </Select>
          </Field>
          <Field label="Guide">
            <Input value={form.guide_name} onChange={(event) => setForm({ ...form, guide_name: event.target.value })} />
          </Field>
          <Field label="Porter">
            <Input value={form.porter_name} onChange={(event) => setForm({ ...form, porter_name: event.target.value })} />
          </Field>
          <Field label="Catatan internal" className="sm:col-span-2">
            <Textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          {editing && (
            <p className="sm:col-span-2 rounded-lg bg-[#f7f8f9] px-3 py-2 text-xs text-hitam-0/55">
              <CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Kuota terisi saat ini: {editing.reserved_count}. Kapasitas tidak boleh lebih kecil dari angka ini.
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
