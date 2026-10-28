import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'Indonesia', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/account" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        password: form.password,
      });
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-tomorrow text-2xl font-bold text-hitam-0">Buat akun baru</h1>
      <p className="mt-2 text-sm text-hitam-0/55">Simpan data perjalanan dan akses voucher kapan saja.</p>

      {error && <Alert tone="danger" className="mt-5">{error}</Alert>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Nama lengkap" required>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama sesuai identitas" required minLength={2} />
        </Field>
        <Field label="Email" required>
          <Input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@email.com" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor WhatsApp" required>
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="62812xxxxxxx" required minLength={8} />
          </Field>
          <Field label="Negara">
            <Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} />
          </Field>
        </div>
        <Field label="Kata sandi" hint="Minimal 8 karakter." required>
          <Input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
        </Field>
        <Field label="Ulangi kata sandi" required>
          <Input type="password" autoComplete="new-password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required minLength={8} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Daftar</Button>
      </form>
      <p className="mt-4 text-center text-xs text-hitam-0/55">
        Sudah punya akun? <Link to="/login" className="font-semibold text-biru-0 hover:underline">Masuk</Link>
      </p>
    </div>
  );
}
