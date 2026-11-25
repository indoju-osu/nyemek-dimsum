import React, { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PromoType, Promotion } from '../../types';
import { formatRupiah } from '../../utils/catalog';
import { validatePromotion } from '../../utils/validation';
import { ConfirmModal } from '../ui/ConfirmModal';

const PROMO_TYPES: PromoType[] = [
  'Diskon Produk',
  'Paket Bundling',
  'Promo Pembelian Banyak',
  'Paket Reseller',
];

export const AdminPromotions: React.FC = () => {
  const { promotions, savePromotion, deletePromotion, togglePromotionActive } = useStore();
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<PromoType>('Diskon Produk');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [minPurchase, setMinPurchase] = useState('50000');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2027-12-31');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setCode('');
    setType('Diskon Produk');
    setDiscountPercent('10');
    setDiscountAmount('0');
    setMinPurchase('50000');
    setStartDate('2026-01-01');
    setEndDate('2027-12-31');
    setDescription('');
    setIsActive(true);
    setErrors({});
  };

  const startEdit = (promo: Promotion) => {
    setEditing(promo);
    setName(promo.name);
    setCode(promo.code);
    setType(promo.type);
    setDiscountPercent(String(promo.discountPercent));
    setDiscountAmount(String(promo.discountAmount));
    setMinPurchase(String(promo.minPurchase));
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setDescription(promo.description);
    setIsActive(promo.isActive);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent) || 0,
      discountAmount: Number(discountAmount) || 0,
      minPurchase: Number(minPurchase) || 0,
      startDate,
      endDate,
    };

    const validation = validatePromotion(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    savePromotion({
      id: editing?.id,
      ...payload,
      type,
      description: description.trim(),
      isActive,
    });
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
          Manajemen Promosi
        </h2>
        <p className="text-sm text-[#A7A7A7]">
          Buat dan atur kode promo diskon, bundling, pembelian banyak, dan reseller.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-[#1C1C1C] border border-white/10 rounded-lg p-6 space-y-4 self-start"
        >
          <h3 className="font-display text-xl uppercase text-[#FFF4E8]">
            {editing ? `Edit Promo: ${editing.code}` : 'Buat Promo Baru'}
          </h3>

          <div>
            <label htmlFor="promo-name" className="block text-xs text-[#A7A7A7] mb-1">
              Nama Promo *
            </label>
            <input
              id="promo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Promo Weekend Pedas"
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
            {errors.name && <p className="text-xs text-[#D71920] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="promo-code" className="block text-xs text-[#A7A7A7] mb-1">
                Kode Promo *
              </label>
              <input
                id="promo-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PEDAS15"
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm font-mono uppercase text-[#FFC247]"
              />
              {errors.code && <p className="text-xs text-[#D71920] mt-1">{errors.code}</p>}
            </div>

            <div>
              <label htmlFor="promo-type" className="block text-xs text-[#A7A7A7] mb-1">
                Tipe Promo
              </label>
              <select
                id="promo-type"
                value={type}
                onChange={(e) => setType(e.target.value as PromoType)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
              >
                {PROMO_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="promo-pct" className="block text-xs text-[#A7A7A7] mb-1">
                Diskon (%)
              </label>
              <input
                id="promo-pct"
                type="number"
                min={0}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="promo-amt" className="block text-xs text-[#A7A7A7] mb-1">
                Potongan (Rp)
              </label>
              <input
                id="promo-amt"
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="promo-min" className="block text-xs text-[#A7A7A7] mb-1">
                Min. Belanja
              </label>
              <input
                id="promo-min"
                type="number"
                min={0}
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          {(errors.discount || errors.discountPercent || errors.discountAmount || errors.minPurchase) && (
            <p className="text-xs text-[#D71920]">
              {errors.discount ||
                errors.discountPercent ||
                errors.discountAmount ||
                errors.minPurchase}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="promo-start" className="block text-xs text-[#A7A7A7] mb-1">
                Mulai Berlaku
              </label>
              <input
                id="promo-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-xs text-[#FFF4E8]"
              />
            </div>
            <div>
              <label htmlFor="promo-end" className="block text-xs text-[#A7A7A7] mb-1">
                Berakhir
              </label>
              <input
                id="promo-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-xs text-[#FFF4E8]"
              />
            </div>
          </div>
          {errors.dates && <p className="text-xs text-[#D71920]">{errors.dates}</p>}

          <div>
            <label htmlFor="promo-desc" className="block text-xs text-[#A7A7A7] mb-1">
              Keterangan
            </label>
            <textarea
              id="promo-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#D71920] w-4 h-4"
            />
            <span>Promo aktif</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-4 py-2 rounded-md text-sm font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{editing ? 'Simpan Promo' : 'Buat Promo'}</span>
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm rounded-md"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="lg:col-span-7 bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#161616] text-left text-xs uppercase text-[#A7A7A7]">
                  <th className="py-3 px-4 font-medium">Promo &amp; Kode</th>
                  <th className="py-3 px-4 font-medium">Nilai</th>
                  <th className="py-3 px-4 font-medium">Periode</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {promotions.map((pr) => (
                  <tr key={pr.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-[#FFC247]">{pr.code}</p>
                      <p className="text-xs text-[#FFF4E8]">{pr.name}</p>
                      <p className="text-[11px] text-[#A7A7A7]">{pr.type}</p>
                    </td>
                    <td className="py-3 px-4 text-xs tabular-nums">
                      <p className="font-mono font-semibold text-[#FFF4E8]">
                        {pr.discountPercent > 0
                          ? `${pr.discountPercent}%`
                          : formatRupiah(pr.discountAmount)}
                      </p>
                      <p className="text-[#A7A7A7]">Min {formatRupiah(pr.minPurchase)}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#A7A7A7] tabular-nums whitespace-nowrap">
                      {pr.startDate} s/d {pr.endDate}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => togglePromotionActive(pr.id)}
                        className={`text-xs font-semibold cursor-pointer ${
                          pr.isActive ? 'text-[#25D366]' : 'text-[#A7A7A7]'
                        }`}
                      >
                        {pr.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(pr)}
                          className="p-2 text-[#A7A7A7] hover:text-[#FFC247] rounded hover:bg-white/5"
                          aria-label={`Edit ${pr.code}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(pr)}
                          className="p-2 text-[#A7A7A7] hover:text-[#D71920] rounded hover:bg-white/5"
                          aria-label={`Hapus ${pr.code}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Promo"
        description={`Yakin ingin menghapus kode promo "${deleteTarget?.code ?? ''}"?`}
        confirmLabel="Hapus Promo"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePromotion(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
