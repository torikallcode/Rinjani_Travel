import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: form.token, password: form.password }, { auth: false });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-tomorrow text-2xl font-bold text-hitam-0">Atur kata sandi baru</h1>
      <p className="mt-2 text-sm text-hitam-0/55">Gunakan minimal 8 karakter dan kombinasi yang mudah Anda ingat.</p>
      {error && <Alert tone="danger" className="mt-5">{error}</Alert>}
      {success && <Alert tone="success" title="Berhasil" className="mt-5">Kata sandi diperbarui. Mengarahkan ke halaman masuk...</Alert>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Token reset" required>
          <Input value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} required />
        </Field>
        <Field label="Kata sandi baru" required>
          <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
        </Field>
        <Field label="Ulangi kata sandi baru" required>
          <Input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required minLength={8} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Simpan kata sandi</Button>
      </form>
      <p className="mt-4 text-center text-xs text-hitam-0/55">
        <Link to="/login" className="font-semibold text-biru-0 hover:underline">Kembali ke halaman masuk</Link>
      </p>
    </div>
  );
}
