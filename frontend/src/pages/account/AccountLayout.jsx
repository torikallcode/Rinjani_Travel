import { NavLink, Outlet } from 'react-router-dom';
import { UserRound, CalendarCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/format';

const links = [
  { to: '/account', label: 'Profil Saya', icon: UserRound, end: true },
  { to: '/account/bookings', label: 'Pesanan Saya', icon: CalendarCheck },
  { to: '/account/security', label: 'Keamanan', icon: ShieldCheck },
];

export default function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="rounded-xl border border-hitam-0/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-biru-0 font-tomorrow text-base font-bold text-white">
                {initials(user?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-hitam-0">{user?.name}</p>
                <p className="truncate text-xs text-hitam-0/50">{user?.email}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? 'bg-biru-0/10 text-biru-0' : 'text-hitam-0/60 hover:bg-hitam-0/5'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" /> {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="mt-4 rounded-xl bg-hitam-0 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-biru-0">Butuh bantuan?</p>
            <p className="mt-2 text-sm text-white/70">Tim kami siap membantu perubahan jadwal atau pertanyaan pesanan.</p>
            <NavLink to="/contact" className="mt-3 inline-block text-sm font-semibold text-biru-0 hover:underline">Hubungi kami →</NavLink>
          </div>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
