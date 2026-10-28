import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Alert, Button, Spinner } from '../../components/ui/primitives';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan pada tautan.');
      return;
    }
    api
      .post('/auth/verify-email', { token }, { auth: false })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [params]);

  return (
    <div>
      <h1 className="font-tomorrow text-2xl font-bold text-hitam-0">Verifikasi email</h1>
      {status === 'loading' && <Spinner label="Memverifikasi email..." />}
      {status === 'success' && (
        <>
          <Alert tone="success" title="Email terverifikasi" className="mt-5">
            Akun Anda sudah aktif. Anda dapat melanjutkan menjelajahi paket dan membuat pesanan.
          </Alert>
          <Button as="link" to="/account" className="mt-4">Buka akun saya</Button>
        </>
      )}
      {status === 'error' && (
        <>
          <Alert tone="danger" title="Verifikasi gagal" className="mt-5">{message}</Alert>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-biru-0 hover:underline">Kembali ke halaman masuk</Link>
        </>
      )}
    </div>
  );
}
