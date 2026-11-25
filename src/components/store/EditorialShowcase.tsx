import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, getEffectivePrice } from '../../utils/catalog';
import { FoodImage } from '../ui/FoodImage';
import { SpiceIndicator } from '../ui/SpiceIndicator';

export const EditorialShowcase: React.FC = () => {
  const { products, categories, addProductToCart } = useStore();

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const spotlightProducts = products
    .filter((p) => p.isActive && p.stock > 0)
    .slice(0, 3);

  if (spotlightProducts.length === 0) return null;

  return (
    <section
      id="editorial"
      className="py-16 lg:py-24 bg-[#161616] border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FFC247] mb-2">
            Editorial Food Showcase
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#FFF4E8] text-balance">
            RACIKAN SPESIAL <span className="text-[#D71920]">CHILI OIL</span> YANG BIKIN NAGIH
          </h2>
        </div>

        <div className="space-y-12 lg:space-y-16">
          {spotlightProducts.map((product, index) => {
            const reversed = index % 2 === 1;
            const effectivePrice = getEffectivePrice(product);
            const indexNumber = String(index + 1).padStart(2, '0');

            return (
              <div
                key={product.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-white/10 pb-12 last:border-b-0 last:pb-0"
              >
                <div
                  className={`lg:col-span-7 ${
                    reversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="relative aspect-[16/10] lg:h-full rounded-xl overflow-hidden bg-[#111111] border border-white/10">
                    <FoodImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-5 flex flex-col justify-between ${
                    reversed ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <span className="font-display text-4xl font-bold text-[#D71920] tabular-nums">
                        {indexNumber}.
                      </span>
                      <span className="text-xs uppercase tracking-widest text-[#A7A7A7]">
                        {categoryMap[product.categoryId] ?? 'Signature'} · {product.portions}
                      </span>
                    </div>

                    <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#FFF4E8] mt-6">
                      {product.name}
                    </h3>

                    <div className="mt-3">
                      <SpiceIndicator level={product.spiceLevel} />
                    </div>

                    <p className="mt-4 text-sm sm:text-base text-[#A7A7A7] leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#A7A7A7]">Harga</p>
                      <p className="font-mono text-2xl font-bold text-[#FFC247] tabular-nums">
                        {formatRupiah(effectivePrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProductToCart(product, 1)}
                      className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-5 py-3 rounded-md font-display text-sm tracking-wider uppercase font-semibold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Pesan Menu Ini
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
