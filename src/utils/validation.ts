import { OrderMethod, SpiceLevel } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates URLs to allow only safe http(s) links or local /src/assets/ paths.
 * Blocks javascript:, data:, vbscript:, and unknown protocols to prevent XSS.
 */
export function isSafeHttpUrl(url: string, allowRelativeAssets = true): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (allowRelativeAssets && /^\/src\/assets\/[a-zA-Z0-9._/-]+$/.test(trimmed)) {
    return !trimmed.includes('..');
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizePlainText(input: string, maxLength = 500): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalizes and validates Indonesian / international phone numbers (9 to 15 digits).
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned.slice(1);
  }
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function validatePhoneNumber(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (/[^0-9+\s()-]/.test(trimmed)) return false;
  const normalized = normalizePhoneNumber(trimmed);
  return /^\d{9,15}$/.test(normalized);
}

export interface ProductInput {
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  portions?: string;
  spiceLevel: number;
  stock: number;
  minStock?: number;
}

export function validateProduct(
  input: ProductInput,
  validCategoryIds?: string[]
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || !input.name.trim()) {
    errors.name = 'Nama produk wajib diisi.';
  }

  if (!input.categoryId || !input.categoryId.trim()) {
    errors.categoryId = 'Kategori wajib dipilih.';
  } else if (validCategoryIds && !validCategoryIds.includes(input.categoryId)) {
    errors.categoryId = 'Kategori tidak valid.';
  }

  if (typeof input.price !== 'number' || Number.isNaN(input.price) || input.price <= 0) {
    errors.price = 'Harga harus berupa angka positif lebih dari 0.';
  }

  if (input.discountPrice !== null && input.discountPrice !== undefined) {
    if (
      typeof input.discountPrice !== 'number' ||
      Number.isNaN(input.discountPrice) ||
      input.discountPrice <= 0
    ) {
      errors.discountPrice = 'Harga diskon harus lebih dari 0.';
    } else if (input.price > 0 && input.discountPrice > input.price) {
      errors.discountPrice = 'Harga diskon tidak boleh lebih tinggi dari harga normal.';
    }
  }

  if (typeof input.stock !== 'number' || Number.isNaN(input.stock) || input.stock < 0) {
    errors.stock = 'Stok tidak boleh negatif.';
  }

  if (
    typeof input.spiceLevel !== 'number' ||
    !Number.isInteger(input.spiceLevel) ||
    input.spiceLevel < 0 ||
    input.spiceLevel > 5
  ) {
    errors.spiceLevel = 'Level pedas harus antara 0 sampai 5.';
  }

  if (input.image && input.image.trim() !== '' && !isSafeHttpUrl(input.image)) {
    errors.image = 'URL gambar harus berupa link http/https yang valid atau aset lokal.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCategory(
  input: { name: string; description?: string },
  existingNames: string[] = []
): ValidationResult {
  const errors: Record<string, string> = {};
  const trimmedName = input.name?.trim() ?? '';

  if (!trimmedName) {
    errors.name = 'Nama kategori wajib diisi.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Nama kategori minimal 2 karakter.';
  } else if (
    existingNames.some((n) => n.trim().toLowerCase() === trimmedName.toLowerCase())
  ) {
    errors.name = 'Kategori dengan nama tersebut sudah ada.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  method: OrderMethod;
  items: Array<{ productId: string; quantity: number }>;
  total: number;
}

export function validateOrder(input: OrderInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Nama pemesan wajib diisi (minimal 2 karakter).';
  }

  if (!validatePhoneNumber(input.customerPhone)) {
    errors.customerPhone = 'Nomor telepon/WhatsApp tidak valid (9–15 digit).';
  }

  if (
    (input.method === 'Delivery' || input.method === 'Frozen Reseller') &&
    (!input.customerAddress || input.customerAddress.trim().length < 5)
  ) {
    errors.customerAddress = 'Alamat pengiriman wajib diisi dengan jelas.';
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    errors.items = 'Pesanan tidak boleh kosong.';
  }

  if (typeof input.total !== 'number' || Number.isNaN(input.total) || input.total <= 0) {
    errors.total = 'Total pesanan harus lebih dari 0.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface PromotionInput {
  name: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
}

export function validatePromotion(input: PromotionInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || !input.name.trim()) {
    errors.name = 'Nama promo wajib diisi.';
  }

  if (!input.code || !/^[A-Z0-9_-]{3,20}$/i.test(input.code.trim())) {
    errors.code = 'Kode promo wajib 3–20 karakter huruf/angka tanpa spasi.';
  }

  const hasPercent = input.discountPercent > 0;
  const hasAmount = input.discountAmount > 0;

  if (!hasPercent && !hasAmount) {
    errors.discount = 'Isi persentase diskon atau nominal potongan.';
  }
  if (input.discountPercent < 0 || input.discountPercent > 90) {
    errors.discountPercent = 'Persentase diskon harus antara 0% sampai 90%.';
  }
  if (input.discountAmount < 0) {
    errors.discountAmount = 'Nominal potongan tidak boleh negatif.';
  }
  if (input.minPurchase < 0) {
    errors.minPurchase = 'Minimal belanja tidak boleh negatif.';
  }
  if (!input.startDate || !input.endDate) {
    errors.dates = 'Tanggal mulai dan berakhir promo wajib diisi.';
  } else if (new Date(input.startDate) > new Date(input.endDate)) {
    errors.dates = 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function clampSpiceLevel(level: number): SpiceLevel {
  const rounded = Math.round(level);
  if (rounded <= 0) return 0;
  if (rounded >= 5) return 5;
  return rounded as SpiceLevel;
}
