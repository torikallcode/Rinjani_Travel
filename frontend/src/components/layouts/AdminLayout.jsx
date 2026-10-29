import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Package,
  CalendarDays,
  Users,
  TicketPercent,
  Star,
  FileText,
  MessageSquare,
  ShieldCheck,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Pesanan', icon: CalendarCheck },
  { to: '/admin/payments', label: 'Pembayaran', icon: CreditCard },
  { to: '/admin/packages', label: 'Paket Wisata', icon: Package },
  { to: '/admin/departures', label: 'Jadwal', icon: CalendarDays },
  { to: '/admin/customers', label: 'Pelanggan', icon: Users },
  { to: '/admin/coupons', label: 'Kode Promo', icon: TicketPercent },
  { to: '/admin/reviews', label: 'Ulasan', icon: Star },
  { to: '/admin/content', label: 'Konten & FAQ', icon: FileText },
  { to: '/admin/messages', label: 'Pesan Masuk', icon: MessageSquare },
  { to: '/admin/staff', label: 'Staf', icon: ShieldCheck, superOnly: true },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings, superOnly: true },
  { to: '/admin/audit-logs', label: 'Audit Log', icon: ScrollText, superOnly: true },
];

const roleLabel = {
  super_admin: 'Super Admin',
  admin_ops: 'Admin Operasional',
  admin_content: 'Admin Konten',
  customer: 'Pelanggan',
};

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const visibleItems = items.filter((item) => !item.superOnly || isSuperAdmin);

  return (
    <div className="min-h-screen bg-canvas font-secondary text-ink">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Tutup menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-hitam-0 text-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" className="font-tomorrow text-lg font-bold">
            RINJANI<span className="text-biru-0">.</span> <span className="text-xs font-normal text-white/40">ADMIN</span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-white/60 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-biru-0 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Lihat situs publik
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/10 bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink/60 hover:bg-ink/5 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/40">Panel Admin</p>
              <p className="text-sm font-semibold text-ink">Rinjani Travel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-ink/50">{roleLabel[user?.role] || user?.role}</p>
            </div>
            <ThemeToggle variant="surface" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-biru-0 text-sm font-bold text-white">
              {user?.name?.slice(0, 1).toUpperCase()}
            </span>
            <button onClick={logout} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-red-600" title="Keluar">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
