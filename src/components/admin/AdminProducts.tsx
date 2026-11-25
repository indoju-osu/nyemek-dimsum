import React, { useMemo, useState } from 'react';
import { Edit2, Eye, EyeOff, Plus, Search, Trash2, X } from 'lucide-react';
import { PRODUCT_IMAGES } from '../../data/defaultData';
import { useStore } from '../../context/StoreContext';
import { Product, ProductLabel, SpiceLevel } from '../../types';
import { formatRupiah, getEffectivePrice } from '../../utils/catalog';
import { validateProduct } from '../../utils/validation';
import { ConfirmModal } from '../ui/ConfirmModal';
import { FoodImage } from '../ui/FoodImage';
import { SpiceIndicator } from '../ui/SpiceIndicator';

const PRESET_IMAGE_OPTIONS = [
  { label: 'Chili Oil', url: PRODUCT_IMAGES.chiliOil },
  { label: 'Mentai Torch', url: PRODUCT_IMAGES.mentaiTorch },
  { label: 'Goreng Crispy', url: PRODUCT_IMAGES.gorengCrispy },
  { label: 'Lava Fire', url: PRODUCT_IMAGES.lavaFire },
  { label: 'Mozza Melt', url: PRODUCT_IMAGES.mozzaMelt },
  { label: 'Saus Chili Oil', url: PRODUCT_IMAGES.sausChiliOil },
  { label: 'Paket Rame', url: PRODUCT_IMAGES.paketRame },
  { label: 'Hero Bowl', url: PRODUCT_IMAGES.hero },
];

export const AdminProducts: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct, toggleProductActive } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('25000');
  const [discountPrice, setDiscountPrice] = useState('');
  const [image, setImage] = useState<string>(PRODUCT_IMAGES.chiliOil);
  const [portions, setPortions] = useState('4 pcs');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(3);
  const [stock, setStock] = useState('20');
  const [minStock, setMinStock] = useState('5');
  const [label, setLabel] = useState<ProductLabel>('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, search, categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setCategoryId(categories[0]?.id ?? '');
    setDescription('');
    setPrice('25000');
    setDiscountPrice('');
    setImage(PRODUCT_IMAGES.chiliOil);
    setPortions('4 pcs');
    setSpiceLevel(3);
    setStock('20');
    setMinStock('5');
    setLabel('');
    setIsActive(true);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategoryId(product.categoryId);
    setDescription(product.description);
    setPrice(String(product.price));
    setDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setImage(product.image);
    setPortions(product.portions);
    setSpiceLevel(product.spiceLevel);
    setStock(String(product.stock));
    setMinStock(String(product.minStock));
    setLabel(product.label);
    setIsActive(product.isActive);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericDiscount = discountPrice.trim() ? Number(discountPrice) : null;
    const numericStock = Number(stock);
    const numericMinStock = Math.max(0, Number(minStock) || 0);

    const validation = validateProduct(
      {
        name,
        categoryId,
        description,
        price: numericPrice,
        discountPrice: numericDiscount,
        image,
        portions,
        spiceLevel,
        stock: numericStock,
        minStock: numericMinStock,
      },
      categories.map((c) => c.id)
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    saveProduct({
      id: editingId ?? undefined,
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: numericPrice,
      discountPrice: numericDiscount,
      image: image.trim() || PRODUCT_IMAGES.chiliOil,
      portions: portions.trim() || '4 pcs',
      spiceLevel,
      stock: numericStock,
      minStock: numericMinStock,
      label,
      isActive,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
            Manajemen Produk
          </h2>
          <p className="text-sm text-[#A7A7A7]">
            Tambah, edit, aktifkan/nonaktifkan, dan kelola harga katalog NYEMEK!.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-7 relative">
          <Search
            className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau deskripsi produk..."
            className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md pl-10 pr-4 py-2 text-sm text-[#FFF4E8]"
          />
        </div>
        <div className="md:col-span-5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter kategori produk"
            className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          >
            <option value="all">Semua Kategori ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#161616] text-left text-xs uppercase text-[#A7A7A7]">
                <th className="py-3 px-4 font-medium">Produk</th>
                <th className="py-3 px-4 font-medium">Kategori</th>
                <th className="py-3 px-4 font-medium text-right">Harga</th>
                <th className="py-3 px-4 font-medium">Pedas</th>
                <th className="py-3 px-4 font-medium text-right">Stok</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => {
                const effPrice = getEffectivePrice(product);
                return (
                  <tr key={product.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-12 h-10 rounded overflow-hidden shrink-0 bg-[#111111]">
                          <FoodImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-[#FFF4E8]">{product.name}</p>
                          <p className="text-xs text-[#A7A7A7]">
                            {product.portions}
                            {product.label ? ` · ${product.label}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#A7A7A7] whitespace-nowrap">
                      {categoryMap[product.categoryId] ?? '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="text-[#FFC247] font-semibold">
                        {formatRupiah(effPrice)}
                      </span>
                      {effPrice < product.price && (
                        <span className="block text-[11px] text-[#A7A7A7] line-through">
                          {formatRupiah(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SpiceIndicator level={product.spiceLevel} showText={false} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          product.stock <= 0
                            ? 'text-[#D71920] font-bold'
                            : product.stock <= product.minStock
                            ? 'text-[#FFC247]'
                            : 'text-[#FFF4E8]'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleProductActive(product.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                          product.isActive ? 'text-[#25D366]' : 'text-[#A7A7A7]'
                        }`}
                      >
                        {product.isActive ? (
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{product.isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="p-2 text-[#A7A7A7] hover:text-[#FFC247] rounded hover:bg-white/5"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 text-[#A7A7A7] hover:text-[#D71920] rounded hover:bg-white/5"
                          aria-label={`Hapus ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#A7A7A7]">
                    Tidak ada produk yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1C1C1C] border border-white/15 rounded-xl p-6 text-[#FFF4E8]">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
              <h3 className="font-display text-2xl uppercase tracking-wide">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#A7A7A7] hover:text-[#FFF4E8] p-1"
                aria-label="Tutup modal produk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-name" className="block text-xs text-[#A7A7A7] mb-1">
                    Nama Produk *
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                  {errors.name && <p className="text-xs text-[#D71920] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="prod-cat" className="block text-xs text-[#A7A7A7] mb-1">
                    Kategori *
                  </label>
                  <select
                    id="prod-cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-[#D71920] mt-1">{errors.categoryId}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="prod-desc" className="block text-xs text-[#A7A7A7] mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="prod-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prod-price" className="block text-xs text-[#A7A7A7] mb-1">
                    Harga Normal (Rp) *
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
                  />
                  {errors.price && <p className="text-xs text-[#D71920] mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="prod-discount" className="block text-xs text-[#A7A7A7] mb-1">
                    Harga Diskon (Opsional)
                  </label>
                  <input
                    id="prod-discount"
                    type="number"
                    min={0}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Kosongkan jika tidak"
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
                  />
                  {errors.discountPrice && (
                    <p className="text-xs text-[#D71920] mt-1">{errors.discountPrice}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="prod-portions" className="block text-xs text-[#A7A7A7] mb-1">
                    Porsi
                  </label>
                  <input
                    id="prod-portions"
                    type="text"
                    value={portions}
                    onChange={(e) => setPortions(e.target.value)}
                    placeholder="4 pcs"
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="prod-spice" className="block text-xs text-[#A7A7A7] mb-1">
                    Level Pedas (0–5)
                  </label>
                  <select
                    id="prod-spice"
                    value={spiceLevel}
                    onChange={(e) => setSpiceLevel(Number(e.target.value) as SpiceLevel)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {[0, 1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                  {errors.spiceLevel && (
                    <p className="text-xs text-[#D71920] mt-1">{errors.spiceLevel}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="prod-stock" className="block text-xs text-[#A7A7A7] mb-1">
                    Stok *
                  </label>
                  <input
                    id="prod-stock"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
                  />
                  {errors.stock && <p className="text-xs text-[#D71920] mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label htmlFor="prod-minstock" className="block text-xs text-[#A7A7A7] mb-1">
                    Stok Minimum
                  </label>
                  <input
                    id="prod-minstock"
                    type="number"
                    min={0}
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="prod-label" className="block text-xs text-[#A7A7A7] mb-1">
                    Label Produk
                  </label>
                  <select
                    id="prod-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value as ProductLabel)}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Tanpa Label</option>
                    <option value="BEST SELLER">BEST SELLER</option>
                    <option value="HOT DEAL">HOT DEAL</option>
                    <option value="BARU">BARU</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="prod-image" className="block text-xs text-[#A7A7A7] mb-1">
                  URL Foto Produk (http/https atau pilih galeri preset)
                </label>
                <input
                  id="prod-image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-xs font-mono"
                />
                {errors.image && <p className="text-xs text-[#D71920] mt-1">{errors.image}</p>}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_IMAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setImage(opt.url)}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        image === opt.url
                          ? 'border-[#FFC247] text-[#FFC247] bg-[#111111]'
                          : 'border-white/10 text-[#A7A7A7] hover:text-[#FFF4E8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#D71920] w-4 h-4"
                />
                <span>Tampilkan produk di halaman customer</span>
              </label>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] font-semibold rounded-md text-sm"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Produk"
        description={`Yakin ingin menghapus "${deleteTarget?.name ?? ''}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Produk"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
