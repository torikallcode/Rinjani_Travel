import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import api from '../../services/api';
import { Alert, Badge, Button, Field, Input, Modal, PageHeader, Select } from '../../components/ui/primitives';
import { DataTable, DateTimeCell } from './AdminShared';
import { initials } from '../../lib/format';

const roleLabel = {
  super_admin: 'Super Admin',
  admin_ops: 'Admin Operasional',
  admin_content: 'Admin Konten',
  customer: 'Pelanggan',
};

const emptyCreate = { name: '', email: '', phone: '', country: 'Indonesia', password: '', role: 'admin_ops' };

export default function AdminStaffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCreate);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/staff');
      setItems(data?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCreate);
    setFormError('');
    setModal('create');
  };

  const openEdit = (staff) => {
    setEditing(staff);
    setForm({ name: staff.name, phone: staff.phone || '', role: staff.role, active: staff.is_active });
    setFormError('');
    setModal('edit');
  };

  const create = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/admin/staff', form);
      setMessage('Staf berhasil dibuat. Kata sandi dapat diubah oleh staf melalui menu keamanan.');
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.put(`/admin/staff/${editing.id}`, {
        name: form.name,
        phone: form.phone,
        role: form.role,
        active: Boolean(form.active),
      });
      setMessage('Data staf diperbarui.');
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'staff',
      header: 'Staf',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hitam-0 text-xs font-bold text-white">{initials(row.name)}</span>
          <div>
            <p className="text-sm font-semibold text-hitam-0">{row.name}</p>
            <p className="text-[11px] text-hitam-0/45">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Peran', render: (row) => <Badge tone={row.role === 'super_admin' ? 'brand' : row.role === 'admin_ops' ? 'info' : 'neutral'}>{roleLabel[row.role] || row.role}</Badge> },
    { key: 'phone', header: 'WhatsApp', render: (row) => <span className="text-xs text-hitam-0/60">{row.phone || '-'}</span> },
    { key: 'active', header: 'Status', render: (row) => <Badge tone={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'verified', header: 'Email', render: (row) => <Badge tone={row.email_verified_at ? 'success' : 'warning'}>{row.email_verified_at ? 'Terverifikasi' : 'Belum'}</Badge> },
    { key: 'created_at', header: 'Dibuat', render: (row) => <DateTimeCell value={row.created_at} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Keamanan"
        title="Manajemen Staf"
        description="Kelola akses admin. Hanya super admin yang dapat menambah atau mengubah peran staf."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Staf baru</Button>}
      />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <div className="mt-4">
        <DataTable columns={columns} rows={items} loading={loading} empty="Belum ada staf." />
      </div>

      <Modal
        open={modal === 'create'}
        onClose={() => setModal(null)}
        title="Staf Baru"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="staff-create" loading={saving}>Buat staf</Button></>}
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="staff-create" onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" required className="sm:col-span-2"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <Field label="Email" required><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field>
          <Field label="WhatsApp" required><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></Field>
          <Field label="Negara"><Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></Field>
          <Field label="Peran" required>
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="admin_ops">Admin Operasional</option>
              <option value="admin_content">Admin Konten</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </Field>
          <Field label="Kata sandi awal" required hint="Minimal 8 karakter. Sampaikan secara aman kepada staf." className="sm:col-span-2">
            <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} required />
          </Field>
        </form>
      </Modal>

      <Modal
        open={modal === 'edit'}
        onClose={() => setModal(null)}
        title={`Edit ${editing?.name || 'Staf'}`}
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="staff-edit" loading={saving}>Simpan</Button></>}
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="staff-edit" onSubmit={update} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" required className="sm:col-span-2"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <Field label="WhatsApp"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <Field label="Peran" required>
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="admin_ops">Admin Operasional</option>
              <option value="admin_content">Admin Konten</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-hitam-0/70 sm:col-span-2">
            <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 rounded border-hitam-0/30 text-biru-0" />
            Akun aktif (dapat masuk)
          </label>
        </form>
      </Modal>
    </div>
  );
}
