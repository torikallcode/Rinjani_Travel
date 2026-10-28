import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, HeartHandshake, Leaf, Mountain, ShieldCheck, Users } from 'lucide-react';
import api from '../services/api';
import ContentHtml from '../components/ContentHtml';
import Seo from '../components/Seo';
import { Button, Card, Spinner } from '../components/ui/primitives';

const values = [
  { icon: ShieldCheck, title: 'Keselamatan lebih dulu', text: 'Briefing, perlengkapan standar, dan protokol evakuasi di setiap perjalanan.' },
  { icon: BadgeCheck, title: 'Tim lokal bersertifikat', text: 'Guide dan porter yang tumbuh besar di lereng Rinjani dan memahami medannya.' },
  { icon: Leaf, title: 'Bertanggung jawab', text: 'Rombongan kecil, pengelolaan sampah, dan dukungan bagi komunitas desa.' },
  { icon: HeartHandshake, title: 'Harga transparan', text: 'Rincian biaya jelas, tanpa biaya tersembunyi, dihitung ulang oleh server saat checkout.' },
];

const stats = [
  { value: '2016', label: 'Mulai beroperasi' },
  { value: '1.200+', label: 'Pelanggan' },
  { value: '4.8/5', label: 'Rating perjalanan' },
  { value: '100%', label: 'Guide lokal' },
];

export default function AboutPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/content/about', { auth: false })
      .then((data) => alive && setPage(data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <Seo
        title="Tentang Kami"
        description="Kenali Rinjani Travel: operator lokal Lombok dengan guide bersertifikat, itinerary transparan, dan komitmen pariwisata bertanggung jawab."
        image="/img/mnt10.jpg"
      />
      <section className="relative overflow-hidden bg-hitam-0">
        <img src="/img/mnt10.jpg" alt="Tim Rinjani Travel" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-hitam-0 via-hitam-0/80 to-hitam-0/30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <Mountain className="h-4 w-4" /> Tentang Rinjani Travel
          </p>
          <h1 className="mt-4 max-w-3xl font-tomorrow text-4xl font-bold leading-tight text-white sm:text-5xl">
            Operator lokal, untuk perjalanan yang lebih bermakna.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            Kami tinggal dan bekerja di Lombok. Setiap itinerary dirancang bersama guide dan warga desa agar perjalanan Anda aman, jujur, dan memberi manfaat bagi komunitas sekitar Rinjani.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as="link" to="/packages" size="lg">
              Lihat paket <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as="link" to="/contact" variant="light" size="lg">
              Kenalan dengan tim
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-hitam-0/10 bg-white p-5 shadow-lg md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-tomorrow text-2xl font-bold text-hitam-0 md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-hitam-0/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <Card className="p-6 sm:p-9">
            <h2 className="font-tomorrow text-2xl font-bold text-hitam-0">Cerita kami</h2>
            {loading ? <Spinner label="Memuat cerita..." /> : page ? <ContentHtml html={page.content} className="mt-4" /> : (
              <p className="mt-4 text-sm leading-relaxed text-hitam-0/60">
                Rinjani Travel adalah operator perjalanan lokal di Lombok yang fokus pada trekking Gunung Rinjani dan wisata alam. Kami bekerja bersama guide, porter, dan driver berpengalaman untuk menghadirkan perjalanan yang aman dan transparan.
              </p>
            )}
          </Card>
          <div className="space-y-4">
            <img src="/img/Trekking1.jpg" alt="Pendaki di Rinjani" className="h-64 w-full rounded-xl object-cover shadow-lg" />
            <div className="grid grid-cols-2 gap-4">
              <img src="/img/DesaSade.jpg" alt="Desa Sade" className="h-40 w-full rounded-xl object-cover shadow" />
              <img src="/img/trawangan.jpg" alt="Gili Trawangan" className="h-40 w-full rounded-xl object-cover shadow" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Nilai yang kami pegang</p>
            <h2 className="mt-2 font-tomorrow text-3xl font-bold text-hitam-0">Bukan sekadar menjual paket</h2>
            <p className="mt-3 text-sm leading-relaxed text-hitam-0/60">
              Kami percaya perjalanan yang baik dimulai dari kejujuran informasi dan diakhiri dengan kenangan yang aman untuk semua orang.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-biru-0/10 text-biru-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-tomorrow text-base font-bold text-hitam-0">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-hitam-0/60">{value.text}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-biru-0 px-6 py-12 text-white sm:px-12">
          <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <Users className="h-7 w-7 text-white/80" />
              <h2 className="mt-3 font-tomorrow text-2xl font-bold sm:text-3xl">Mari rencanakan perjalanan Anda</h2>
              <p className="mt-2 text-sm text-white/80">
                Ceritakan tanggal, jumlah peserta, dan kebutuhan khusus. Tim kami akan membantu menyusun rencana yang sesuai.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="link" to="/packages" variant="dark" size="lg">Pilih paket</Button>
              <Button as="link" to="/contact" variant="light" size="lg">Hubungi kami</Button>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-hitam-0/45">
          Ingin membaca ketentuan perjalanan? <Link to="/terms" className="font-semibold text-biru-0 hover:underline">Syarat & ketentuan</Link> · <Link to="/safety" className="font-semibold text-biru-0 hover:underline">Keselamatan</Link>
        </p>
      </section>
    </div>
  );
}
