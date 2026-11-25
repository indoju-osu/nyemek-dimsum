import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { PRODUCT_IMAGES } from '../../data/defaultData';
import { useStore } from '../../context/StoreContext';
import { isPromotionCurrentlyValid } from '../../utils/cart';
import { formatRupiah } from '../../utils/catalog';
import { FoodImage } from '../ui/FoodImage';

interface PromoSectionProps {
  onSelectBundleCategory: () => void;
  onApplyPromoCode: (code: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({
  onSelectBundleCategory,
  onApplyPromoCode,
}) => {
  const { settings, promotions } = useStore();
  const activePromos = promotions.filter((p) => isPromotionCurrentlyValid(p)).slice(0, 4);

  return (
    <section id="promo" className="py-16 lg:py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#D71920] via-[#C61D1E] to-[#F15A24] border border-white/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Copy & Promo Codes */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between text-[#FFF4E8]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#FFC247]">
                  Promo Spesial &amp; Bundling Hemat
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight leading-none mt-3 text-balance">
                  {settings.promoHeadline}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#FFF4E8]/90 max-w-xl leading-relaxed">
                  {settings.promoSubtext}
                </p>

                {activePromos.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activePromos.map((promo) => (
                      <div
                        key={promo.id}
                        className="bg-[#111111]/85 border border-white/15 rounded-lg p-4 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] uppercase tracking-wider text-[#A7A7A7]">
                              {promo.type}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#FFC247]">
                              {promo.discountPercent > 0
                                ? `-${promo.discountPercent}%`
                                : `-${formatRupiah(promo.discountAmount)}`}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-[#FFF4E8] mt-1">
                            {promo.name}
                          </p>
                          <p className="text-xs text-[#A7A7A7] mt-1">
                            Min. belanja {formatRupiah(promo.minPurchase)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onApplyPromoCode(promo.code)}
                          className="mt-2 inline-flex items-center justify-between gap-2 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-white/10 px-3 py-1.5 rounded text-xs font-mono font-bold text-[#FFC247] transition-colors cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                            {promo.code}
                          </span>
                          <span className="font-sans font-medium text-[11px] text-[#FFF4E8]">
                            Pakai
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onSelectBundleCategory}
                  className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#1C1C1C] text-[#FFC247] px-6 py-3.5 rounded-md font-display text-base tracking-wider uppercase font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Beli Sekarang
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-[#1C1C1C]">
              <FoodImage
                src={PRODUCT_IMAGES.paketRame}
                alt="Paket bundling dimsum pedas NYEMEK! untuk rame-rame dan stok reseller"
                className="w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#C61D1E]/40 lg:via-transparent lg:to-transparent"
              />
              <div className="absolute bottom-5 left-5 right-5 bg-[#111111]/90 border border-white/15 rounded-lg p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#A7A7A7]">
                    Best Value Bundle
                  </p>
                  <p className="font-display text-xl uppercase text-[#FFF4E8]">
                    Paket Rame-Rame (20 pcs)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-lg font-bold text-[#FFC247] tabular-nums">
                    Rp 99.000
                  </p>
                  <p className="font-mono text-xs text-[#A7A7A7] line-through tabular-nums">
                    Rp 115.000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
