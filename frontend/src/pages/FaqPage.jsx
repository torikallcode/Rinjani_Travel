import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, MessageSquare, Search } from 'lucide-react';
import api from '../services/api';
import Seo from '../components/Seo';
import { Alert, Button, Card, EmptyState, Input, Spinner } from '../components/ui/primitives';

const categoryLabels = {
  semua: 'Semua',
  pemesanan: 'Pemesanan',
  pembayaran: 'Pembayaran',
  paket: 'Paket & itinerary',
  pembatalan: 'Pembatalan',
  privasi: 'Privasi & data',
};

export default function FaqPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('semua');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/faqs', { auth: false })
      .then((data) => alive && setItems(data?.items || []))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const found = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ['semua', ...found];
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== 'semua' && item.category !== category) return false;
      if (!query) return true;
      return `${item.question} ${item.answer}`.toLowerCase().includes(query);
    });
  }, [items, category, search]);

  return (
    <div>
      <Seo
        title="Pertanyaan Umum"
        description="Jawaban tentang pemesanan, pembayaran, pembatalan, kesiapan fisik, dan kebijakan perjalanan Rinjani Travel."
      />
      <section className="bg-hitam-0 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <HelpCircle className="h-4 w-4" /> Pusat bantuan
          </p>
          <h1 className="mt-3 font-tomorrow text-3xl font-bold sm:text-4xl">Pertanyaan yang sering diajukan</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65">
            Temukan jawaban tentang pemesanan, pembayaran, kesiapan fisik, dan kebijakan perjalanan. Jika belum terjawab, tim kami siap membantu.
          </p>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-lg bg-surface px-3">
            <Search className="h-4 w-4 text-ink/40" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari pertanyaan..."
              className="border-0 bg-transparent px-0 focus:ring-0"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((value) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                category === value
                  ? 'border-biru-0 bg-biru-0 text-white'
                  : 'border-ink/15 bg-surface text-ink/60 hover:border-biru-0/40 hover:text-biru-0'
              }`}
            >
              {categoryLabels[value] || value}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Alert tone="danger" className="mt-6">{error}</Alert>
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="Pertanyaan tidak ditemukan"
            description="Coba kata kunci lain atau pilih kategori yang berbeda."
            action={<Button variant="outline" onClick={() => { setSearch(''); setCategory('semua'); }}>Reset pencarian</Button>}
          />
        ) : (
          <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/10 bg-surface">
            {filtered.map((faq) => (
              <div key={faq.id}>
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink">{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-ink/40 transition ${openId === faq.id ? 'rotate-180 text-biru-0' : ''}`} />
                </button>
                {openId === faq.id && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink/60">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <Card className="mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-biru-0/10 text-biru-0">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-tomorrow text-base font-bold text-ink">Masih ada pertanyaan?</h2>
              <p className="mt-1 text-sm text-ink/60">Kirim pesan ke tim kami, biasanya dibalas dalam 1 hari kerja.</p>
            </div>
          </div>
          <Button as="link" to="/contact">Hubungi kami</Button>
        </Card>

        <p className="mt-6 text-center text-xs text-ink/45">
          Baca juga <Link to="/terms" className="font-semibold text-biru-0 hover:underline">syarat & ketentuan</Link> dan <Link to="/cancellation" className="font-semibold text-biru-0 hover:underline">kebijakan pembatalan</Link>.
        </p>
      </div>
    </div>
  );
}
