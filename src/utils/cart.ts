import { CartItem, Product, Promotion } from '../types';
import { getEffectivePrice } from './catalog';

export interface CartMutationResult {
  cart: CartItem[];
  error?: string;
}

export function addToCart(
  cart: CartItem[],
  product: Product,
  quantity = 1
): CartMutationResult {
  if (!product.isActive) {
    return { cart, error: 'Produk sedang tidak aktif.' };
  }
  if (product.stock <= 0) {
    return { cart, error: 'Stok produk habis.' };
  }
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return { cart, error: 'Jumlah item harus minimal 1.' };
  }

  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (nextQty > product.stock) {
      return {
        cart: cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: product.stock }
            : item
        ),
        error: `Maksimal stok tersedia untuk ${product.name} adalah ${product.stock}.`,
      };
    }
    return {
      cart: cart.map((item) =>
        item.productId === product.id ? { ...item, quantity: nextQty } : item
      ),
    };
  }

  const clampedQty = Math.min(quantity, product.stock);
  const newItem: CartItem = {
    productId: product.id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    image: product.image,
    portions: product.portions,
    spiceLevel: product.spiceLevel,
    quantity: clampedQty,
  };

  return {
    cart: [...cart, newItem],
    error:
      quantity > product.stock
        ? `Jumlah disesuaikan dengan stok tersedia (${product.stock}).`
        : undefined,
  };
}

export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  newQuantity: number,
  maxStock?: number
): CartMutationResult {
  if (newQuantity <= 0) {
    return {
      cart: cart.filter((item) => item.productId !== productId),
    };
  }

  if (maxStock !== undefined && maxStock <= 0) {
    return {
      cart: cart.filter((item) => item.productId !== productId),
      error: 'Stok produk habis, item dihapus dari keranjang.',
    };
  }

  const boundedQty =
    maxStock !== undefined ? Math.min(newQuantity, maxStock) : newQuantity;

  return {
    cart: cart.map((item) =>
      item.productId === productId ? { ...item, quantity: boundedQty } : item
    ),
    error:
      maxStock !== undefined && newQuantity > maxStock
        ? `Maksimal stok tersedia adalah ${maxStock}.`
        : undefined,
  };
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  promoError?: string;
}

export function isPromotionCurrentlyValid(
  promo: Promotion,
  referenceDate = new Date()
): boolean {
  if (!promo.isActive) return false;
  const start = new Date(promo.startDate + 'T00:00:00');
  const end = new Date(promo.endDate + 'T23:59:59');
  return referenceDate >= start && referenceDate <= end;
}

export function calculateCartTotal(
  cart: CartItem[],
  promotion?: Promotion | null,
  referenceDate = new Date()
): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const item of cart) {
    const qty = Math.max(0, Math.floor(item.quantity));
    const unitPrice = getEffectivePrice({
      price: item.price,
      discountPrice: item.discountPrice,
    });
    subtotal += unitPrice * qty;
    itemCount += qty;
  }

  let discount = 0;
  let promoError: string | undefined;

  if (promotion) {
    if (!isPromotionCurrentlyValid(promotion, referenceDate)) {
      promoError = 'Kode promo tidak aktif atau sudah kedaluwarsa.';
    } else if (subtotal < promotion.minPurchase) {
      promoError = `Minimal belanja untuk promo ini Rp ${promotion.minPurchase.toLocaleString('id-ID')}.`;
    } else {
      const percentDiscount =
        promotion.discountPercent > 0
          ? Math.round((subtotal * promotion.discountPercent) / 100)
          : 0;
      const flatDiscount = promotion.discountAmount > 0 ? promotion.discountAmount : 0;
      discount = Math.min(subtotal, Math.max(percentDiscount, flatDiscount));
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    subtotal,
    discount,
    total,
    itemCount,
    promoError,
  };
}
