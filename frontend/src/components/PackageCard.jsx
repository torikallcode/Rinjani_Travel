import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { formatCurrency, packageImage } from '../lib/format';
import { Stars } from './ui/primitives';

const difficultyLabel = {
  easy: 'Mudah',
  moderate: 'Sedang',
  challenging: 'Menantang',
  hard: 'Sulit',
};

const categoryLabel = {
  trekking: 'Trekking',
  tour: 'Tour',
};

export default function PackageCard({ pkg }) {
  return (
    <Link
      to={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-hitam-0/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden bg-hitam-0/10">
        <img
          src={packageImage(pkg)}
          alt={pkg.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hitam-0/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-hitam-0">
          {categoryLabel[pkg.category] || pkg.category}
        </span>
        {pkg.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-biru-0 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Populer
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" /> {pkg.departure_point}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-semibold backdrop-blur">
            {pkg.days || pkg.duration} hari
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-hitam-0/55">
          <Stars rating={pkg.rating} />
          <span className="font-semibold text-hitam-0">{Number(pkg.rating || 0).toFixed(1)}</span>
          <span>({pkg.review_count || 0} ulasan)</span>
        </div>
        <h3 className="font-tomorrow text-lg font-bold leading-snug text-hitam-0 group-hover:text-biru-0">
          {pkg.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-hitam-0/60">{pkg.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-hitam-0/10 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-hitam-0/45">Mulai dari</p>
            <p className="font-tomorrow text-lg font-bold text-hitam-0">{formatCurrency(pkg.base_price)}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-biru-0">
            Detail <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-hitam-0/50">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {difficultyLabel[pkg.difficulty] || pkg.difficulty}</span>
          <span>•</span>
          <span>Guide lokal</span>
          <span>•</span>
          <span>Harga transparan</span>
        </div>
      </div>
    </Link>
  );
}
