/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/store/CartDrawer';
import { CatalogSection } from './components/store/CatalogSection';
import { EditorialShowcase } from './components/store/EditorialShowcase';
import { HeroSection } from './components/store/HeroSection';
import { PromoSection } from './components/store/PromoSection';
import { StoreFooter } from './components/store/StoreFooter';
import { StoreHeader } from './components/store/StoreHeader';
import { StoreInfoSection } from './components/store/StoreInfoSection';
import { ToastContainer } from './components/ui/ToastContainer';
import { StoreProvider } from './context/StoreContext';

type AppRoute = 'store' | 'admin';

function resolveRouteFromLocation(): AppRoute {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return 'admin';
  }
  return 'store';
}

const NyemekAppContent: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(() => resolveRouteFromLocation());
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCodeForCart, setPromoCodeForCart] = useState('');
  const [externalCategory, setExternalCategory] = useState<string>('');

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (target: AppRoute) => {
    setRoute(target);
    const nextPath = target === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPromoFromBanner = (code: string) => {
    setPromoCodeForCart(code);
    setCartOpen(true);
  };

  const handleSelectBundleCategory = () => {
    setExternalCategory('cat-paket');
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {route === 'admin' ? (
        <AdminDashboard onBackToStore={() => navigateTo('store')} />
      ) : (
        <div className="min-h-screen bg-[#111111] text-[#FFF4E8] flex flex-col">
          <StoreHeader
            onOpenCart={() => setCartOpen(true)}
            onNavigateAdmin={() => navigateTo('admin')}
          />

          <main className="flex-1">
            <HeroSection onQuickOrder={() => setCartOpen(true)} />

            <CatalogSection
              externalCategoryFilter={externalCategory}
              onClearExternalCategory={() => setExternalCategory('')}
            />

            <EditorialShowcase />

            <PromoSection
              onSelectBundleCategory={handleSelectBundleCategory}
              onApplyPromoCode={handleApplyPromoFromBanner}
            />

            <StoreInfoSection />
          </main>

          <StoreFooter onNavigateAdmin={() => navigateTo('admin')} />

          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            initialPromoCode={promoCodeForCart}
          />
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <NyemekAppContent />
    </StoreProvider>
  );
}
