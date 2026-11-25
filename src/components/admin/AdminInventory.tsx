import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminInventory: React.FC = () => {
  const { products, inventoryLogs, adjustStock } = useStore();
  const [reasonInput, setReasonInput] = useState('Restok dapur harian');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
            Manajemen Inventori
          </h2>
          <p className="text-sm text-[#A7A7A7]">
            Pantau status ketersediaan stok dan catat setiap penambahan atau pengurangan.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label htmlFor="inv-reason" className="block text-xs text-[#A7A7A7] mb-1">
            Alasan Penyesuaian Default
          </label>
          <input
            id="inv-reason"
            type="text"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-md px-3 py-2 text-xs text-[#FFF4E8]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#161616] text-left text-xs uppercase text-[#A7A7A7]">
                <th className="py-3 px-4 font-medium">Nama Produk</th>
                <th className="py-3 px-4 font-medium text-right">Stok Tersedia</th>
                <th className="py-3 px-4 font-medium text-right">Stok Minimum</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Kontrol Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => {
                const status =
                  product.stock <= 0
                    ? { label: 'Habis', color: 'text-[#D71920]' }
                    : product.stock <= product.minStock
                    ? { label: 'Stok menipis', color: 'text-[#FFC247]' }
                    : { label: 'Tersedia', color: 'text-[#25D366]' };

                return (
                  <tr key={product.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-medium text-[#FFF4E8]">{product.name}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      {product.stock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#A7A7A7]">
                      {product.minStock}
                    </td>
                    <td className={`py-3 px-4 text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, -5, reasonInput)}
                          disabled={product.stock <= 0}
                          className="px-2 py-1 bg-[#111111] border border-white/10 hover:border-white/25 rounded text-xs font-mono disabled:opacity-40"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, -1, reasonInput)}
                          disabled={product.stock <= 0}
                          className="p-1.5 bg-[#111111] border border-white/10 hover:border-white/25 rounded disabled:opacity-40"
                          aria-label={`Kurangi stok ${product.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, 1, reasonInput)}
                          className="p-1.5 bg-[#111111] border border-white/10 hover:border-white/25 rounded"
                          aria-label={`Tambah stok ${product.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, 10, reasonInput)}
                          className="px-2 py-1 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] rounded text-xs font-mono font-semibold"
                        >
                          +10
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

      {/* History Log */}
      <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-6">
        <h3 className="font-display text-xl uppercase tracking-wide text-[#FFF4E8] mb-4">
          Riwayat Perubahan Stok
        </h3>
        {inventoryLogs.length === 0 ? (
          <p className="text-sm text-[#A7A7A7]">
            Belum ada riwayat perubahan stok pada sesi ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left uppercase text-[#A7A7A7]">
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4">Produk</th>
                  <th className="py-2 pr-4 text-right">Perubahan</th>
                  <th className="py-2 pr-4 text-right">Stok Akhir</th>
                  <th className="py-2">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventoryLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-4 text-[#A7A7A7] tabular-nums whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 pr-4 text-[#FFF4E8] font-medium">{log.productName}</td>
                    <td
                      className={`py-2 pr-4 text-right font-mono tabular-nums font-bold ${
                        log.change > 0 ? 'text-[#25D366]' : 'text-[#D71920]'
                      }`}
                    >
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums">{log.newStock}</td>
                    <td className="py-2 text-[#A7A7A7]">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
