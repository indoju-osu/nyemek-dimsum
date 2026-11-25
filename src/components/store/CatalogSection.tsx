import React, { useMemo, useState } from 'react';
import { Eye, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, SortOption, SpiceLevel } from '../../types';
import { filterProducts, formatRupiah, getEffectivePrice, sortProducts } from '../../utils/catalog';
import { FoodImage } from '../ui/FoodImage';
import { SpiceIndicator } from '../ui/SpiceIndicator';

interface CatalogSectionProps {
  externalCategoryFilter?: string;
  onClearExternalCategory?: () => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  externalCategoryFilter,
  onClearExternalCategory,
}) => {
  const { products, categories, addProductToCart } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const activeCategory = externalCategoryFilter || selectedCategory;

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) {
      map[c.id] = c.name;
    }
    return map;
  }, [categories]);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterProducts(
      products,
      {
        search,
        categoryId: activeCategory,
        spiceLevel,
        onlyActive: true,
      },
      categoryMap
    );
    return sortProducts(filtered, sortBy);
  }, [products, search, activeCategory, spiceLevel, sortBy, categoryMap]);

  const handleCategoryClick = (catId: string) => {
    if (onClearExternalCategory) onClearExternalCategory();
    setSelectedCategory(catId);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSpiceLevel('all');
    setSortBy('recommended');
    if (onClearExternalCategory) onClearExternalCategory();
  };

  return (
    <section id="menu" className="py-16 lg:py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F15A24] mb-2">
              Katalog Menu NYEMEK!
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#FFF4E8]">
              PILIH <span className="text-[#D71920]">PEDASMU</span>
            </h2>
          </div>
          <p className="text-sm text-[#A7A7A7] tabular-nums">
            Menampilkan {filteredAndSorted.length} menu tersedia
          </p>
        </div>

        {/* Search, Spice Filter & Sort Controls */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search
              className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dimsum, mentai, frozen, atau saus..."
              aria-label="Cari produk dimsum"
              className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md pl-10 pr-4 py-2.5 text-sm text-[#FFF4E8] placeholder:text-[#A7A7A7]"
            />
          </div>

          <div className="lg:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#A7A7A7] shrink-0" aria-hidden="true" />
            <select
              value={spiceLevel === 'all' ? 'all' : String(spiceLevel)}
              onChange={(e) =>
                setSpiceLevel(
                  e.target.value === 'all' ? 'all' : (Number(e.target.value) as SpiceLevel)
                )
              }
              aria-label="Filter level pedas"
              className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2.5 text-sm text-[#FFF4E8]"
            >
              <option value="all">Semua Level Pedas (0–5)</option>
              <option value="0">Level 0 — Original (Tidak Pedas)</option>
              <option value="1">Level 1 — Mild</option>
              <option value="2">Level 2 — Sedang Hangat</option>
              <option value="3">Level 3 — Pedas Nikmat</option>
              <option value="4">Level 4 — Pedas Nampol</option>
              <option value="5">Level 5 — Ekstra Lava Fire</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Urutkan produk"
              className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2.5 text-sm text-[#FFF4E8]"
            >
              <option value="recommended">Urutkan: Rekomendasi</option>
              <option value="price-asc">Harga Termurah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name-asc">Nama A–Z</option>
              <option value="newest">Produk Terbaru</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs (Horizontal Scroll on Mobile) */}
        <div
          role="tablist"
          aria-label="Filter kategori produk"
          className="mt-4 flex items-center gap-2 overflow-x-auto pb-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => handleCategoryClick('all')}
            className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#D71920] text-[#FFF4E8]'
                : 'bg-[#1C1C1C] text-[#A7A7A7] hover:text-[#FFF4E8] border border-white/10'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#D71920] text-[#FFF4E8]'
                  : 'bg-[#1C1C1C] text-[#A7A7A7] hover:text-[#FFF4E8] border border-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        {filteredAndSorted.length === 0 ? (
          <div className="mt-10 bg-[#1C1C1C] border border-white/10 rounded-xl p-10 text-center">
            <p className="font-display text-2xl uppercase text-[#FFF4E8]">
              Menu Tidak Ditemukan
            </p>
            <p className="text-sm text-[#A7A7A7] mt-2">
              Coba ubah kata kunci pencarian, kategori, atau filter level pedas.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 px-5 py-2.5 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] rounded-md text-sm font-semibold transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSorted.map((product) => {
              const effectivePrice = getEffectivePrice(product);
              const hasDiscount = effectivePrice < product.price;
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;
              const categoryName = categoryMap[product.categoryId] ?? 'Menu';

              return (
                <article
                  key={product.id}
                  className="group flex flex-col bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/25"
                >
                  {/* Visual-first image container (4:3 uniform aspect ratio) */}
                  <div className="relative aspect-[4/3] bg-[#141414] overflow-hidden">
                    <FoodImage
                      src={product.image}
                      alt={`${product.name} — ${categoryName}`}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isOutOfStock ? 'opacity-45 grayscale' : ''
                      }`}
                      fallbackTitle={product.name}
                    />
                    {product.label && (
                      <span
                        className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-sm ${
                          product.label === 'BEST SELLER'
                            ? 'bg-[#FFC247] text-[#111111]'
                            : product.label === 'HOT DEAL'
                            ? 'bg-[#D71920] text-[#FFF4E8]'
                            : 'bg-[#F15A24] text-[#FFF4E8]'
                        }`}
                      >
                        {product.label}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="absolute bottom-2.5 right-2.5 p-2 rounded-md bg-black/70 text-[#FFF4E8] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[#D71920]"
                      aria-label={`Lihat detail ${product.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A7A7A7]">
                      <span className="truncate">{categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{product.portions}</span>
                    </div>

                    <h3 className="mt-1 font-semibold text-sm sm:text-base text-[#FFF4E8] leading-snug">
                      <button
                        type="button"
                        onClick={() => setDetailProduct(product)}
                        className="text-left hover:text-[#FFC247] transition-colors cursor-pointer"
                      >
                        {product.name}
                      </button>
                    </h3>

                    <p className="mt-1.5 text-xs text-[#A7A7A7] line-clamp-2 leading-relaxed flex-1">
                      {product.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <SpiceIndicator level={product.spiceLevel} showText={false} />
                      <span
                        className={`text-[11px] font-medium tabular-nums ${
                          isOutOfStock
                            ? 'text-[#D71920]'
                            : isLowStock
                            ? 'text-[#FFC247]'
                            : 'text-[#A7A7A7]'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Habis'
                          : isLowStock
                          ? `Sisa ${product.stock}`
                          : `Stok ${product.stock}`}
                      </span>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sm sm:text-base text-[#FFC247] tabular-nums">
                          {formatRupiah(effectivePrice)}
                        </p>
                        {hasDiscount && (
                          <p className="font-mono text-[11px] text-[#A7A7A7] line-through tabular-nums">
                            {formatRupiah(product.price)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addProductToCart(product, 1)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isOutOfStock
                            ? 'bg-white/5 text-[#A7A7A7] cursor-not-allowed'
                            : 'bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] cursor-pointer'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isOutOfStock ? 'Habis' : 'Tambah'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Quick Detail Modal */}
      {detailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          <div className="w-full max-w-2xl bg-[#1C1C1C] border border-white/15 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-[4/3] md:aspect-auto bg-[#111111]">
              <FoodImage
                src={detailProduct.image}
                alt={detailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs uppercase tracking-wider text-[#F15A24] font-semibold">
                    {categoryMap[detailProduct.categoryId] ?? 'Menu'} · {detailProduct.portions}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailProduct(null)}
                    className="text-[#A7A7A7] hover:text-[#FFF4E8] p-1"
                    aria-label="Tutup detail produk"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3
                  id="product-detail-title"
                  className="font-display text-2xl uppercase tracking-wide text-[#FFF4E8] mt-1"
                >
                  {detailProduct.name}
                </h3>
                <div className="mt-2">
                  <SpiceIndicator level={detailProduct.spiceLevel} />
                </div>
                <p className="mt-4 text-sm text-[#A7A7A7] leading-relaxed">
                  {detailProduct.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="font-mono text-2xl font-bold text-[#FFC247] tabular-nums">
                      {formatRupiah(getEffectivePrice(detailProduct))}
                    </span>
                    {getEffectivePrice(detailProduct) < detailProduct.price && (
                      <span className="ml-2 font-mono text-sm text-[#A7A7A7] line-through tabular-nums">
                        {formatRupiah(detailProduct.price)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#A7A7A7] tabular-nums">
                    Stok: {detailProduct.stock}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={detailProduct.stock <= 0}
                  onClick={() => {
                    addProductToCart(detailProduct, 1);
                    setDetailProduct(null);
                  }}
                  className="w-full py-3 px-4 bg-[#D71920] hover:bg-[#B8141A] disabled:bg-white/10 disabled:text-[#A7A7A7] text-[#FFF4E8] font-semibold rounded-md transition-colors cursor-pointer"
                >
                  {detailProduct.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
