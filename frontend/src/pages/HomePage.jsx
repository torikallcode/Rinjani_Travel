import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, ShieldCheck, MapPin, Search, Users, Leaf, BadgeCheck, Mountain } from 'lucide-react';
import api, { buildQuery } from '../services/api';
import PackageCard from '../components/PackageCard';
import Seo from '../components/Seo';
import { Button, Stars, Spinner } from '../components/ui/primitives';

const categories = [
  {
    title: 'Trekking Rinjani',
    description: 'Summit 3.726 m, crater rim, dan danau Segara Anak.',
    image: '/img/mnt8.jpg',
    href: '/packages?category=trekking',
  },
  {
    title: 'Island Hopping',
    description: 'Gili Trawangan, Meno, Air, dan snorkeling spot penyu.',
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
  { icon: BadgeCheck, title: 'Guide bersertifikat', text: 'Tim guide dan porter lokal berpengalaman, memahami medan dan cuaca Rinjani.' },
  { icon: ShieldCheck, title: 'Keselamatan utama', text: 'Briefing, perlengkapan standar, dan protokol evakuasi di setiap perjalanan.' },
  { icon: Leaf, title: 'Pariwisata bertanggung jawab', text: 'Kami membatasi rombongan dan mengelola sampah bersama komunitas lokal.' },
  { icon: CalendarDays, title: 'Jadwal fleksibel', text: 'Pilih tanggal keberangkatan yang tersedia dan pantau sisa kuota secara real-time.' },
];

export default function HomePage() {
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get(`/packages${buildQuery({ featured: 'true', page_size: 6 })}`, { auth: false }),
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

  return (
    <div>
      <Seo
        title="Trekking Rinjani & Wisata Lombok"
        description="Jelajahi Rinjani, Gili, dan budaya Lombok bersama operator lokal. Harga transparan, guide bersertifikat, dan jadwal keberangkatan real-time."
      />
      <section className="relative min-h-[640px] overflow-hidden bg-hitam-0">
        <img src="/img/mnt4.jpg" alt="Pegunungan Rinjani" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-hitam-0/90 via-hitam-0/55 to-transparent" />
        <div className="relative mx-auto flex min-h-[640px] w-full max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
              <Mountain className="h-3.5 w-3.5 text-biru-0" /> Lombok, Nusa Tenggara Barat
            </span>
            <h1 className="mt-5 font-tomorrow text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Rasakan Rinjani.<br />
              <span className="text-biru-0">Bawa pulang cerita.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Trekking summit, crater rim, island hopping, dan tur budaya Lombok. Direncanakan oleh operator lokal, dipandu guide bersertifikat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="link" to="/packages" size="lg" className="shadow-lg shadow-biru-0/25">
                Jelajahi Paket <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="link" to="/contact" variant="light" size="lg">
                Konsultasi Perjalanan
              </Button>
            </div>
          </div>

          <div className="mt-14 max-w-3xl rounded-xl border border-white/15 bg-white/95 p-3 shadow-2xl backdrop-blur">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                window.location.href = `/packages${buildQuery({ q: search })}`;
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#f4f5f7] px-3">
                <Search className="h-4 w-4 text-hitam-0/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari paket: Rinjani, Gili, waterfall..."
                  className="h-11 w-full bg-transparent text-sm text-hitam-0 outline-none placeholder:text-hitam-0/40"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#f4f5f7] px-3 text-sm text-hitam-0/60 sm:w-52">
                <MapPin className="h-4 w-4 text-hitam-0/40" /> Lombok
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                Cari Paket
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-hitam-0/10 bg-white p-5 shadow-lg md:grid-cols-4">
          {[
            { value: `${total || 7}+`, label: 'Paket terkurasi' },
            { value: '1.200+', label: 'Pelanggan puas' },
            { value: '4.8/5', label: 'Rating perjalanan' },
            { value: '100%', label: 'Guide lokal' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-tomorrow text-2xl font-bold text-hitam-0 md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-hitam-0/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Pilihan perjalanan</p>
            <h2 className="mt-2 font-tomorrow text-3xl font-bold text-hitam-0">Paket paling dicari</h2>
            <p className="mt-2 max-w-xl text-sm text-hitam-0/60">
              Mulai dari day trip santai hingga ekspedisi 5 hari. Semua harga sudah termasuk guide, perlengkapan, dan tiket sesuai itinerary.
            </p>
          </div>
          <Button as="link" to="/packages" variant="outline">
            Lihat semua paket <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 6).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Kategori</p>
              <h2 className="mt-2 font-tomorrow text-3xl font-bold text-hitam-0">Pilih gaya perjalananmu</h2>
            </div>
            <p className="max-w-md text-sm text-hitam-0/60">Tiga cara berbeda menikmati Lombok, semuanya dengan pendampingan tim lokal.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="group relative min-h-[280px] overflow-hidden rounded-xl bg-hitam-0"
              >
                <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-hitam-0 via-hitam-0/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <Compass className="mb-3 h-6 w-6 text-biru-0" />
                  <h3 className="font-tomorrow text-xl font-bold text-white">{category.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{category.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-biru-0">
                    Jelajahi <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Kenapa Rinjani Travel</p>
            <h2 className="mt-2 font-tomorrow text-3xl font-bold text-hitam-0">Perjalanan yang direncanakan dengan hati-hati</h2>
            <p className="mt-3 text-sm leading-relaxed text-hitam-0/60">
              Kami bukan sekadar penjual paket. Tim kami tinggal dan bekerja di Lombok, mengenal jalur, musim, dan komunitas di sekitar Rinjani.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-biru-0/10 text-biru-0">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-hitam-0">{reason.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-hitam-0/55">{reason.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <img src="/img/mnt10.jpg" alt="Porter dan pendaki Rinjani" className="h-[420px] w-full rounded-xl object-cover shadow-xl" />
            <div className="absolute -bottom-5 -left-4 max-w-[240px] rounded-xl bg-white p-4 shadow-xl sm:-left-8">
              <div className="flex items-center gap-2">
                <Stars rating={5} />
                <span className="text-xs font-bold text-hitam-0">4.9</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-hitam-0/60">
                “Guide-nya sabar, makanan enak, dan semua perlengkapan siap. Pengalaman pertama mendaki yang tidak terlupakan.”
              </p>
              <p className="mt-2 text-[11px] font-semibold text-hitam-0">— Rina, Jakarta</p>
            </div>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="bg-hitam-0 py-20 text-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Cerita pelanggan</p>
                <h2 className="mt-2 font-tomorrow text-3xl font-bold">Mereka sudah kembali dengan cerita</h2>
              </div>
              <Link to="/packages" className="text-sm font-semibold text-biru-0 hover:underline">Rencanakan perjalananmu →</Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <Stars rating={review.rating} />
                  <h3 className="mt-3 font-tomorrow text-base font-bold">{review.title || 'Pengalaman menyenangkan'}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/65">{review.content}</p>
                  <p className="mt-4 text-xs font-semibold text-biru-0">{review.user_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-biru-0 px-6 py-14 text-center text-white sm:px-12">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-hitam-0/10" />
          <div className="relative mx-auto max-w-2xl">
            <Users className="mx-auto h-8 w-8 text-white/80" />
            <h2 className="mt-4 font-tomorrow text-3xl font-bold">Siap merencanakan perjalanan ke Lombok?</h2>
            <p className="mt-3 text-sm text-white/80">
              Tim kami siap membantu memilih paket, tanggal, dan kebutuhan khusus rombongan Anda. Konsultasi awal gratis.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button as="link" to="/packages" variant="dark" size="lg">
                Pilih Paket
              </Button>
              <Button as="link" to="/contact" variant="light" size="lg">
                Hubungi Tim
              </Button>
            </div>
            <p className="mt-5 text-xs text-white/60">
              WhatsApp {settings.whatsapp || '6281234567890'} · {settings.business_email || 'hello@rinjanitravel.com'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
