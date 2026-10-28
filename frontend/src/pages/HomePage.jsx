import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Leaf,
  Search,
  ShieldCheck,
} from 'lucide-react';
import api, { buildQuery } from '../services/api';
import PackageCard from '../components/PackageCard';
import Seo from '../components/Seo';
import { Button, Stars, Spinner } from '../components/ui/primitives';

const categories = [
  {
    title: 'Trekking Rinjani',
    description: 'Summit 3.726 m, crater rim, dan Danau Segara Anak.',
    image: '/img/mnt8.jpg',
    href: '/packages?category=trekking',
  },
  {
    title: 'Island Hopping',
    description: 'Gili Trawangan, Meno, Air, dan spot snorkeling penyu.',
    image: '/img/trawangan.jpg',
    href: '/packages?category=tour&q=gili',
  },
  {
    title: 'Budaya & Alam',
    description: 'Air terjun, Desa Sade, dan pantai tersembunyi Lombok.',
    image: '/img/DesaSade.jpg',
    href: '/packages?category=tour',
  },
];

const reasons = [
  { icon: BadgeCheck, title: 'Guide bersertifikat', text: 'Tim guide dan porter lokal yang memahami medan serta cuaca Rinjani.' },
  { icon: ShieldCheck, title: 'Keselamatan utama', text: 'Briefing, perlengkapan standar, dan protokol evakuasi di setiap perjalanan.' },
  { icon: Leaf, title: 'Pariwisata bertanggung jawab', text: 'Rombongan dibatasi dan sampah dikelola bersama komunitas lokal.' },
  { icon: CalendarDays, title: 'Jadwal fleksibel', text: 'Pilih tanggal yang tersedia dan pantau sisa kuota secara langsung.' },
];

const trustItems = ['Guide bersertifikat', 'Harga transparan', 'Kuota real-time', 'Operator lokal'];

export default function HomePage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get(`/packages${buildQuery({ page_size: 6 })}`, { auth: false }),
      api.get('/reviews?page_size=6', { auth: false }),
      api.get('/settings/public', { auth: false }),
    ])
      .then(([pkgData, reviewData, settingsData]) => {
        if (!alive) return;
        setPackages(pkgData?.items || []);
        setTotal(pkgData?.total || 0);
        setReviews(reviewData?.items || []);
        setSettings(settingsData || {});
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/packages${buildQuery({ q: search.trim() })}`);
  };

  return (
    <div>
      <Seo
        title="Trekking Rinjani & Wisata Lombok"
        description="Jelajahi Rinjani, Gili, dan budaya Lombok bersama operator lokal. Harga transparan, guide bersertifikat, dan jadwal keberangkatan real-time."
      />

      <section className="bg-[#f7f7f5]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">
              <span className="h-1.5 w-1.5 rounded-full bg-biru-0" />
              Operator lokal Lombok
            </p>
            <h1 className="mt-5 font-tomorrow text-5xl font-bold leading-[1.05] tracking-tight text-hitam-0 sm:text-6xl lg:text-[4.25rem]">
              Rinjani,
              <br />
              <span className="text-biru-0">lebih dekat.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-hitam-0/60 sm:text-lg">
              Trekking, island hopping, dan tur budaya dengan harga transparan. Dipandu guide lokal bersertifikat, jadwal bisa langsung dipesan.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-hitam-0/10 bg-white p-1.5 shadow-sm"
            >
              <Search className="ml-2 h-4 w-4 shrink-0 text-hitam-0/35" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari paket atau destinasi"
                aria-label="Cari paket atau destinasi"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-hitam-0 outline-none placeholder:text-hitam-0/40"
              />
              <Button type="submit" className="shrink-0">Cari</Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-hitam-0/55">
              <Link to="/packages" className="inline-flex items-center gap-1.5 font-semibold text-hitam-0 transition hover:text-biru-0">
                Lihat semua paket <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="hidden h-1 w-1 rounded-full bg-hitam-0/20 sm:block" />
              <Link to="/contact" className="transition hover:text-biru-0">Butuh bantuan merencanakan?</Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-hitam-0/10 pt-6 sm:gap-6">
              <div>
                <dt className="text-xs text-hitam-0/45">Paket terkurasi</dt>
                <dd className="mt-1 font-tomorrow text-xl font-bold text-hitam-0 sm:text-2xl">{total || 7}</dd>
              </div>
              <div>
                <dt className="text-xs text-hitam-0/45">Rating perjalanan</dt>
                <dd className="mt-1 font-tomorrow text-xl font-bold text-hitam-0 sm:text-2xl">4.8/5</dd>
              </div>
              <div>
                <dt className="text-xs text-hitam-0/45">Guide lokal</dt>
                <dd className="mt-1 font-tomorrow text-xl font-bold text-hitam-0 sm:text-2xl">100%</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/mnt10.jpg"
                alt="Pegunungan Rinjani saat matahari terbit"
                className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-xl border border-white/50 bg-white/95 p-4 shadow-sm backdrop-blur sm:inset-x-auto sm:left-5 sm:max-w-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-hitam-0/45">Rating pelancong</p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={4.8} />
                  <span className="text-sm font-bold text-hitam-0">4.8/5</span>
                </div>
              </div>
              <div className="border-l border-hitam-0/10 pl-4 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-hitam-0/45">Guide</p>
                <p className="mt-1 text-sm font-bold text-hitam-0">100% lokal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-hitam-0/10 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-xs font-medium text-hitam-0/55 sm:px-6 lg:px-8">
          {trustItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-biru-0" /> {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">Pilihan perjalanan</p>
            <h2 className="mt-2 font-tomorrow text-3xl font-bold tracking-tight text-hitam-0 sm:text-4xl">Paket yang paling dicari</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hitam-0/55">
              Dari day trip santai hingga ekspedisi 5 hari. Harga sudah termasuk guide, perlengkapan, dan tiket sesuai itinerary.
            </p>
          </div>
          <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-hitam-0 transition hover:text-biru-0">
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 6).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-hitam-0/10 bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">Jelajahi</p>
              <h2 className="mt-2 font-tomorrow text-3xl font-bold tracking-tight text-hitam-0 sm:text-4xl">Pilih gaya perjalananmu</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-hitam-0/55">
              Tiga cara berbeda menikmati Lombok, semuanya dengan pendampingan tim lokal.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="group flex items-center gap-4 rounded-xl border border-hitam-0/10 p-3 transition hover:border-biru-0/40 hover:bg-[#fafaf8]"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <h3 className="font-tomorrow text-base font-bold text-hitam-0">{category.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-hitam-0/55">{category.description}</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-hitam-0/30 transition group-hover:text-biru-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="order-2 lg:order-1">
          <img
            src="/img/mnt4.jpg"
            alt="Pendaki menikmati matahari terbit di pegunungan"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">Kenapa Rinjani Travel</p>
          <h2 className="mt-2 font-tomorrow text-3xl font-bold tracking-tight text-hitam-0 sm:text-4xl">Direncanakan dengan hati-hati.</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-hitam-0/60">
            Kami bukan sekadar penjual paket. Tim kami tinggal dan bekerja di Lombok, mengenal jalur, musim, dan komunitas di sekitar Rinjani.
          </p>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div key={reason.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-biru-0/10 text-biru-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-hitam-0">{reason.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-hitam-0/55">{reason.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="border-y border-hitam-0/10 bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">Cerita pelanggan</p>
                <h2 className="mt-2 font-tomorrow text-3xl font-bold tracking-tight text-hitam-0 sm:text-4xl">Mereka sudah kembali dengan cerita.</h2>
              </div>
              <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-hitam-0 transition hover:text-biru-0">
                Rencanakan perjalanan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <figure key={review.id} className="rounded-xl border border-hitam-0/10 bg-[#fafaf8] p-6">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-4 text-sm leading-relaxed text-hitam-0/70">
                    “{review.content}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-hitam-0/10 pt-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-biru-0/10 text-xs font-bold text-biru-0">
                      {(review.user_name || 'R').slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-hitam-0">{review.user_name}</p>
                      <p className="mt-0.5 text-[11px] text-hitam-0/45">Pelanggan terverifikasi</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-2xl border border-hitam-0/10 bg-white px-6 py-12 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-biru-0">Mulai dari sini</p>
          <h2 className="mt-3 font-tomorrow text-3xl font-bold tracking-tight text-hitam-0 sm:text-4xl">Siap merencanakan perjalanan?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-hitam-0/55">
            Tim lokal kami siap membantu memilih paket, tanggal, dan kebutuhan khusus rombongan. Konsultasi awal gratis.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button as="link" to="/packages" size="lg">
              Pilih paket <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as="link" to="/contact" variant="outline" size="lg">
              Hubungi tim
            </Button>
          </div>
          <p className="mt-5 text-xs text-hitam-0/45">
            WhatsApp {settings.whatsapp || '6281234567890'} · {settings.business_email || 'hello@rinjanitravel.com'}
          </p>
        </div>
      </section>
    </div>
  );
}
