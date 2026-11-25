import React, { useState } from 'react';
import {
  Boxes,
  ClipboardList,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tag,
  UserCog,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminAccountSettings } from './AdminAccountSettings';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminLogin } from './AdminLogin';
import { AdminOrders } from './AdminOrders';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminPromotions } from './AdminPromotions';
import { AdminSettings } from './AdminSettings';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'promotions'
  | 'inventory'
  | 'settings'
  | 'account';

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'categories', label: 'Kategori', icon: FolderTree },
  { id: 'orders', label: 'Pesanan', icon: ClipboardList },
  { id: 'promotions', label: 'Promosi', icon: Tag },
  { id: 'inventory', label: 'Inventori', icon: Boxes },
  { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
  { id: 'account', label: 'Pengaturan Admin', icon: UserCog },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { adminSession, logoutAdmin, settings, orders } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!adminSession) {
    return <AdminLogin onBackToStore={onBackToStore} />;
  }

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Menunggu konfirmasi'
  ).length;

  const activeLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'Overview';

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#161616] border-r border-white/10">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wider text-[#FFF4E8]">
            {settings.logoText || settings.brandName}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-[#F15A24] font-semibold">
            Admin Console
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="lg:hidden p-1.5 text-[#A7A7A7] hover:text-[#FFF4E8]"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Menu Admin" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#D71920] text-[#FFF4E8]'
                  : 'text-[#A7A7A7] hover:text-[#FFF4E8] hover:bg-white/5'
              }`}
            >
              <span className="inline-flex items-center gap-3 truncate">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'orders' && pendingOrdersCount > 0 && (
                <span className="font-mono text-[11px] bg-[#FFC247] text-[#111111] font-bold px-1.5 py-0.5 rounded tabular-nums">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          type="button"
          onClick={logoutAdmin}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium text-[#A7A7A7] hover:text-[#D71920] hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111] text-[#FFF4E8] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[80vw] h-full z-10">{SidebarContent}</aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[#111111]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 text-[#FFF4E8] hover:bg-white/10 rounded-md"
              aria-label="Buka menu navigasi admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-[#A7A7A7] hidden sm:inline">Admin</span>
              <span className="text-[#A7A7A7] hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#FFF4E8] truncate">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-[#A7A7A7]">
              Masuk sebagai <strong className="text-[#FFC247]">{adminSession.username}</strong>
            </span>
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#282828] border border-white/15 text-[#FFF4E8] px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Lihat Toko</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverview onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />
          )}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'promotions' && <AdminPromotions />}
          {activeTab === 'inventory' && <AdminInventory />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'account' && <AdminAccountSettings />}
        </main>
      </div>
    </div>
  );
};
