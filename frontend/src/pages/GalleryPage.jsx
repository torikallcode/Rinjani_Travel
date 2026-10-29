import { useMemo, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Card } from '../components/ui/primitives';
import Seo from '../components/Seo';

const photos = [
  { src: '/img/mnt4.jpg', alt: 'Puncak Rinjani', category: 'Trekking' },
  { src: '/img/mnt8.jpg', alt: 'Danau Segara Anak', category: 'Trekking' },
  { src: '/img/mnt9.jpg', alt: 'Crater rim Rinjani', category: 'Trekking' },
  { src: '/img/mnt10.jpg', alt: 'Porter di jalur Rinjani', category: 'Trekking' },
  { src: '/img/Trekking1.jpg', alt: 'Pendaki menuju summit', category: 'Trekking' },
  { src: '/img/Trekking2.jpg', alt: 'Camp di Rinjani', category: 'Trekking' },
  { src: '/img/trawangan.jpg', alt: 'Gili Trawangan', category: 'Island' },
  { src: '/img/trawangan2.png', alt: 'Pantai Gili', category: 'Island' },
  { src: '/img/turtle.webp', alt: 'Penyu di Gili', category: 'Island' },
  { src: '/img/pinkbeach.jpg', alt: 'Pink Beach Lombok', category: 'Pantai' },
  { src: '/img/mandalika.webp', alt: 'Sirkuit Mandalika', category: 'Pantai' },
  { src: '/img/DesaSade.jpg', alt: 'Desa Sade', category: 'Budaya' },
  { src: '/img/aboutme.jpg', alt: 'Lanskap Lombok', category: 'Budaya' },
  { src: '/img/homepage2.jpg', alt: 'Perjalanan Lombok', category: 'Budaya' },
  { src: '/img/homepage3.jpg', alt: 'Alam Lombok', category: 'Budaya' },
];

export default function GalleryPage() {
  const [category, setCategory] = useState('Semua');
  const [active, setActive] = useState(null);

  const categories = useMemo(() => ['Semua', ...Array.from(new Set(photos.map((photo) => photo.category)))], []);
  const visible = category === 'Semua' ? photos : photos.filter((photo) => photo.category === category);

  return (
    <div>
      <Seo
        title="Galeri Perjalanan"
        description="Foto trekking Rinjani, danau Segara Anak, Gili, pantai Lombok, dan desa adat Sasak."
        image="/img/mnt8.jpg"
      />
      <section className="bg-hitam-0 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-biru-0">
            <Camera className="h-4 w-4" /> Galeri perjalanan
          </p>
          <h1 className="mt-3 font-tomorrow text-3xl font-bold sm:text-4xl">Lombok melalui lensa kami</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Momen dari puncak Rinjani, danau Segara Anak, pulau Gili, pantai selatan, dan desa adat Sasak.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
              {value}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((photo, index) => (
            <button
              key={photo.src}
              onClick={() => setActive(photo)}
              className={`group relative overflow-hidden rounded-xl bg-hitam-0 text-left shadow-sm ${
                index % 5 === 0 ? 'sm:row-span-2' : ''
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className={`w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90 ${
                  index % 5 === 0 ? 'h-64 sm:h-[432px]' : 'h-64'
                }`}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-hitam-0/80 to-transparent p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-biru-0">{photo.category}</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{photo.alt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-hitam-0/90 p-4" onClick={() => setActive(null)}>
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>
          <figure className="max-h-[90vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={active.src} alt={active.alt} className="max-h-[80vh] w-full rounded-lg object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/70">
              {active.alt} · <span className="text-biru-0">{active.category}</span>
            </figcaption>
          </figure>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <p className="font-tomorrow text-lg font-bold text-ink">Ingin mengalami sendiri?</p>
          <p className="mx-auto mt-1 max-w-xl text-sm text-ink/60">
            Foto terbaik selalu datang dari perjalanan Anda sendiri. Pilih paket yang paling sesuai dan mulai rencanakan.
          </p>
        </Card>
      </div>
    </div>
  );
}
