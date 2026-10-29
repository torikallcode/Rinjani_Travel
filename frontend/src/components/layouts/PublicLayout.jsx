import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, UserRound, LogOut, LayoutDashboard, Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import api from '../../services/api';

const navLinks = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/packages', label: 'Paket Wisata' },
  { to: '/gallery', label: 'Galeri' },
  { to: '/about', label: 'Tentang' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Kontak' },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function Logo({ light = true }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-biru-0 font-tomorrow text-sm font-bold text-biru-0 transition group-hover:bg-biru-0 group-hover:text-white">
        RT
      </span>
      <span className={`font-tomorrow text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        RINJANI<span className="text-biru-0">.</span>
      </span>
    </Link>
  );
}

export default function PublicLayout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.get('/settings/public', { auth: false }).then(setSettings).catch(() => {});
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-biru-0' : 'text-white/80 hover:text-white'}`;

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-secondary text-ink">
      <ScrollToTop />
      {/* Skip to content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-biru-0 focus:text-white focus:rounded-md focus:font-semibold"
      >
        Lompat ke konten utama
      </a>
      <header className="sticky top-0 z-50 bg-hitam-0/95 shadow-lg backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-biru-0 text-xs font-bold text-white">
                      {user.name?.slice(0, 1).toUpperCase()}
                    </span>
                    {user.name?.split(' ')[0]}
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    title="Keluar"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">
                    Masuk
                  </Link>
                  <Link to="/register" className="rounded-lg bg-biru-0 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#009aa1]">
                    Daftar
                  </Link>
                </>
              )}
            </div>
            <button
              onClick={() => setOpen((value) => !value)}
              className="rounded-lg p-2 text-white lg:hidden"
              aria-label="Buka menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/10 bg-hitam-0 px-4 pb-5 pt-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-biru-0/15 text-biru-0' : 'text-white/80 hover:bg-white/5'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/5">
                    <UserRound className="h-4 w-4" /> Akun Saya
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/5">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                    </Link>
                  )}
                  <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-white/5">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="rounded-lg border border-white/20 px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Masuk
                  </Link>
                  <Link to="/register" className="rounded-lg bg-biru-0 px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="bg-hitam-0 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Operator perjalanan lokal Lombok untuk trekking Rinjani, island hopping, dan tur budaya dengan guide bersertifikat.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-biru-0/15 px-3 py-1 text-xs font-semibold text-biru-0">
              Trip terencana, harga transparan
            </p>
          </div>
          <div>
            <h4 className="font-tomorrow text-sm font-bold uppercase tracking-wider text-white/90">Jelajahi</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/packages" className="hover:text-biru-0">Semua Paket</Link></li>
              <li><Link to="/packages?category=trekking" className="hover:text-biru-0">Trekking Rinjani</Link></li>
              <li><Link to="/packages?category=tour" className="hover:text-biru-0">Day Tour Lombok</Link></li>
              <li><Link to="/gallery" className="hover:text-biru-0">Galeri Perjalanan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-tomorrow text-sm font-bold uppercase tracking-wider text-white/90">Informasi</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/about" className="hover:text-biru-0">Tentang Kami</Link></li>
              <li><Link to="/faq" className="hover:text-biru-0">Pertanyaan Umum</Link></li>
              <li><Link to="/terms" className="hover:text-biru-0">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-biru-0">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-tomorrow text-sm font-bold uppercase tracking-wider text-white/90">Hubungi Kami</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-biru-0" />
                {settings.business_address || 'Jl. Raya Sembalun, Lombok Timur, NTB'}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-biru-0" />
                {settings.business_phone || '+62 812-3456-7890'}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-biru-0" />
                {settings.business_email || 'hello@rinjanitravel.com'}
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="h-4 w-4 shrink-0 text-biru-0" />
                {settings.instagram || '@rinjanitravel'}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} {settings.business_name || 'Rinjani Travel'}. Seluruh hak cipta dilindungi.</p>
            <p>Dibuat untuk petualangan yang bertanggung jawab di Lombok.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
