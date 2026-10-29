import { useEffect, useState } from 'react';
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import api from '../services/api';
import Seo from '../components/Seo';
import { Alert, Button, Card, Field, Input, Textarea } from '../components/ui/primitives';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/settings/public', { auth: false }).then(setSettings).catch(() => {});
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await api.post(
        '/contact',
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { auth: false },
      );
      setSuccess('Pesan Anda sudah kami terima. Tim akan menghubungi Anda segera.');
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const whatsapp = (settings.whatsapp || '6281234567890').replace(/[^0-9]/g, '');

  const channels = [
    { icon: MapPin, label: 'Kantor', value: settings.business_address || 'Jl. Raya Sembalun, Lombok Timur, NTB' },
    { icon: Phone, label: 'Telepon', value: settings.business_phone || '+62 812-3456-7890', href: `tel:${(settings.business_phone || '+6281234567890').replace(/\s/g, '')}` },
    { icon: Mail, label: 'Email', value: settings.business_email || 'hello@rinjanitravel.com', href: `mailto:${settings.business_email || 'hello@rinjanitravel.com'}` },
    { icon: Instagram, label: 'Instagram', value: settings.instagram || '@rinjanitravel' },
  ];

  return (
    <div>
      <Seo
        title="Hubungi Kami"
        description="Hubungi tim Rinjani Travel untuk pertanyaan paket, tanggal, rombongan besar, atau kebutuhan perjalanan khusus di Lombok."
      />
      <section className="bg-hitam-0 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <MessageCircle className="h-4 w-4" /> Hubungi kami
          </p>
          <h1 className="mt-3 font-tomorrow text-3xl font-bold sm:text-4xl">Mari bicarakan perjalanan Anda</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Punya pertanyaan tentang paket, tanggal, rombongan besar, atau kebutuhan khusus? Kirim pesan dan tim lokal kami akan membantu.
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <Card className="p-6 sm:p-8">
          <h2 className="font-tomorrow text-xl font-bold text-ink">Kirim pesan</h2>
          <p className="mt-1 text-sm text-ink/55">Isi formulir di bawah. Kami biasanya membalas dalam 1 hari kerja.</p>

          {success && <Alert tone="success" className="mt-5">{success}</Alert>}
          {error && <Alert tone="danger" title="Pesan gagal dikirim" className="mt-5">{error}</Alert>}

          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" required>
              <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nama Anda" required minLength={2} />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="nama@email.com" required />
            </Field>
            <Field label="Nomor WhatsApp">
              <Input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="62812xxxxxxx" />
            </Field>
            <Field label="Subjek">
              <Input value={form.subject} onChange={(event) => update('subject', event.target.value)} placeholder="Mis. rombongan 12 orang" />
            </Field>
            <Field label="Pesan" required className="sm:col-span-2">
              <Textarea
                rows={6}
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
                placeholder="Ceritakan tanggal rencana, jumlah peserta, dan kebutuhan Anda..."
                required
                minLength={10}
                maxLength={3000}
              />
            </Field>
            <div className="sm:col-span-2 flex flex-col items-start justify-between gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-ink/45">Data Anda hanya digunakan untuk menjawab pertanyaan ini.</p>
              <Button type="submit" loading={sending}>
                <Send className="h-4 w-4" /> Kirim pesan
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="p-6">
            <h2 className="font-tomorrow text-base font-bold text-ink">Informasi kontak</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const content = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-biru-0/10 text-biru-0">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink/40">{channel.label}</p>
                      <p className="mt-0.5 leading-snug text-ink/75">{channel.value}</p>
                    </div>
                  </>
                );
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a href={channel.href} className="flex items-start gap-3 hover:text-biru-0">{content}</a>
                    ) : (
                      <div className="flex items-start gap-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/55">
              <p className="flex items-center gap-2 font-semibold text-ink"><Clock className="h-3.5 w-3.5 text-biru-0" /> Jam operasional</p>
              <p className="mt-1.5">Senin–Sabtu, 08.00–18.00 WITA</p>
            </div>
          </Card>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl bg-emerald-600 p-5 text-white shadow-sm transition hover:bg-emerald-700"
          >
            <div>
              <p className="font-tomorrow text-sm font-bold">Chat WhatsApp</p>
              <p className="mt-1 text-xs text-white/80">Respons lebih cepat pada jam kerja</p>
            </div>
            <MessageCircle className="h-6 w-6" />
          </a>

          <div className="rounded-xl border border-ink/10 bg-surface p-5 text-xs text-ink/55">
            <p className="font-semibold text-ink">Untuk rombongan besar</p>
            <p className="mt-1.5 leading-relaxed">
              Rombongan lebih dari 10 peserta sebaiknya menghubungi kami lebih awal agar ketersediaan guide, porter, dan transportasi bisa dipastikan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
