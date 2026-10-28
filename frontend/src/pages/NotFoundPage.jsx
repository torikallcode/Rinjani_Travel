import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, PackageSearch } from 'lucide-react';
import { Button } from '../components/ui/primitives';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-biru-0/10 text-biru-0">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-6 font-tomorrow text-6xl font-bold text-hitam-0">404</p>
        <h1 className="mt-2 font-tomorrow text-2xl font-bold text-hitam-0">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-relaxed text-hitam-0/60">
          Sepertinya Anda tersesat di jalur yang tidak ada. Mari kembali ke jalur utama dan temukan perjalanan berikutnya.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button as="link" to="/">
            <Home className="h-4 w-4" /> Beranda
          </Button>
          <Button as="link" to="/packages" variant="outline">
            <PackageSearch className="h-4 w-4" /> Lihat paket
          </Button>
        </div>
        <Link to="/contact" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-biru-0 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Butuh bantuan? Hubungi kami
        </Link>
      </div>
    </div>
  );
}
