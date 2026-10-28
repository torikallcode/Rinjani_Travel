import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react';
import api from '../services/api';
import Seo from '../components/Seo';
import DepartureCalendar from '../components/DepartureCalendar';
import { Badge, Button, Card, EmptyState, Select, Spinner, Stars } from '../components/ui/primitives';
import { formatCurrency, formatDate, formatDateLong, packageImage } from '../lib/format';

const difficultyLabel = { easy: 'Mudah', moderate: 'Sedang', challenging: 'Menantang', hard: 'Sulit' };
const categoryLabel = { trekking: 'Trekking', tour: 'Tour' };

export default function PackageDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [departureId, setDepartureId] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(`/packages/${slug}`, { auth: false })
      .then((data) => {
        if (!alive) return;
        setPkg(data);
        const images = data?.gallery?.length ? data.gallery : [data?.image].filter(Boolean);
        setActiveImage(images[0] || '');
        const available = (data?.departures || []).filter((dep) => dep.status === 'open' && dep.seats_left > 0);
        if (available[0]) setDepartureId(String(available[0].id));
        return api.get(`/reviews?package_id=${data.id}&page_size=6`, { auth: false });
      })
      .then((reviewData) => {
        if (alive && reviewData) setReviews(reviewData.items || []);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  const departures = useMemo(
    () => (pkg?.departures || []).filter((dep) => dep.status === 'open' && dep.seats_left > 0),
    [pkg],
  );

  const selectedDeparture = departures.find((dep) => String(dep.id) === String(departureId));
  const maxTravelers = Math.min(selectedDeparture?.seats_left || 10, 30);
  const pricePerPerson = selectedDeparture?.price || pkg?.base_price || 0;
  const estimate = pricePerPerson * travelers;

  useEffect(() => {
    if (travelers > maxTravelers) setTravelers(maxTravelers);
  }, [maxTravelers, travelers]);

  if (loading) return <Spinner label="Memuat detail paket..." />;
  if (error || !pkg) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          title="Paket tidak ditemukan"
          description={error || 'Paket yang Anda cari mungkin sudah tidak tersedia.'}
          action={<Button as="link" to="/packages">Kembali ke katalog</Button>}
        />
      </div>
    );
  }

  const gallery = pkg.gallery?.length ? pkg.gallery : [pkg.image].filter(Boolean);
  const seoImage = activeImage || packageImage(pkg);
  const imageUrl = /^https?:\/\//.test(seoImage) ? seoImage : `${window.location.origin}${seoImage.startsWith('/') ? seoImage : `/${seoImage}`}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.description,
    image: imageUrl,
    touristType: pkg.category === 'trekking' ? 'Trekkers' : 'Leisure travelers',
    itinerary: (pkg.itineraries || []).map((item) => ({
      '@type': 'TouristAttraction',
      name: item.title,
      description: item.description,
    })),
    offers: {
      '@type': 'Offer',
      price: pkg.base_price,
      priceCurrency: pkg.currency || 'IDR',
      availability: departures.length > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: window.location.href,
    },
    ...(pkg.review_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(pkg.rating || 0).toFixed(1),
            reviewCount: pkg.review_count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo title={pkg.title} description={pkg.description} image={seoImage} jsonLd={jsonLd} />
      <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm font-medium text-hitam-0/55 hover:text-biru-0">
        <ArrowLeft className="h-4 w-4" /> Semua paket
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{categoryLabel[pkg.category] || pkg.category}</Badge>
            <Badge tone="neutral">{difficultyLabel[pkg.difficulty] || pkg.difficulty}</Badge>
            {pkg.featured && <Badge tone="warning">Populer</Badge>}
          </div>
          <h1 className="mt-3 font-tomorrow text-3xl font-bold leading-tight text-hitam-0 sm:text-4xl">{pkg.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-hitam-0/60">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-biru-0" /> {pkg.departure_point}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-biru-0" /> {pkg.days || pkg.duration} hari</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-biru-0" /> Maks. 30 peserta</span>
            <span className="inline-flex items-center gap-1.5">
              <Stars rating={pkg.rating} /> {Number(pkg.rating || 0).toFixed(1)} ({pkg.review_count || 0} ulasan)
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl bg-hitam-0/5">
            <img src={activeImage || packageImage(pkg)} alt={pkg.title} className="h-[300px] w-full object-cover sm:h-[440px]" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImage === image ? 'border-biru-0' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Kalender keberangkatan</h2>
                <p className="mt-1 text-sm text-hitam-0/55">Pilih tanggal yang tersedia untuk melihat harga dan memesan.</p>
              </div>
              <span className="text-xs font-semibold text-biru-0">{departures.length} jadwal tersedia</span>
            </div>
            <div className="mt-4 rounded-xl border border-hitam-0/10 bg-white p-4 shadow-sm">
              <DepartureCalendar
                departures={pkg.departures || []}
                selectedId={departureId}
                onSelect={(id) => setDepartureId(String(id))}
              />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Tentang perjalanan ini</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-hitam-0/70">
              {pkg.description_long || pkg.description}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs text-hitam-0/50">Usia peserta</p>
                <p className="mt-1 text-sm font-semibold">{pkg.min_age || 0}–{pkg.max_age || 70} tahun</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs text-hitam-0/50">Titik keberangkatan</p>
                <p className="mt-1 text-sm font-semibold">{pkg.departure_point}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs text-hitam-0/50">Durasi</p>
                <p className="mt-1 text-sm font-semibold">{pkg.days || pkg.duration} hari</p>
              </div>
            </div>
          </section>

          {pkg.itineraries?.length > 0 && (
            <section className="mt-10">
              <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Itinerary</h2>
              <div className="mt-4 space-y-3">
                {pkg.itineraries.map((item) => (
                  <div key={item.id} className="rounded-xl border border-hitam-0/10 bg-white p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biru-0 text-xs font-bold text-white">
                        {item.day_number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-hitam-0">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-hitam-0/60">{item.description}</p>
                        {(item.meals || item.accommodation) && (
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-hitam-0/50">
                            {item.meals && <span>🍽 {item.meals}</span>}
                            {item.accommodation && <span>🏕 {item.accommodation}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900"><Check className="h-4 w-4" /> Termasuk</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
                {(pkg.includes || []).map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-900"><X className="h-4 w-4" /> Tidak termasuk</h3>
              <ul className="mt-3 space-y-2 text-sm text-red-900/80">
                {(pkg.excludes || []).map((item) => <li key={item} className="flex gap-2"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {item}</li>)}
              </ul>
            </div>
          </section>

          {pkg.equipment?.length > 0 && (
            <section className="mt-10">
              <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Perlengkapan yang disarankan</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {pkg.equipment.map((item) => (
                  <span key={item} className="rounded-full border border-hitam-0/10 bg-white px-3 py-1.5 text-xs text-hitam-0/70">{item}</span>
                ))}
              </div>
            </section>
          )}

          {pkg.addons?.length > 0 && (
            <section className="mt-10">
              <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Layanan tambahan</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pkg.addons.filter((addon) => addon.active).map((addon) => (
                  <div key={addon.id} className="flex items-start justify-between gap-3 rounded-xl border border-hitam-0/10 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-hitam-0">{addon.name}</p>
                      <p className="mt-1 text-xs text-hitam-0/55">{addon.description}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-biru-0">{formatCurrency(addon.price)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pkg.requirements && (
            <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="flex items-center gap-2 font-tomorrow text-base font-bold text-amber-900"><ShieldCheck className="h-4 w-4" /> Persyaratan & keselamatan</h2>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">{pkg.requirements}</p>
              {pkg.cancellation_policy && <p className="mt-3 text-xs text-amber-900/60">{pkg.cancellation_policy}</p>}
            </section>
          )}

          {pkg.faqs?.length > 0 && (
            <section className="mt-10">
              <h2 className="font-tomorrow text-xl font-bold text-hitam-0">Pertanyaan tentang paket ini</h2>
              <div className="mt-4 divide-y divide-hitam-0/10 overflow-hidden rounded-xl border border-hitam-0/10 bg-white">
                {pkg.faqs.map((faq) => (
                  <div key={faq.id}>
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-hitam-0"
                    >
                      {faq.question}
                      <ChevronDown className={`h-4 w-4 shrink-0 transition ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === faq.id && <p className="px-5 pb-4 text-sm leading-relaxed text-hitam-0/60">{faq.answer}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-hitam-0 font-tomorrow">Ulasan pelanggan</h2>
              <div className="flex items-center gap-2 text-sm text-hitam-0/60">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(pkg.rating || 0).toFixed(1)} dari {pkg.review_count || 0} ulasan
              </div>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-hitam-0/15 bg-white p-6 text-sm text-hitam-0/50">
                Belum ada ulasan untuk paket ini. Ulasan hanya dapat ditulis setelah perjalanan selesai.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-5">
                    <Stars rating={review.rating} />
                    <h3 className="mt-2 text-sm font-bold text-hitam-0">{review.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-hitam-0/60">{review.content}</p>
                    <p className="mt-3 text-xs font-semibold text-biru-0">{review.user_name} · {formatDate(review.created_at)}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <div className="sticky top-24 rounded-xl border border-hitam-0/10 bg-white p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-hitam-0/45">Harga mulai</p>
            <p className="mt-1 font-tomorrow text-3xl font-bold text-hitam-0">{formatCurrency(pkg.base_price)}</p>
            <p className="text-xs text-hitam-0/50">per orang · belum termasuk add-on</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-hitam-0/70">Tanggal keberangkatan</span>
                <Select value={departureId} onChange={(event) => setDepartureId(event.target.value)}>
                  {departures.length === 0 && <option value="">Belum ada jadwal tersedia</option>}
                  {departures.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {formatDate(dep.start_date)} · {dep.seats_left} kursi
                    </option>
                  ))}
                </Select>
              </label>

              {selectedDeparture && (
                <div className="rounded-lg bg-[#f4f5f7] p-3 text-xs text-hitam-0/60">
                  <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-biru-0" /> {formatDateLong(selectedDeparture.start_date)}</p>
                  <p className="mt-1">Batas pemesanan: {formatDate(selectedDeparture.booking_cutoff)}</p>
                  <p className="mt-1">Sisa kuota: {selectedDeparture.seats_left} dari {selectedDeparture.capacity}</p>
                </div>
              )}

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-hitam-0/70">Jumlah peserta</span>
                <div className="flex items-center justify-between rounded-lg border border-hitam-0/15 px-2 py-1.5">
                  <button
                    onClick={() => setTravelers((value) => Math.max(1, value - 1))}
                    className="rounded-md p-1.5 text-hitam-0/60 hover:bg-hitam-0/5"
                    aria-label="Kurangi peserta"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">{travelers} orang</span>
                  <button
                    onClick={() => setTravelers((value) => Math.min(maxTravelers, value + 1))}
                    className="rounded-md p-1.5 text-hitam-0/60 hover:bg-hitam-0/5"
                    aria-label="Tambah peserta"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-hitam-0/10 pt-3 text-sm">
                <div className="flex justify-between text-hitam-0/60">
                  <span>{formatCurrency(pricePerPerson)} × {travelers}</span>
                  <span>{formatCurrency(estimate)}</span>
                </div>
                <div className="mt-2 flex justify-between font-bold text-hitam-0">
                  <span>Estimasi total</span>
                  <span>{formatCurrency(estimate)}</span>
                </div>
                <p className="mt-1 text-[11px] text-hitam-0/45">Harga final dihitung server, termasuk promo dan pajak.</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedDeparture}
                onClick={() => navigate(`/checkout/${pkg.slug}?departure=${departureId}&travelers=${travelers}`)}
              >
                Pesan sekarang
              </Button>
              <p className="text-center text-[11px] text-hitam-0/45">Kuota ditahan 30 menit setelah pesanan dibuat.</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-biru-0/20 bg-biru-0/5 p-4 text-xs text-hitam-0/60">
            <p className="font-semibold text-hitam-0">Butuh bantuan?</p>
            <p className="mt-1">Hubungi tim kami untuk rombongan besar atau kebutuhan khusus.</p>
            <Link to="/contact" className="mt-2 inline-block font-semibold text-biru-0 hover:underline">Konsultasi gratis →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
