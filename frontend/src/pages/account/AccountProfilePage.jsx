import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Alert, Button, Card, Field, Input, PageHeader } from '../../components/ui/primitives';

export default function AccountProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await api.put('/me', form);
      updateUser(data.user);
      setMessage('Profil berhasil diperbarui.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Akun" title="Profil Saya" description="Perbarui data kontak agar tim kami dapat menghubungi Anda terkait perjalanan." />
      <Card className="mt-6 p-5 sm:p-6">
        {message && <Alert tone="success" className="mb-4">{message}</Alert>}
        {error && <Alert tone="danger" className="mb-4">{error}</Alert>}
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" required>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </Field>
          <Field label="Email">
            <Input value={user?.email || ''} disabled />
          </Field>
          <Field label="Nomor WhatsApp">
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="62812xxxxxxx" />
          </Field>
          <Field label="Negara">
            <Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Indonesia" />
          </Field>
          <Field label="Kontak darurat (nama)">
            <Input value={form.emergency_contact_name} onChange={(event) => setForm({ ...form, emergency_contact_name: event.target.value })} />
          </Field>
          <Field label="Kontak darurat (telepon)">
            <Input value={form.emergency_contact_phone} onChange={(event) => setForm({ ...form, emergency_contact_phone: event.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>Simpan perubahan</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
