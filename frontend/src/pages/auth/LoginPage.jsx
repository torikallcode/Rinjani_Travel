import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function LoginPage() {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/account'} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(form.email, form.password);
      const from = location.state?.from;
      if (from) navigate(from, { replace: true });
      else navigate(['admin_ops', 'admin_content', 'super_admin'].includes(loggedUser.role) ? '/admin' : '/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div>
      <h1 className="font-tomorrow text-2xl font-bold text-hitam-0">Masuk ke akun Anda</h1>
      <p className="mt-2 text-sm text-hitam-0/55">Kelola pesanan dan lanjutkan perjalanan yang sudah direncanakan.</p>

      {error && <Alert tone="danger" className="mt-5">{error}</Alert>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email" required>
          <Input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@email.com" required />
        </Field>
        <Field label="Kata sandi" required>
          <Input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" required />
        </Field>
        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="font-semibold text-biru-0 hover:underline">Lupa kata sandi?</Link>
          <Link to="/register" className="text-hitam-0/55 hover:text-hitam-0">Belum punya akun? <span className="font-semibold text-biru-0">Daftar</span></Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Masuk</Button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-6 rounded-xl border border-hitam-0/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-hitam-0/50">Akun demo</p>
          <div className="mt-2 grid gap-2 text-xs">
            <button type="button" onClick={() => fillDemo('customer@example.com', 'Customer123!')} className="flex items-center justify-between rounded-lg bg-[#f4f5f7] px-3 py-2 text-left hover:bg-biru-0/10">
              <span><strong>Pelanggan</strong> · customer@example.com</span><span className="font-mono text-hitam-0/50">Customer123!</span>
            </button>
            <button type="button" onClick={() => fillDemo('superadmin@rinjanitravel.com', 'Admin123!')} className="flex items-center justify-between rounded-lg bg-[#f4f5f7] px-3 py-2 text-left hover:bg-biru-0/10">
              <span><strong>Super Admin</strong> · superadmin@rinjanitravel.com</span><span className="font-mono text-hitam-0/50">Admin123!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
