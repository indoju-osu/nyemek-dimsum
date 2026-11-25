import React, { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { calculateCartTotal } from '../../utils/cart';

interface StoreHeaderProps {
  onOpenCart: () => void;
  onNavigateAdmin: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  onOpenCart,
  onNavigateAdmin,
}) => {
  const { settings, cart } = useStore();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { itemCount } = calculateCartTotal(cart);

  const navItems = [
    { label: 'Menu', href: '#menu' },
    { label: 'Paket Hemat', href: '#promo' },
    { label: 'Tentang Kami', href: '#editorial' },
    { label: 'Lokasi', href: '#lokasi' },
  ];

  return (
    <div className="sticky top-0 z-40">
      {showAnnouncement && settings.announcementText && (
        <div className="bg-[#D71920] text-[#FFF4E8] px-4 py-1.5 text-xs font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="truncate text-center flex-1">{settings.announcementText}</p>
            <button
              type="button"
              onClick={() => setShowAnnouncement(false)}
              className="text-[#FFF4E8]/80 hover:text-[#FFF4E8] shrink-0 p-0.5"
              aria-label="Tutup pengumuman"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#111111]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <a
            href="#top"
            className="font-display text-2xl sm:text-3xl font-bold tracking-wider uppercase text-[#FFF4E8] whitespace-nowrap shrink-0"
          >
            {settings.logoText || settings.brandName}
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A7A7A7]"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#FFF4E8] hover:underline underline-offset-8 decoration-[#D71920] decoration-2 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="hover:text-[#FFC247] hover:underline underline-offset-8 decoration-[#FFC247] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Admin
            </button>
          </nav>

          {/* Zone 3: Primary action (Cart) + Mobile menu button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={`Buka keranjang belanja, ${itemCount} item`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Keranjang</span>
              <span className="font-mono tabular-nums text-xs bg-[#111111]/40 px-1.5 py-0.5 rounded">
                {itemCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-[#FFF4E8] hover:bg-white/10 rounded-md"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Navigasi seluler"
            className="md:hidden bg-[#1C1C1C] border-t border-white/10 px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 text-sm font-medium text-[#FFF4E8] hover:text-[#FFC247] border-b border-white/5"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="py-2.5 px-2 text-left text-sm font-semibold text-[#FFC247]"
            >
              Admin Dashboard
            </button>
          </nav>
        )}
      </header>
    </div>
  );
};
