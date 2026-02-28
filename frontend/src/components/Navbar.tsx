import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import type { User } from '../types';

const ShieldLogo = () => (
  <svg
    className="w-7 h-7 text-[#00FF87]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" strokeWidth="2" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
  </svg>
);

const navLinks = [
  { to: '/',          label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history',   label: 'History' },
];

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => {/* silently skip if backend not ready */});
  }, []);

  const activeCls = 'text-[#00FF87] border-b-2 border-[#00FF87] pb-0.5';
  const inactiveCls = 'text-[#5A8A70] hover:text-[#00FF87] transition-colors duration-150';

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 border-b border-[#0D2418]"
        style={{ background: 'rgba(4,13,10,0.97)', backdropFilter: 'blur(12px)' }}
      >
        {/* ── Logo ── */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
        >
          <ShieldLogo />
          <span className="text-xl font-extrabold text-[#00FF87] tracking-tight group-hover:text-[#00E5CC] transition-colors duration-150">
            SecureFlow
          </span>
        </button>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? activeCls : inactiveCls}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Right: user info ── */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-[#0D2418]">
              {/* Balance chip */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ background: 'rgba(0,255,135,0.07)', borderColor: 'rgba(0,255,135,0.2)', color: '#00FF87' }}>
                <WalletIcon />
                ₹{user.balance.toLocaleString('en-IN')}
              </div>
              {/* Avatar + UPI */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #00C96A, #00FF87)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-[#E8FFF1]">{user.name}</span>
                  <span className="text-xs text-[#9CA3AF] font-mono">{user.upiId}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-4 border-l border-[#0D2418]">
              <div className="w-8 h-8 rounded-full bg-[#0D2418] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#0D2418] animate-pulse" />
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed top-16 inset-x-0 z-40 border-b border-[#0D2418] px-6 py-5 flex flex-col gap-4"
          style={{ background: 'rgba(4,13,10,0.98)', backdropFilter: 'blur(12px)' }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-base font-medium py-2 border-b border-[#0D2418] ${isActive ? 'text-[#00FF87]' : 'text-[#6B9E80]'}`
              }
            >
              {label}
            </NavLink>
          ))}
          {user && (
            <div className="pt-2 flex items-center gap-3 border-t border-[#0D2418]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #00C96A, #00FF87)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-[#E8FFF1]">{user.name}</span>
                <span className="text-xs text-[#9CA3AF] font-mono">{user.upiId}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ background: 'rgba(0,255,135,0.07)', borderColor: 'rgba(0,255,135,0.2)', color: '#00FF87' }}>
                <WalletIcon />
                ₹{user.balance.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
