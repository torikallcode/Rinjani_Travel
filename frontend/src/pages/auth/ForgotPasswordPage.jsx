import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.post('/auth/forgot-password', { email }, { auth: false });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-tomorrow text-2xl font-bold text-ink">Lupa kata sandi?</h1>
      <p className="mt-2 text-sm text-ink/55">Masukkan email terdaftar. Kami akan mengirim tautan untuk mengatur ulang kata sandi.</p>
      {error && <Alert tone="danger" className="mt-5">{error}</Alert>}
      {result && (
        <Alert tone="success" title="Permintaan diproses" className="mt-5">
          {result.message || 'Jika email terdaftar, tautan reset telah dikirim.'}
          {result.reset_token && (
            <p className="mt-2 text-xs">
              Mode pengembangan — token:{' '}
              <Link to={`/reset-password?token=${result.reset_token}`} className="break-all font-mono font-semibold underline">
                {result.reset_token}
              </Link>
            </p>
          )}
        </Alert>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email" required>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Kirim tautan reset</Button>
      </form>
      <p className="mt-4 text-center text-xs text-ink/55">
        Ingat kata sandi? <Link to="/login" className="font-semibold text-biru-0 hover:underline">Masuk</Link>
      </p>
    </div>
  );
}
