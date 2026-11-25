export type SpiceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ProductLabel = 'BEST SELLER' | 'HOT DEAL' | 'BARU' | '';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  portions: string;
  spiceLevel: SpiceLevel;
  stock: number;
  minStock: number;
  label: ProductLabel;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number | null;
  image: string;
  portions: string;
  spiceLevel: SpiceLevel;
  quantity: number;
}

export type OrderMethod = 'Delivery' | 'Pickup' | 'Frozen Reseller';

export type OrderStatus =
  | 'Menunggu konfirmasi'
  | 'Diproses'
  | 'Siap diambil'
  | 'Dalam pengiriman'
  | 'Selesai'
  | 'Dibatalkan';

export type PaymentStatus =
  | 'Belum dibayar'
  | 'Menunggu pembayaran'
  | 'Lunas'
  | 'Dikembalikan';

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  method: OrderMethod;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode: string | null;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isLocalDraft: boolean;
  createdAt: string;
}

export type PromoType =
  | 'Diskon Produk'
  | 'Paket Bundling'
  | 'Promo Pembelian Banyak'
  | 'Paket Reseller';

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: PromoType;
  discountPercent: number;
  discountAmount: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  announcementText: string;
  logoText: string;
  whatsappNumber: string;
  address: string;
  openHours: string;
  mapsUrl: string;
  deliveryInfo: string;
  pickupInfo: string;
  promoHeadline: string;
  promoSubtext: string;
}

export interface AdminSession {
  username: string;
  loggedInAt: string;
  isDemoSession: boolean;
}

export interface AdminAccount {
  username: string;
  salt: string;
  passwordHash: string;
  updatedAt: string;
}

export type SortOption =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'newest';

export interface ProductFilterOptions {
  search?: string;
  categoryId?: string;
  spiceLevel?: SpiceLevel | 'all';
  onlyActive?: boolean;
}
