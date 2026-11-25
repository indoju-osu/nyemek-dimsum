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
  Product,
  Promotion,
  StoreSettings,
} from '../types';
import { getDefaultAdminAccount } from './auth';
import { clampSpiceLevel, isSafeHttpUrl } from './validation';

export const STORAGE_KEYS = {
  products: 'nyemek_products',
  categories: 'nyemek_categories',
  cart: 'nyemek_cart',
  settings: 'nyemek_settings',
  orders: 'nyemek_orders',
  promotions: 'nyemek_promotions',
  inventory: 'nyemek_inventory',
  adminSession: 'nyemek_admin_session',
  adminAccount: 'nyemek_admin_account',
} as const;

function getBrowserStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Safely parses JSON from localStorage with schema validation and fallback handling.
 */
export function parseLocalStorage<T>(
  raw: string | null,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (validator(parsed)) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): boolean {
  const storage = getBrowserStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isCategoryArray(data: unknown): data is Category[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Category).id === 'string' &&
      typeof (item as Category).name === 'string' &&
      typeof (item as Category).slug === 'string'
  );
}

export function isProductArray(data: unknown): data is Product[] {
  if (!Array.isArray(data)) return false;
  return data.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const p = item as Product;
    return (
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      typeof p.categoryId === 'string' &&
      typeof p.price === 'number' &&
      p.price > 0 &&
      typeof p.stock === 'number' &&
      p.stock >= 0 &&
      typeof p.spiceLevel === 'number'
    );
  });
}

export function isCartArray(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) return false;
  return data.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const c = item as CartItem;
    return (
      typeof c.productId === 'string' &&
      typeof c.name === 'string' &&
      typeof c.price === 'number' &&
      typeof c.quantity === 'number' &&
      c.quantity > 0
    );
  });
}

export function isOrderArray(data: unknown): data is Order[] {
  if (!Array.isArray(data)) return false;
  return data.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const o = item as Order;
    return (
      typeof o.id === 'string' &&
      typeof o.customerName === 'string' &&
      Array.isArray(o.items) &&
      typeof o.total === 'number'
    );
  });
}

export function isPromotionArray(data: unknown): data is Promotion[] {
  if (!Array.isArray(data)) return false;
  return data.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const pr = item as Promotion;
    return (
      typeof pr.id === 'string' &&
      typeof pr.name === 'string' &&
      typeof pr.code === 'string'
    );
  });
}

export function isInventoryLogArray(data: unknown): data is InventoryLog[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as InventoryLog).id === 'string' &&
      typeof (item as InventoryLog).productId === 'string'
  );
}

export function isStoreSettings(data: unknown): data is StoreSettings {
  if (typeof data !== 'object' || data === null) return false;
  const s = data as StoreSettings;
  return (
    typeof s.brandName === 'string' &&
    typeof s.whatsappNumber === 'string' &&
    typeof s.address === 'string'
  );
}

export function isAdminSession(data: unknown): data is AdminSession | null {
  if (data === null) return true;
  if (typeof data !== 'object') return false;
  const s = data as AdminSession;
  return typeof s.username === 'string' && typeof s.loggedInAt === 'string';
}

export function isAdminAccount(data: unknown): data is AdminAccount {
  if (typeof data !== 'object' || data === null) return false;
  const a = data as AdminAccount;
  return (
    typeof a.username === 'string' &&
    typeof a.salt === 'string' &&
    typeof a.passwordHash === 'string'
  );
}

export function loadStoreState() {
  const storage = getBrowserStorage();
  const categories = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.categories) ?? null,
    isCategoryArray,
    DEFAULT_CATEGORIES
  );
  const products = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.products) ?? null,
    isProductArray,
    DEFAULT_PRODUCTS
  ).map((p) => ({
    ...p,
    spiceLevel: clampSpiceLevel(p.spiceLevel),
    image: p.image && isSafeHttpUrl(p.image) ? p.image : DEFAULT_PRODUCTS[0].image,
  }));
  const cart = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.cart) ?? null,
    isCartArray,
    []
  );
  const settings = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.settings) ?? null,
    isStoreSettings,
    DEFAULT_STORE_SETTINGS
  );
  const orders = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.orders) ?? null,
    isOrderArray,
    DEFAULT_ORDERS
  );
  const promotions = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.promotions) ?? null,
    isPromotionArray,
    DEFAULT_PROMOTIONS
  );
  const inventoryLogs = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.inventory) ?? null,
    isInventoryLogArray,
    DEFAULT_INVENTORY_LOGS
  );
  const adminSession = parseLocalStorage<AdminSession | null>(
    storage?.getItem(STORAGE_KEYS.adminSession) ?? null,
    isAdminSession,
    null
  );
  const adminAccount = parseLocalStorage(
    storage?.getItem(STORAGE_KEYS.adminAccount) ?? null,
    isAdminAccount,
    getDefaultAdminAccount()
  );

  return {
    categories,
    products,
    cart,
    settings,
    orders,
    promotions,
    inventoryLogs,
    adminSession,
    adminAccount,
  };
}

export interface ExportedStorePayload {
  version: number;
  exportedAt: string;
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
  settings: StoreSettings;
}

export function buildExportJson(data: Omit<ExportedStorePayload, 'version' | 'exportedAt'>): string {
  const payload: ExportedStorePayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportJson(jsonStr: string): {
  valid: boolean;
  data?: Omit<ExportedStorePayload, 'version' | 'exportedAt'>;
  error?: string;
} {
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'Format JSON tidak valid.' };
    }
    const obj = parsed as Partial<ExportedStorePayload>;
    if (!isCategoryArray(obj.categories)) {
      return { valid: false, error: 'Data kategori dalam JSON tidak valid.' };
    }
    if (!isProductArray(obj.products)) {
      return { valid: false, error: 'Data produk dalam JSON tidak valid.' };
    }
    if (!isPromotionArray(obj.promotions ?? [])) {
      return { valid: false, error: 'Data promosi dalam JSON tidak valid.' };
    }
    if (!isOrderArray(obj.orders ?? [])) {
      return { valid: false, error: 'Data pesanan dalam JSON tidak valid.' };
    }
    if (!isInventoryLogArray(obj.inventoryLogs ?? [])) {
      return { valid: false, error: 'Data riwayat stok dalam JSON tidak valid.' };
    }
    if (!isStoreSettings(obj.settings)) {
      return { valid: false, error: 'Pengaturan toko dalam JSON tidak valid.' };
    }

    // Ensure unique IDs & safe image URLs
    const seenIds = new Set<string>();
    const safeProducts: Product[] = [];
    for (const prod of obj.products) {
      if (seenIds.has(prod.id)) continue;
      seenIds.add(prod.id);
      safeProducts.push({
        ...prod,
        spiceLevel: clampSpiceLevel(prod.spiceLevel),
        image: prod.image && isSafeHttpUrl(prod.image) ? prod.image : DEFAULT_PRODUCTS[0].image,
      });
    }

    return {
      valid: true,
      data: {
        categories: obj.categories,
        products: safeProducts,
        promotions: obj.promotions ?? [],
        orders: obj.orders ?? [],
        inventoryLogs: obj.inventoryLogs ?? [],
        settings: obj.settings,
      },
    };
  } catch {
    return { valid: false, error: 'File JSON rusak atau gagal diparsing.' };
  }
}

export function resetAllDemoStorage() {
  writeLocalStorage(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
  writeLocalStorage(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
  writeLocalStorage(STORAGE_KEYS.promotions, DEFAULT_PROMOTIONS);
  writeLocalStorage(STORAGE_KEYS.orders, DEFAULT_ORDERS);
  writeLocalStorage(STORAGE_KEYS.inventory, DEFAULT_INVENTORY_LOGS);
  writeLocalStorage(STORAGE_KEYS.settings, DEFAULT_STORE_SETTINGS);
  writeLocalStorage(STORAGE_KEYS.cart, []);
}
