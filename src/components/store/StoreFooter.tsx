import React from 'react';
import { useStore } from '../../context/StoreContext';
import { normalizePhoneNumber } from '../../utils/validation';

interface StoreFooterProps {
  onNavigateAdmin: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({ onNavigateAdmin }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#111111] border-t border-white/10 text-[#A7A7A7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          <div className="md:col-span-5">
            <p className="font-display text-3xl font-bold uppercase tracking-wider text-[#FFF4E8]">
              {settings.logoText || settings.brandName}
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D71920] mt-1">
              {settings.tagline}
            </p>
            <p className="text-sm text-[#A7A7A7] mt-4 max-w-sm leading-relaxed">
              Dimsum ayam udang handmade dengan saus chili oil racikan spesial. Nikmati hangat di
              rumah atau stok kemasan frozen untuk reseller.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FFF4E8] mb-3">
              Navigasi
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#menu" className="hover:text-[#FFF4E8] transition-colors">
                  Katalog Menu
                </a>
              </li>
              <li>
                <a href="#promo" className="hover:text-[#FFF4E8] transition-colors">
                  Paket Hemat &amp; Promo
                </a>
              </li>
              <li>
                <a href="#editorial" className="hover:text-[#FFF4E8] transition-colors">
                  Signature Showcase
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-[#FFF4E8] transition-colors">
                  Lokasi Outlet
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="hover:text-[#FFC247] transition-colors cursor-pointer"
                >
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#FFF4E8] mb-3">
              Kontak &amp; Jam Buka
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-[#FFF4E8]">{settings.address}</p>
              <p>{settings.openHours}</p>
              <p className="font-mono text-xs text-[#25D366] tabular-nums">
                WA: +{normalizePhoneNumber(settings.whatsappNumber)}
              </p>
              <p className="text-xs text-[#A7A7A7] pt-1">Instagram / TikTok: @nyemek.dimsum</p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A7A7A7]">
          <p>
            &copy; {new Date().getFullYear()} {settings.brandName}. Seluruh hak cipta dilindungi.
          </p>
          <p>Pemesanan via WhatsApp diproses manual oleh tim dapur outlet.</p>
        </div>
      </div>
    </footer>
  );
};
