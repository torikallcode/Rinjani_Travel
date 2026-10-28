import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-[#f7f7f5] font-secondary lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-hitam-0 lg:block">
        <img src="/img/mnt9.jpg" alt="Rinjani" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-hitam-0 via-hitam-0/40 to-hitam-0/20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-biru-0 font-tomorrow text-sm font-bold text-biru-0">RT</span>
            <span className="font-tomorrow text-2xl font-bold">RINJANI<span className="text-biru-0">.</span></span>
          </Link>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-biru-0" /> Lombok, Indonesia
            </p>
            <h1 className="mt-4 max-w-md font-tomorrow text-4xl font-bold leading-tight">
              Perjalanan besar dimulai dari satu langkah kecil.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/65">
              Masuk untuk mengelola pesanan, melihat voucher, dan menulis cerita perjalanan Anda.
            </p>
            <div className="mt-8 grid max-w-sm gap-3 text-xs text-white/70">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-biru-0" /> Pembayaran diverifikasi otomatis</p>
              <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-biru-0" /> Kuota ditahan selama proses checkout</p>
            </div>
          </div>
          <p className="text-xs text-white/35">© {new Date().getFullYear()} Rinjani Travel</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-biru-0 font-tomorrow text-sm font-bold text-biru-0">RT</span>
            <span className="font-tomorrow text-xl font-bold text-hitam-0">RINJANI<span className="text-biru-0">.</span></span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
