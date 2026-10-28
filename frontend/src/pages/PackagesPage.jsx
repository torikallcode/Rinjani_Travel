import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api, { buildQuery } from '../services/api';
import PackageCard from '../components/PackageCard';
import Seo from '../components/Seo';
import { Button, EmptyState, Field, Input, Pagination, Select, Spinner } from '../components/ui/primitives';

const PAGE_SIZE = 9;

const sortOptions = [
  { value: 'featured', label: 'Direkomendasikan' },
  { value: 'price_asc', label: 'Harga terendah' },
  { value: 'price_desc', label: 'Harga tertinggi' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'newest', label: 'Terbaru' },
];

export default function PackagesPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(params.get('page') || 1);
  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      category: params.get('category') || '',
      difficulty: params.get('difficulty') || '',
      sort: params.get('sort') || 'featured',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      date: params.get('date') || '',
    }),
    [params],
  );

  const [search, setSearch] = useState(filters.q);

  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(`/packages${buildQuery({ ...filters, page, page_size: PAGE_SIZE })}`, { auth: false })
      .then((data) => {
        if (!alive) return;
        setItems(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [filters, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    setParams({}, { replace: true });
  };

  const activeFilterCount = ['q', 'category', 'difficulty', 'min_price', 'max_price', 'date'].filter((key) => params.get(key)).length;

  const filterFields = (
    <div className="space-y-4">
      <Field label="Kategori">
        <Select value={filters.category} onChange={(event) => updateParam('category', event.target.value)}>
          <option value="">Semua kategori</option>
          <option value="trekking">Trekking Rinjani</option>
          <option value="tour">Day Tour & Island</option>
        </Select>
      </Field>
      <Field label="Tingkat kesulitan">
        <Select value={filters.difficulty} onChange={(event) => updateParam('difficulty', event.target.value)}>
          <option value="">Semua tingkat</option>
          <option value="easy">Mudah</option>
          <option value="moderate">Sedang</option>
          <option value="challenging">Menantang</option>
          <option value="hard">Sulit</option>
        </Select>
      </Field>
      <Field label="Tanggal keberangkatan">
        <Input type="date" value={filters.date} onChange={(event) => updateParam('date', event.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga min (Rp)">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={filters.min_price}
            onChange={(event) => updateParam('min_price', event.target.value)}
          />
        </Field>
        <Field label="Harga max (Rp)">
          <Input
            type="number"
            min="0"
            placeholder="5000000"
            value={filters.max_price}
            onChange={(event) => updateParam('max_price', event.target.value)}
          />
        </Field>
      </div>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4" /> Reset filter
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Paket Wisata Lombok"
        description="Bandingkan paket trekking Rinjani dan tur Lombok berdasarkan kategori, tingkat kesulitan, harga, dan tanggal keberangkatan."
      />
      <div className="rounded-2xl bg-hitam-0 px-6 py-10 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-biru-0">Katalog perjalanan</p>
        <h1 className="mt-2 font-tomorrow text-3xl font-bold sm:text-4xl">Temukan paket Lombok yang tepat</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/65">
          Bandingkan trekking Rinjani dan tur harian. Semua harga ditampilkan per orang dan diverifikasi oleh sistem saat checkout.
        </p>
        <form
          className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            updateParam('q', search);
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3">
            <Search className="h-4 w-4 text-hitam-0/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari paket, lokasi, atau kata kunci..."
              className="h-11 w-full bg-transparent text-sm text-hitam-0 outline-none placeholder:text-hitam-0/40"
            />
          </div>
          <Button type="submit" size="lg">Cari</Button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-hitam-0/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-tomorrow text-base font-bold">Filter</h2>
              <SlidersHorizontal className="h-4 w-4 text-hitam-0/40" />
            </div>
            {filterFields}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-hitam-0/60">
              Menampilkan <span className="font-semibold text-hitam-0">{items.length}</span> dari {total} paket
              {filters.q && <> untuk “<span className="font-semibold text-hitam-0">{filters.q}</span>”</>}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              <Select
                value={filters.sort}
                onChange={(event) => updateParam('sort', event.target.value)}
                className="w-48 py-2 text-xs"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState title="Gagal memuat paket" description={error} action={<Button onClick={() => window.location.reload()}>Coba lagi</Button>} />
          ) : items.length === 0 ? (
            <EmptyState
              title="Paket tidak ditemukan"
              description="Coba ubah kata kunci atau hapus beberapa filter untuk melihat lebih banyak pilihan."
              action={<Button variant="outline" onClick={clearFilters}>Reset filter</Button>}
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={(next) => updateParam('page', String(next))} />
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-hitam-0/50 lg:hidden">
          <div className="h-full w-full max-w-sm overflow-y-auto bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-tomorrow text-lg font-bold">Filter paket</h2>
              <button onClick={() => setShowFilters(false)} className="rounded p-1 text-hitam-0/50 hover:bg-hitam-0/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterFields}
            <Button className="mt-6 w-full" onClick={() => setShowFilters(false)}>Terapkan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
