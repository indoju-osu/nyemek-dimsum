import React, { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { validateCategory } from '../../utils/validation';
import { ConfirmModal } from '../ui/ConfirmModal';

export const AdminCategories: React.FC = () => {
  const { categories, products, saveCategory, deleteCategory, showToast } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignId, setReassignId] = useState('');

  const startCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setError('');
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otherNames = categories
      .filter((c) => c.id !== editing?.id)
      .map((c) => c.name);
    const validation = validateCategory({ name, description }, otherNames);
    if (!validation.valid) {
      setError(validation.errors.name || 'Kategori tidak valid.');
      return;
    }

    saveCategory({
      id: editing?.id,
      name,
      description,
    });
    startCreate();
  };

  const openDeleteDialog = (cat: Category) => {
    const others = categories.filter((c) => c.id !== cat.id);
    if (others.length === 0) {
      showToast('Minimal harus ada 1 kategori tersisa.', 'error');
      return;
    }
    setDeleteTarget(cat);
    setReassignId(others[0].id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteCategory(deleteTarget.id, reassignId);
    if (!res.ok && res.error) {
      showToast(res.error, 'error');
      return;
    }
    setDeleteTarget(null);
  };

  const affectedCount = deleteTarget
    ? products.filter((p) => p.categoryId === deleteTarget.id).length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
          Manajemen Kategori
        </h2>
        <p className="text-sm text-[#A7A7A7]">
          Atur kategori menu. Kategori yang masih memiliki produk wajib dialihkan sebelum dihapus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-[#1C1C1C] border border-white/10 rounded-lg p-6 space-y-4 self-start"
        >
          <h3 className="font-display text-xl uppercase text-[#FFF4E8]">
            {editing ? `Edit Kategori: ${editing.name}` : 'Tambah Kategori Baru'}
          </h3>

          <div>
            <label htmlFor="cat-name" className="block text-xs text-[#A7A7A7] mb-1">
              Nama Kategori *
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dimsum Kuah"
              className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
            {error && <p className="text-xs text-[#D71920] mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="cat-desc" className="block text-xs text-[#A7A7A7] mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan kategori menu..."
              className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-4 py-2 rounded-md text-sm font-semibold"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{editing ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
            </button>
            {editing && (
              <button
                type="button"
                onClick={startCreate}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm rounded-md"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="lg:col-span-7 bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#161616] text-left text-xs uppercase text-[#A7A7A7]">
                <th className="py-3 px-4 font-medium">Nama Kategori</th>
                <th className="py-3 px-4 font-medium text-right">Jumlah Produk</th>
                <th className="py-3 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#FFF4E8]">{cat.name}</p>
                      <p className="text-xs text-[#A7A7A7]">{cat.description || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#FFC247]">
                      {count}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-2 text-[#A7A7A7] hover:text-[#FFC247] rounded hover:bg-white/5"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(cat)}
                          className="p-2 text-[#A7A7A7] hover:text-[#D71920] rounded hover:bg-white/5"
                          aria-label={`Hapus ${cat.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Kategori"
        description={
          affectedCount > 0
            ? `Kategori "${deleteTarget?.name}" masih memiliki ${affectedCount} produk. Pilih kategori pengganti agar produk tidak hilang.`
            : `Yakin ingin menghapus kategori "${deleteTarget?.name}"?`
        }
        confirmLabel="Hapus Kategori"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        {affectedCount > 0 && deleteTarget && (
          <div className="mt-2">
            <label htmlFor="reassign-cat" className="block text-xs text-[#A7A7A7] mb-1">
              Pindahkan {affectedCount} produk ke kategori:
            </label>
            <select
              id="reassign-cat"
              value={reassignId}
              onChange={(e) => setReassignId(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            >
              {categories
                .filter((c) => c.id !== deleteTarget.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};
