import React, { useMemo, useState } from 'react';
import { Eye, Printer, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatRupiah } from '../../utils/catalog';
import { ConfirmModal } from '../ui/ConfirmModal';

const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu konfirmasi',
  'Diproses',
  'Siap diambil',
  'Dalam pengiriman',
  'Selesai',
  'Dibatalkan',
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  'Belum dibayar',
  'Menunggu pembayaran',
  'Lunas',
  'Dikembalikan',
];

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
      if (dateFilter && !o.createdAt.startsWith(dateFilter)) return false;
      if (
        q &&
        !o.id.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerPhone.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const handlePrintOrder = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
          Manajemen Pesanan
        </h2>
        <p className="text-sm text-[#A7A7A7]">
          Pesanan dari checkout WhatsApp dicatat sebagai draft lokal yang menunggu konfirmasi
          pembayaran dan pemrosesan manual oleh admin.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search
            className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID pesanan, nama pelanggan, atau nomor..."
            className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md pl-10 pr-4 py-2 text-sm text-[#FFF4E8]"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status pesanan"
            className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          >
            <option value="all">Semua Status ({orders.length})</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter tanggal pesanan"
            className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1C1C1C] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#161616] text-left text-xs uppercase text-[#A7A7A7]">
                <th className="py-3 px-4 font-medium">ID Pesanan</th>
                <th className="py-3 px-4 font-medium">Pelanggan</th>
                <th className="py-3 px-4 font-medium">Tanggal</th>
                <th className="py-3 px-4 font-medium">Produk</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium">Metode</th>
                <th className="py-3 px-4 font-medium">Pembayaran</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-mono text-xs text-[#FFC247] whitespace-nowrap">
                    {order.id}
                    {order.isLocalDraft && (
                      <span className="block text-[10px] text-[#A7A7A7] font-sans">
                        Draft WA
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium text-[#FFF4E8]">{order.customerName}</p>
                    <p className="text-xs font-mono text-[#A7A7A7]">{order.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#A7A7A7] whitespace-nowrap tabular-nums">
                    {new Date(order.createdAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#A7A7A7] max-w-[200px] truncate">
                    {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#FFC247] tabular-nums whitespace-nowrap">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#FFF4E8] whitespace-nowrap">
                    {order.method}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          order.orderStatus,
                          e.target.value as PaymentStatus
                        )
                      }
                      aria-label={`Status pembayaran ${order.id}`}
                      className="bg-[#111111] border border-white/10 rounded px-2 py-1 text-xs text-[#FFF4E8]"
                    >
                      {PAYMENT_STATUSES.map((ps) => (
                        <option key={ps} value={ps}>
                          {ps}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      aria-label={`Status pesanan ${order.id}`}
                      className="bg-[#111111] border border-white/10 rounded px-2 py-1 text-xs text-[#FFF4E8]"
                    >
                      {ORDER_STATUSES.map((os) => (
                        <option key={os} value={os}>
                          {os}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="p-2 text-[#A7A7A7] hover:text-[#FFF4E8] rounded hover:bg-white/5"
                        aria-label={`Detail pesanan ${order.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(order)}
                        className="p-2 text-[#A7A7A7] hover:text-[#D71920] rounded hover:bg-white/5"
                        aria-label={`Hapus pesanan ${order.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#A7A7A7]">
                    <p className="font-medium text-[#FFF4E8]">Belum ada pesanan tercatat</p>
                    <p className="text-xs mt-1">
                      Pesanan baru dari checkout WhatsApp customer akan otomatis muncul di sini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Print Modal */}
      {detailOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Detail Pesanan"
        >
          <div className="w-full max-w-lg bg-[#1C1C1C] border border-white/15 rounded-xl p-6 text-[#FFF4E8] space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-2xl uppercase">Struk Pesanan</h3>
                <p className="font-mono text-xs text-[#FFC247]">{detailOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="text-[#A7A7A7] hover:text-[#FFF4E8] p-1"
                aria-label="Tutup detail pesanan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span className="text-[#A7A7A7]">Pelanggan:</span> {detailOrder.customerName}
              </p>
              <p>
                <span className="text-[#A7A7A7]">Telepon:</span>{' '}
                <span className="font-mono">{detailOrder.customerPhone}</span>
              </p>
              <p>
                <span className="text-[#A7A7A7]">Metode:</span> {detailOrder.method}
              </p>
              <p>
                <span className="text-[#A7A7A7]">Alamat:</span> {detailOrder.customerAddress}
              </p>
              <p>
                <span className="text-[#A7A7A7]">Catatan:</span> {detailOrder.notes || '-'}
              </p>
            </div>

            <div className="border-t border-b border-white/10 py-3 space-y-2 text-sm">
              {detailOrder.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex justify-between gap-2">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#A7A7A7]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(detailOrder.subtotal)}
                </span>
              </div>
              {detailOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#25D366]">
                  <span>Diskon {detailOrder.promoCode ? `(${detailOrder.promoCode})` : ''}</span>
                  <span className="font-mono tabular-nums">
                    -{formatRupiah(detailOrder.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span className="font-mono text-[#FFC247] tabular-nums">
                  {formatRupiah(detailOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintOrder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm font-medium"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Cetak Detail</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2 bg-[#D71920] hover:bg-[#B8141A] rounded-md text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Pesanan"
        description={`Yakin ingin menghapus catatan pesanan ${deleteTarget?.id ?? ''}?`}
        confirmLabel="Hapus Pesanan"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteOrder(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
