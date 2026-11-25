import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_INVENTORY_LOGS,
  DEFAULT_ORDERS,
  DEFAULT_PRODUCTS,
  DEFAULT_PROMOTIONS,
  DEFAULT_STORE_SETTINGS,
} from '../data/defaultData';
import {
  AdminAccount,
  AdminSession,
  CartItem,
  Category,
  InventoryLog,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Promotion,
  StoreSettings,
} from '../types';
import {
  createUpdatedAdminAccount,
  getDefaultAdminAccount,
  verifyAdminCredentials,
} from '../utils/auth';
import { addToCart, removeFromCart, updateCartQuantity } from '../utils/cart';
import {
  loadStoreState,
  parseImportJson,
  resetAllDemoStorage,
  STORAGE_KEYS,
  writeLocalStorage,
} from '../utils/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  settings: StoreSettings;
  orders: Order[];
  promotions: Promotion[];
  inventoryLogs: InventoryLog[];
  adminSession: AdminSession | null;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Cart actions
  addProductToCart: (product: Product, qty?: number) => boolean;
  setCartItemQty: (productId: string, qty: number) => void;
  removeCartItem: (productId: string) => void;
  clearCart: () => void;

  // Order actions
  createLocalDraftOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Product CRUD
  saveProduct: (product: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Product;
  deleteProduct: (productId: string) => void;
  toggleProductActive: (productId: string) => void;

  // Category CRUD
  saveCategory: (category: Omit<Category, 'id' | 'slug'> & { id?: string }) => Category;
  deleteCategory: (categoryId: string, reassignCategoryId?: string) => { ok: boolean; error?: string };

  // Inventory actions
  adjustStock: (productId: string, delta: number, reason: string) => void;

  // Promotion CRUD
  savePromotion: (promo: Omit<Promotion, 'id'> & { id?: string }) => Promotion;
  deletePromotion: (promoId: string) => void;
  togglePromotionActive: (promoId: string) => void;

  // Settings
  updateSettings: (nextSettings: StoreSettings) => void;

  // Admin auth
  loginAdmin: (username: string, password: string) => { ok: boolean; error?: string };
  logoutAdmin: () => void;
  updateAdminCredentials: (
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ) => { ok: boolean; error?: string };
  currentAdminUsername: string;

  // Data management
  importDataJson: (jsonString: string) => { ok: boolean; error?: string };
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState(() => loadStoreState());
  const [products, setProducts] = useState<Product[]>(initial.products);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [cart, setCart] = useState<CartItem[]>(initial.cart);
  const [settings, setSettings] = useState<StoreSettings>(initial.settings);
  const [orders, setOrders] = useState<Order[]>(initial.orders);
  const [promotions, setPromotions] = useState<Promotion[]>(initial.promotions);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initial.inventoryLogs);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(initial.adminSession);
  const [adminAccount, setAdminAccount] = useState<AdminAccount>(initial.adminAccount);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.cart, cart);
  }, [cart]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.orders, orders);
  }, [orders]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.promotions, promotions);
  }, [promotions]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.inventory, inventoryLogs);
  }, [inventoryLogs]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.adminSession, adminSession);
  }, [adminSession]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.adminAccount, adminAccount);
  }, [adminAccount]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast]
  );

  const addProductToCart = useCallback(
    (product: Product, qty = 1): boolean => {
      const result = addToCart(cart, product, qty);
      setCart(result.cart);
      if (result.error) {
        showToast(result.error, result.cart === cart ? 'error' : 'info');
        return result.cart !== cart;
      }
      showToast(`${product.name} ditambahkan ke keranjang.`, 'success');
      return true;
    },
    [cart, showToast]
  );

  const setCartItemQty = useCallback(
    (productId: string, qty: number) => {
      const product = products.find((p) => p.id === productId);
      const maxStock = product ? product.stock : undefined;
      const result = updateCartQuantity(cart, productId, qty, maxStock);
      setCart(result.cart);
      if (result.error) {
        showToast(result.error, 'info');
      }
    },
    [cart, products, showToast]
  );

  const removeCartItem = useCallback(
    (productId: string) => {
      setCart((prev) => removeFromCart(prev, productId));
      showToast('Produk dihapus dari keranjang.', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const createLocalDraftOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
      const uniqueId = `NYM-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 5)
        .toUpperCase()}`;
      const newOrder: Order = {
        ...orderData,
        id: uniqueId,
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const updateOrderStatus = useCallback(
    (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus,
                paymentStatus: paymentStatus ?? order.paymentStatus,
              }
            : order
        )
      );
      showToast(`Status pesanan ${orderId} diperbarui.`, 'success');
    },
    [showToast]
  );

  const deleteOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Pesanan ${orderId} dihapus.`, 'info');
    },
    [showToast]
  );

  const saveProduct = useCallback(
    (input: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Product => {
      if (input.id) {
        let updated: Product | null = null;
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === input.id) {
              updated = { ...p, ...input, id: p.id, createdAt: p.createdAt };
              return updated;
            }
            return p;
          })
        );
        showToast(`Produk "${input.name}" berhasil diperbarui.`, 'success');
        return (
          updated ?? {
            ...input,
            id: input.id,
            createdAt: new Date().toISOString(),
          }
        );
      }

      const newProduct: Product = {
        ...input,
        id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Produk "${newProduct.name}" ditambahkan.`, 'success');
      return newProduct;
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      showToast('Produk dihapus dari katalog.', 'info');
    },
    [showToast]
  );

  const toggleProductActive = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
      );
    },
    []
  );

  const saveCategory = useCallback(
    (input: Omit<Category, 'id' | 'slug'> & { id?: string }): Category => {
      const slug = input.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (input.id) {
        const updated: Category = {
          id: input.id,
          name: input.name.trim(),
          slug,
          description: input.description.trim(),
        };
        setCategories((prev) => prev.map((c) => (c.id === input.id ? updated : c)));
        showToast(`Kategori "${updated.name}" diperbarui.`, 'success');
        return updated;
      }

      const newCat: Category = {
        id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        name: input.name.trim(),
        slug: slug || `kat-${Date.now()}`,
        description: input.description.trim(),
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`Kategori "${newCat.name}" ditambahkan.`, 'success');
      return newCat;
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (
      categoryId: string,
      reassignCategoryId?: string
    ): { ok: boolean; error?: string } => {
      const usedProducts = products.filter((p) => p.categoryId === categoryId);
      if (usedProducts.length > 0) {
        if (!reassignCategoryId || reassignCategoryId === categoryId) {
          return {
            ok: false,
            error: `Kategori masih dipakai oleh ${usedProducts.length} produk. Pilih kategori pengganti terlebih dahulu.`,
          };
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.categoryId === categoryId ? { ...p, categoryId: reassignCategoryId } : p
          )
        );
      }
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      showToast('Kategori berhasil dihapus.', 'info');
      return { ok: true };
    },
    [products, showToast]
  );

  const adjustStock = useCallback(
    (productId: string, delta: number, reason: string) => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;
      const previousStock = target.stock;
      const newStock = Math.max(0, previousStock + delta);
      const actualDelta = newStock - previousStock;
      if (actualDelta === 0 && delta !== 0) {
        showToast('Stok sudah 0, tidak dapat dikurangi lagi.', 'error');
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );

      const log: InventoryLog = {
        id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        productId: target.id,
        productName: target.name,
        change: actualDelta,
        previousStock,
        newStock,
        reason: reason.trim() || (actualDelta > 0 ? 'Restok manual' : 'Penyesuaian stok'),
        createdAt: new Date().toISOString(),
      };
      setInventoryLogs((prev) => [log, ...prev].slice(0, 100));
      showToast(`Stok ${target.name} diperbarui menjadi ${newStock}.`, 'success');
    },
    [products, showToast]
  );

  const savePromotion = useCallback(
    (input: Omit<Promotion, 'id'> & { id?: string }): Promotion => {
      const cleanCode = input.code.trim().toUpperCase();
      if (input.id) {
        const updated: Promotion = { ...input, id: input.id, code: cleanCode };
        setPromotions((prev) => prev.map((pr) => (pr.id === input.id ? updated : pr)));
        showToast(`Promo "${updated.code}" diperbarui.`, 'success');
        return updated;
      }
      const created: Promotion = {
        ...input,
        id: `promo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        code: cleanCode,
      };
      setPromotions((prev) => [created, ...prev]);
      showToast(`Promo "${created.code}" ditambahkan.`, 'success');
      return created;
    },
    [showToast]
  );

  const deletePromotion = useCallback(
    (promoId: string) => {
      setPromotions((prev) => prev.filter((p) => p.id !== promoId));
      showToast('Promo dihapus.', 'info');
    },
    [showToast]
  );

  const togglePromotionActive = useCallback((promoId: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, isActive: !p.isActive } : p))
    );
  }, []);

  const updateSettings = useCallback(
    (nextSettings: StoreSettings) => {
      setSettings(nextSettings);
      showToast('Pengaturan toko berhasil disimpan.', 'success');
    },
    [showToast]
  );

  const loginAdmin = useCallback(
    (username: string, password: string): { ok: boolean; error?: string } => {
      if (!username.trim() || !password) {
        return { ok: false, error: 'Username dan password wajib diisi.' };
      }
      const valid = verifyAdminCredentials(username, password, adminAccount);
      if (!valid) {
        return { ok: false, error: 'Username atau password tidak sesuai.' };
      }
      const session: AdminSession = {
        username: adminAccount.username,
        loggedInAt: new Date().toISOString(),
        isDemoSession: true,
      };
      setAdminSession(session);
      showToast(`Selamat datang, ${adminAccount.username}.`, 'success');
      return { ok: true };
    },
    [adminAccount, showToast]
  );

  const logoutAdmin = useCallback(() => {
    setAdminSession(null);
    showToast('Anda telah keluar dari Admin Dashboard.', 'info');
  }, [showToast]);

  const updateAdminCredentials = useCallback(
    (
      currentPassword: string,
      newUsername: string,
      newPassword: string
    ): { ok: boolean; error?: string } => {
      if (!verifyAdminCredentials(adminAccount.username, currentPassword, adminAccount)) {
        return { ok: false, error: 'Password saat ini salah.' };
      }
      if (!newUsername.trim() || newUsername.trim().length < 3) {
        return { ok: false, error: 'Username baru minimal 3 karakter.' };
      }
      if (!newPassword || newPassword.length < 4) {
        return { ok: false, error: 'Password baru minimal 4 karakter.' };
      }
      const updated = createUpdatedAdminAccount(newUsername, newPassword);
      setAdminAccount(updated);
      setAdminSession({
        username: updated.username,
        loggedInAt: new Date().toISOString(),
        isDemoSession: true,
      });
      showToast('Kredensial admin demo berhasil diperbarui.', 'success');
      return { ok: true };
    },
    [adminAccount, showToast]
  );

  const importDataJson = useCallback(
    (jsonString: string): { ok: boolean; error?: string } => {
      const parsed = parseImportJson(jsonString);
      if (!parsed.valid || !parsed.data) {
        return { ok: false, error: parsed.error ?? 'Import gagal.' };
      }
      setCategories(parsed.data.categories);
      setProducts(parsed.data.products);
      setPromotions(parsed.data.promotions);
      setOrders(parsed.data.orders);
      setInventoryLogs(parsed.data.inventoryLogs);
      setSettings(parsed.data.settings);
      showToast('Data JSON berhasil diimpor dan divalidasi.', 'success');
      return { ok: true };
    },
    [showToast]
  );

  const resetDemo = useCallback(() => {
    resetAllDemoStorage();
    setCategories(DEFAULT_CATEGORIES);
    setProducts(DEFAULT_PRODUCTS);
    setPromotions(DEFAULT_PROMOTIONS);
    setOrders(DEFAULT_ORDERS);
    setInventoryLogs(DEFAULT_INVENTORY_LOGS);
    setSettings(DEFAULT_STORE_SETTINGS);
    setCart([]);
    setAdminAccount(getDefaultAdminAccount());
    showToast('Data demo dikembalikan ke pengaturan awal.', 'info');
  }, [showToast]);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        settings,
        orders,
        promotions,
        inventoryLogs,
        adminSession,
        toasts,
        showToast,
        dismissToast,
        addProductToCart,
        setCartItemQty,
        removeCartItem,
        clearCart,
        createLocalDraftOrder,
        updateOrderStatus,
        deleteOrder,
        saveProduct,
        deleteProduct,
        toggleProductActive,
        saveCategory,
        deleteCategory,
        adjustStock,
        savePromotion,
        deletePromotion,
        togglePromotionActive,
        updateSettings,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        currentAdminUsername: adminAccount.username,
        importDataJson,
        resetDemo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
