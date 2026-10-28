import { useState } from 'react';
import api from '../../services/api';
import { Alert, Button, Card, Field, Input, PageHeader } from '../../components/ui/primitives';

export default function AccountSecurityPage() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (form.new_password !== form.confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/me/password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMessage('Kata sandi berhasil diperbarui.');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Akun" title="Keamanan" description="Gunakan kata sandi yang kuat dan tidak dipakai di layanan lain." />
      <Card className="mt-6 max-w-xl p-5 sm:p-6">
        {message && <Alert tone="success" className="mb-4">{message}</Alert>}
        {error && <Alert tone="danger" className="mb-4">{error}</Alert>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="Kata sandi saat ini" required>
            <Input type="password" value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} required />
          </Field>
          <Field label="Kata sandi baru" hint="Minimal 8 karakter." required>
            <Input type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} minLength={8} required />
          </Field>
          <Field label="Ulangi kata sandi baru" required>
            <Input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} minLength={8} required />
          </Field>
          <Button type="submit" loading={saving}>Perbarui kata sandi</Button>
        </form>
      </Card>
    </div>
  );
}
