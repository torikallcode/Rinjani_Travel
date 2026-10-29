import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';
import { Alert, Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../../components/ui/primitives';

const fields = [
  { key: 'business_name', label: 'Nama bisnis' },
  { key: 'business_email', label: 'Email bisnis', type: 'email' },
  { key: 'business_phone', label: 'Telepon bisnis' },
  { key: 'whatsapp', label: 'Nomor WhatsApp', hint: 'Format internasional tanpa tanda +, contoh 6281234567890.' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tax_percent', label: 'Pajak / biaya (%)', type: 'number', hint: '0 = tanpa pajak. Dihitung server saat checkout.' },
  { key: 'booking_hold_minutes', label: 'Durasi tahan kuota (menit)', type: 'number' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/admin/settings')
      .then((data) => alive && setSettings(data?.settings || {}))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put('/admin/settings', settings);
      setMessage('Pengaturan berhasil disimpan.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Memuat pengaturan..." />;
  if (error && !settings) return <Alert tone="danger" title="Gagal memuat pengaturan">{error}</Alert>;

  return (
    <div>
      <PageHeader eyebrow="Konfigurasi" title="Pengaturan Bisnis" description="Informasi ini tampil di situs publik dan memengaruhi perhitungan checkout." />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <form onSubmit={save} className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <h2 className="font-tomorrow text-lg font-bold text-ink">Identitas & kontak</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Field key={field.key} label={field.label} hint={field.hint} className={field.key === 'business_name' ? 'sm:col-span-2' : ''}>
                <Input
                  type={field.type || 'text'}
                  value={settings?.[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                />
              </Field>
            ))}
            <Field label="Alamat bisnis" className="sm:col-span-2">
              <Textarea rows={3} value={settings?.business_address ?? ''} onChange={(event) => update('business_address', event.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-ink">Kebijakan & instruksi</h2>
            <div className="mt-4 space-y-4">
              <Field label="Instruksi pembayaran">
                <Textarea rows={4} value={settings?.payment_instructions ?? ''} onChange={(event) => update('payment_instructions', event.target.value)} />
              </Field>
              <Field label="Ringkasan kebijakan pembatalan">
                <Textarea rows={4} value={settings?.cancellation_policy_summary ?? ''} onChange={(event) => update('cancellation_policy_summary', event.target.value)} />
              </Field>
              <Field label="Catatan keselamatan">
                <Textarea rows={4} value={settings?.safety_note ?? ''} onChange={(event) => update('safety_note', event.target.value)} />
              </Field>
            </div>
          </Card>
          <Button type="submit" size="lg" className="w-full" loading={saving}><Save className="h-4 w-4" /> Simpan pengaturan</Button>
          <p className="text-center text-[11px] text-ink/45">Perubahan pajak dan durasi tahan kuota berlaku untuk transaksi baru.</p>
        </div>
      </form>
    </div>
  );
}
