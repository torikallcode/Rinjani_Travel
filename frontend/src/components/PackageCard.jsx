import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { formatCurrency, packageImage } from '../lib/format';
import { Stars } from './ui/primitives';

const categoryLabel = {
  trekking: 'Trekking',
  tour: 'Tour',
};

export default function PackageCard({ pkg }) {
  return (
    <Link
      to={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-surface transition duration-300 hover:-translate-y-0.5 hover:border-biru-0/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        <img
          src={packageImage(pkg)}
          alt={pkg.title}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
            {categoryLabel[pkg.category] || pkg.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-[11px] text-ink/50">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{pkg.departure_point}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {pkg.days || pkg.duration} hari
          </span>
        </div>

        <h3 className="mt-3 font-tomorrow text-lg font-bold leading-snug text-ink transition group-hover:text-biru-0">
          {pkg.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/55">{pkg.description}</p>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink/55">
          <Stars rating={pkg.rating} />
          <span className="font-semibold text-ink">{Number(pkg.rating || 0).toFixed(1)}</span>
          <span>({pkg.review_count || 0} ulasan)</span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink/45">Mulai dari</p>
            <p className="mt-0.5 font-tomorrow text-lg font-bold text-ink">{formatCurrency(pkg.base_price)}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition group-hover:border-biru-0 group-hover:text-biru-0">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
