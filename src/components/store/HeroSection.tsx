import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { PRODUCT_IMAGES } from '../../data/defaultData';
import { useStore } from '../../context/StoreContext';
import { FoodImage } from '../ui/FoodImage';

interface HeroSectionProps {
  onQuickOrder: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onQuickOrder }) => {
  const { settings } = useStore();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#111111] border-b border-white/10"
    >
      {/* Subtle editorial crimson glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 w-[520px] h-[520px] rounded-full bg-[#D71920]/15 blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Asymmetric Editorial Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs font-semibold tracking-widest uppercase text-[#FFC247] mb-4">
              <span className="inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#D71920]" aria-hidden="true" />
                Best Seller
              </span>
              <span aria-hidden="true" className="text-[#A7A7A7]">
                ·
              </span>
              <span className="text-[#F15A24]">Extra Spicy</span>
              <span aria-hidden="true" className="text-[#A7A7A7]">
                ·
              </span>
              <span className="text-[#A7A7A7]">{settings.tagline}</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold uppercase tracking-tight leading-[0.95] text-[#FFF4E8] text-balance">
              READY FOR <br />
              THE SPICY <br />
              <span className="text-[#D71920]">EXPERIENCE?</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#A7A7A7] max-w-xl leading-relaxed">
              Dimsum juicy dengan saus pedas racikan spesial. Sekali coba, dijamin ingin lagi!
              Tersedia penyajian hangat harian, paket hemat rame-rame, hingga kemasan frozen reseller.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-6 py-3.5 rounded-md font-display text-base tracking-wider uppercase font-semibold transition-colors whitespace-nowrap"
              >
                Lihat Menu
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={onQuickOrder}
                className="inline-flex items-center gap-2 bg-[#1C1C1C] hover:bg-[#282828] border border-white/15 text-[#FFF4E8] px-6 py-3.5 rounded-md font-display text-base tracking-wider uppercase font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                Pesan Sekarang
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="font-display text-2xl font-bold text-[#FFC247] tabular-nums">
                  Level 0–5
                </p>
                <p className="text-xs text-[#A7A7A7] mt-0.5">Pilihan Pedas</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#FFF4E8] tabular-nums">
                  100% Halal
                </p>
                <p className="text-xs text-[#A7A7A7] mt-0.5">Ayam &amp; Udang Segar</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#F15A24] tabular-nums">
                  Frozen
                </p>
                <p className="text-xs text-[#A7A7A7] mt-0.5">Siap Reseller</p>
              </div>
            </div>
          </div>

          {/* Dominant Visual Anchor */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full min-h-[300px] lg:min-h-[460px] rounded-xl overflow-hidden border border-white/10 bg-[#1C1C1C]">
              <FoodImage
                src={PRODUCT_IMAGES.hero}
                alt="Dimsum pedas NYEMEK! dengan siraman chili oil panas dan wijen sangrai"
                className="w-full h-full object-cover"
                priority
                fallbackTitle="NYEMEK! Chili Oil Signature"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
              />
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#FFC247] font-semibold">
                    Signature Dish
                  </p>
                  <p className="font-display text-2xl uppercase tracking-wide text-[#FFF4E8] mt-0.5">
                    Dimsum Chili Oil &amp; Lava Fire
                  </p>
                </div>
                <span className="font-mono tabular-nums text-sm font-bold text-[#111111] bg-[#FFC247] px-3 py-1 rounded shrink-0">
                  Mulai Rp 20.000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
