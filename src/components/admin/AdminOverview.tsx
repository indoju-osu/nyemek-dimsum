import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, Package, TrendingUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../utils/catalog';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { products, orders, categories } = useStore();

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0).length;
    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock
    ).length;

    const totalOrders = orders.length;
    const newOrders = orders.filter(
      (o) => o.orderStatus === 'Menunggu konfirmasi'
    ).length;
    const validOrders = orders.filter((o) => o.orderStatus !== 'Dibatalkan');
    const estimatedRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Best-selling products strictly computed from real recorded orders
    const salesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        salesMap[item.productId].qty += item.quantity;
        salesMap[item.productId].revenue += item.lineTotal;
      }
    }
    const topProducts = Object.values(salesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const categoryBreakdown = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: products.filter((p) => p.categoryId === cat.id).length,
    }));

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      totalOrders,
      newOrders,
      recordedTransactions: validOrders.length,
      estimatedRevenue,
      topProducts,
      categoryBreakdown,
    };
  }, [products, orders, categories]);

  const maxCatCount = Math.max(1, ...metrics.categoryBreakdown.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
            Ringkasan Toko
          </h2>
          <p className="text-sm text-[#A7A7A7]">
            Seluruh metrik dihitung langsung dari data katalog dan pesanan yang tersimpan.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-[#A7A7A7] uppercase tracking-wider">
            <span>Total Produk</span>
            <Package className="w-4 h-4 text-[#FFC247]" aria-hidden="true" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#FFF4E8] mt-2 tabular-nums">
            {metrics.totalProducts}
          </p>
          <p className="text-xs text-[#A7A7A7] mt-1 tabular-nums">
            {metrics.activeProducts} aktif · {metrics.outOfStockProducts} habis
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-[#A7A7A7] uppercase tracking-wider">
            <span>Total Pesanan</span>
            <ClipboardList className="w-4 h-4 text-[#F15A24]" aria-hidden="true" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#FFF4E8] mt-2 tabular-nums">
            {metrics.totalOrders}
          </p>
          <p className="text-xs text-[#FFC247] mt-1 tabular-nums">
            {metrics.newOrders} menunggu konfirmasi
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-[#A7A7A7] uppercase tracking-wider">
            <span>Transaksi Tercatat</span>
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#FFF4E8] mt-2 tabular-nums">
            {metrics.recordedTransactions}
          </p>
          <p className="text-xs text-[#A7A7A7] mt-1">
            {metrics.recordedTransactions === 0
              ? 'Belum ada transaksi tercatat'
              : 'Pesanan aktif & selesai'}
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-[#A7A7A7] uppercase tracking-wider">
            <span>Estimasi Pendapatan</span>
            <TrendingUp className="w-4 h-4 text-[#FFC247]" aria-hidden="true" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#FFC247] mt-2 tabular-nums">
            {formatRupiah(metrics.estimatedRevenue)}
          </p>
          <p className="text-xs text-[#A7A7A7] mt-1">Dari pesanan non-batal</p>
        </div>
      </div>

      {/* Secondary Panels: Best Sellers + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#1C1C1C] border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-[#FFF4E8]">
              Produk Terlaris
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-medium text-[#FFC247] hover:underline"
            >
              Lihat Pesanan
            </button>
          </div>

          {metrics.topProducts.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-white/10 rounded-lg">
              <p className="text-sm font-medium text-[#FFF4E8]">Belum ada data penjualan</p>
              <p className="text-xs text-[#A7A7A7] mt-1">
                Daftar produk terlaris akan terisi otomatis saat ada pesanan masuk dari pelanggan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase text-[#A7A7A7]">
                    <th className="pb-2.5 font-medium">Produk</th>
                    <th className="pb-2.5 font-medium text-right">Terjual</th>
                    <th className="pb-2.5 font-medium text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics.topProducts.map((item) => (
                    <tr key={item.name}>
                      <td className="py-3 text-[#FFF4E8] font-medium">{item.name}</td>
                      <td className="py-3 text-right font-mono tabular-nums text-[#FFF4E8]">
                        {item.qty}
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums text-[#FFC247]">
                        {formatRupiah(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#1C1C1C] border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-[#FFF4E8]">
              Distribusi Kategori
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-medium text-[#F15A24] hover:underline"
            >
              Cek Inventori
            </button>
          </div>

          <div className="space-y-3.5">
            {metrics.categoryBreakdown.map((cat) => {
              const widthPct = Math.round((cat.count / maxCatCount) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#FFF4E8]">{cat.name}</span>
                    <span className="font-mono text-[#A7A7A7] tabular-nums">
                      {cat.count} produk
                    </span>
                  </div>
                  <div className="h-2 bg-[#111111] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D71920] rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {(metrics.lowStockProducts > 0 || metrics.outOfStockProducts > 0) && (
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#FFC247]">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">
                {metrics.lowStockProducts} produk stok menipis, {metrics.outOfStockProducts} habis.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
