import React, { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildExportJson } from '../../utils/storage';
import { isSafeHttpUrl, validatePhoneNumber } from '../../utils/validation';
import { ConfirmModal } from '../ui/ConfirmModal';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    categories,
    products,
    promotions,
    orders,
    inventoryLogs,
    updateSettings,
    importDataJson,
    resetDemo,
    showToast,
  } = useStore();

  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.brandName.trim()) {
      nextErrors.brandName = 'Nama brand wajib diisi.';
    }
    if (!validatePhoneNumber(form.whatsappNumber)) {
      nextErrors.whatsappNumber = 'Nomor WhatsApp tidak valid (contoh: 6281234567890).';
    }
    if (!form.address.trim()) {
      nextErrors.address = 'Alamat outlet wajib diisi.';
    }
    if (form.mapsUrl.trim() && !isSafeHttpUrl(form.mapsUrl, false)) {
      nextErrors.mapsUrl = 'URL Google Maps harus diawali http:// atau https://.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast('Periksa kembali pengaturan toko.', 'error');
      return;
    }

    setErrors({});
    updateSettings(form);
  };

  const handleExport = () => {
    const json = buildExportJson({
      categories,
      products,
      promotions,
      orders,
      inventoryLogs,
      settings,
    });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nyemek-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON berhasil diunduh.', 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2 MB.', 'error');
      return;
    }
    const text = await file.text();
    const res = importDataJson(text);
    if (!res.ok && res.error) {
      showToast(res.error, 'error');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
          Pengaturan Toko &amp; Data
        </h2>
        <p className="text-sm text-[#A7A7A7]">
          Semua perubahan identitas, WhatsApp checkout, dan outlet langsung tampil di halaman
          customer.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-[#1C1C1C] border border-white/10 rounded-lg p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-brand" className="block text-xs text-[#A7A7A7] mb-1">
              Nama Brand *
            </label>
            <input
              id="set-brand"
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
            {errors.brandName && (
              <p className="text-xs text-[#D71920] mt-1">{errors.brandName}</p>
            )}
          </div>

          <div>
            <label htmlFor="set-logo" className="block text-xs text-[#A7A7A7] mb-1">
              Teks Logo Header
            </label>
            <input
              id="set-logo"
              type="text"
              value={form.logoText}
              onChange={(e) => setForm({ ...form, logoText: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-tagline" className="block text-xs text-[#A7A7A7] mb-1">
              Tagline Brand
            </label>
            <input
              id="set-tagline"
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>

          <div>
            <label htmlFor="set-wa" className="block text-xs text-[#A7A7A7] mb-1">
              Nomor WhatsApp Checkout *
            </label>
            <input
              id="set-wa"
              type="tel"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="6281234567890"
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-[#25D366]"
            />
            {errors.whatsappNumber && (
              <p className="text-xs text-[#D71920] mt-1">{errors.whatsappNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="set-announce" className="block text-xs text-[#A7A7A7] mb-1">
            Teks Announcement Bar
          </label>
          <input
            id="set-announce"
            type="text"
            value={form.announcementText}
            onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-address" className="block text-xs text-[#A7A7A7] mb-1">
              Alamat Outlet *
            </label>
            <input
              id="set-address"
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
            {errors.address && <p className="text-xs text-[#D71920] mt-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="set-hours" className="block text-xs text-[#A7A7A7] mb-1">
              Jam Operasional
            </label>
            <input
              id="set-hours"
              type="text"
              value={form.openHours}
              onChange={(e) => setForm({ ...form, openHours: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="set-maps" className="block text-xs text-[#A7A7A7] mb-1">
            URL Google Maps Outlet
          </label>
          <input
            id="set-maps"
            type="url"
            value={form.mapsUrl}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-[#FFF4E8]"
          />
          {errors.mapsUrl && <p className="text-xs text-[#D71920] mt-1">{errors.mapsUrl}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-delivery" className="block text-xs text-[#A7A7A7] mb-1">
              Informasi Pengiriman (Delivery)
            </label>
            <textarea
              id="set-delivery"
              rows={2}
              value={form.deliveryInfo}
              onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>

          <div>
            <label htmlFor="set-pickup" className="block text-xs text-[#A7A7A7] mb-1">
              Informasi Pengambilan (Pickup)
            </label>
            <textarea
              id="set-pickup"
              rows={2}
              value={form.pickupInfo}
              onChange={(e) => setForm({ ...form, pickupInfo: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-promo-head" className="block text-xs text-[#A7A7A7] mb-1">
              Headline Banner Promosi
            </label>
            <input
              id="set-promo-head"
              type="text"
              value={form.promoHeadline}
              onChange={(e) => setForm({ ...form, promoHeadline: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
          <div>
            <label htmlFor="set-promo-sub" className="block text-xs text-[#A7A7A7] mb-1">
              Subteks Banner Promosi
            </label>
            <input
              id="set-promo-sub"
              type="text"
              value={form.promoSubtext}
              onChange={(e) => setForm({ ...form, promoSubtext: e.target.value })}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-5 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Simpan Pengaturan Toko</span>
          </button>
        </div>
      </form>

      {/* LocalStorage Backup & Reset */}
      <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-wide text-[#FFF4E8]">
            Manajemen Data Lokal (localStorage)
          </h3>
          <p className="text-xs text-[#A7A7A7] mt-1">
            Data disimpan secara lokal di browser ini. Untuk operasional multi-perangkat atau
            multi-admin, hubungkan ke backend dan database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-[#FFC247]" aria-hidden="true" />
            <span>Export Data JSON</span>
          </button>

          <label className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
            <span>Import Data JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D71920]/15 hover:bg-[#D71920]/25 border border-[#D71920]/40 text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-medium transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-[#D71920]" aria-hidden="true" />
            <span>Reset Data Demo</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        open={resetModalOpen}
        title="Reset Data Demo"
        description="Seluruh produk, kategori, pesanan, promosi, dan pengaturan toko akan dikembalikan ke data demo awal. Lanjutkan?"
        confirmLabel="Ya, Reset Data"
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetModalOpen(false);
        }}
      />
    </div>
  );
};
