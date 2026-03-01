import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

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

const navLinks = [
  { to: '/',          label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/send',      label: 'Send Money' },
  { to: '/history',   label: 'History' },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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
          <span className="text-xl font-extrabold text-[#00FF87] tracking-tight group-hover:text-[#00FFB0] transition-colors duration-150">
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

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ── Mobile backdrop overlay ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          style={{ top: '64px' }}
          onClick={() => setMenuOpen(false)}
        />
      )}

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
        </div>
      )}
    </>
  );
};

export default Navbar;
