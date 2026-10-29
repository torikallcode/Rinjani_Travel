import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import ContentHtml from '../components/ContentHtml';
import Seo from '../components/Seo';
import { Alert, Button, Card, Spinner } from '../components/ui/primitives';
import { formatDate } from '../lib/format';

const infoLinks = [
  { slug: 'about', label: 'Tentang Kami' },
  { slug: 'faq', label: 'Pertanyaan Umum' },
  { slug: 'terms', label: 'Syarat & Ketentuan' },
  { slug: 'privacy', label: 'Kebijakan Privasi' },
  { slug: 'cancellation', label: 'Kebijakan Pembatalan' },
  { slug: 'safety', label: 'Keselamatan' },
];

export default function ContentPage({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setPage(null);
    api
      .get(`/content/${slug}`, { auth: false })
      .then((data) => alive && setPage(data))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <Spinner label="Memuat halaman..." />;

  if (error || !page) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <Alert tone="danger" title="Halaman tidak dapat dimuat">
          {error || 'Halaman yang Anda cari tidak ditemukan.'}
        </Alert>
        <Button as="link" to="/" className="mt-4">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Seo title={page.title} description={page.meta_description || undefined} />
      <section className="bg-hitam-0 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <FileText className="h-3.5 w-3.5" /> Informasi perjalanan
          </p>
          <h1 className="mt-3 font-tomorrow text-3xl font-bold sm:text-4xl">{page.title}</h1>
          {page.meta_description && <p className="mt-3 max-w-2xl text-sm text-white/60">{page.meta_description}</p>}
          <p className="mt-4 text-xs text-white/40">Diperbarui {formatDate(page.updated_at)}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_260px] lg:px-8">
        <Card className="p-6 sm:p-9">
          <ContentHtml html={page.content} />
        </Card>

        <aside>
          <div className="sticky top-24 space-y-4">
            <Card className="p-5">
              <h2 className="font-tomorrow text-sm font-bold uppercase tracking-wide text-ink">Informasi lain</h2>
              <nav className="mt-3 space-y-1">
                {infoLinks.map((item) => (
                  <Link
                    key={item.slug}
                    to={item.slug === 'faq' ? '/faq' : `/${item.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      item.slug === slug ? 'bg-biru-0/10 font-semibold text-biru-0' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
            <div className="rounded-xl border border-biru-0/20 bg-biru-0/5 p-5 text-xs text-ink/60">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-biru-0" /> Butuh klarifikasi?
              </p>
              <p className="mt-2 leading-relaxed">
                Tim kami siap membantu pertanyaan tentang ketentuan, pembatalan, atau kebutuhan khusus.
              </p>
              <Link to="/contact" className="mt-3 inline-block font-semibold text-biru-0 hover:underline">
                Hubungi tim →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
