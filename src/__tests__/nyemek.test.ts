import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, DEFAULT_PROMOTIONS } from '../data/defaultData';
import { CartItem, Product } from '../types';
import { addToCart, calculateCartTotal, updateCartQuantity } from '../utils/cart';
import { filterProducts, sortProducts } from '../utils/catalog';
import { isProductArray, parseImportJson, parseLocalStorage } from '../utils/storage';
import {
  isSafeHttpUrl,
  validateCategory,
  validateOrder,
  validatePhoneNumber,
  validateProduct,
  validatePromotion,
} from '../utils/validation';
import { buildWhatsAppUrl } from '../utils/whatsapp';

const categoryNameMap = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));

describe('NYEMEK! Catalog Filtering & Sorting', () => {
  it('filters products by search query, category, and spice level together', () => {
    const res = filterProducts(
      DEFAULT_PRODUCTS,
      {
        search: 'chili',
        categoryId: 'cat-kukus',
        spiceLevel: 4,
        onlyActive: true,
      },
      categoryNameMap
    );
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('prod-chili-oil');
  });

  it('filters products by category name search query', () => {
    const res = filterProducts(
      DEFAULT_PRODUCTS,
      { search: 'frozen' },
      categoryNameMap
    );
    expect(res.some((p) => p.categoryId === 'cat-frozen')).toBe(true);
  });

  it('sorts products by price ascending and descending using effective discount prices', () => {
    const asc = sortProducts(DEFAULT_PRODUCTS, 'price-asc');
    const desc = sortProducts(DEFAULT_PRODUCTS, 'price-desc');
    expect(asc[0].id).toBe('prod-chili-oil'); // discountPrice 20000
    expect(desc[0].id).toBe('prod-paket-rame-rame'); // discountPrice 99000
  });

  it('sorts products alphabetically A-Z', () => {
    const sorted = sortProducts(DEFAULT_PRODUCTS, 'name-asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].name.localeCompare(sorted[i].name, 'id')).toBeLessThanOrEqual(0);
    }
  });
});

describe('NYEMEK! Product, Category & Promotion Validation', () => {
  const validCategoryIds = DEFAULT_CATEGORIES.map((c) => c.id);

  it('accepts a valid product payload', () => {
    const res = validateProduct(
      {
        name: 'Dimsum Pedas Spesial',
        categoryId: 'cat-kukus',
        price: 25000,
        discountPrice: 22000,
        image: 'https://example.com/dimsum.jpg',
        spiceLevel: 4,
        stock: 15,
      },
      validCategoryIds
    );
    expect(res.valid).toBe(true);
  });

  it('rejects negative price, zero price, negative stock, and discount exceeding normal price', () => {
    const negRes = validateProduct(
      {
        name: 'Dimsum Test',
        categoryId: 'cat-kukus',
        price: -1000,
        discountPrice: 5000,
        spiceLevel: 2,
        stock: -3,
      },
      validCategoryIds
    );
    expect(negRes.valid).toBe(false);
    expect(negRes.errors.price).toBeDefined();
    expect(negRes.errors.stock).toBeDefined();

    const zeroRes = validateProduct(
      {
        name: 'Dimsum Nol',
        categoryId: 'cat-kukus',
        price: 0,
        discountPrice: 10000,
        spiceLevel: 2,
        stock: 5,
      },
      validCategoryIds
    );
    expect(zeroRes.valid).toBe(false);
    expect(zeroRes.errors.price).toBeDefined();

    const highDiscountRes = validateProduct(
      {
        name: 'Dimsum Mahal Diskon',
        categoryId: 'cat-kukus',
        price: 20000,
        discountPrice: 25000,
        spiceLevel: 2,
        stock: 5,
      },
      validCategoryIds
    );
    expect(highDiscountRes.valid).toBe(false);
    expect(highDiscountRes.errors.discountPrice).toBeDefined();
  });

  it('rejects spice level outside 0-5, invalid category, and unsafe javascript: image URLs', () => {
    const res = validateProduct(
      {
        name: 'Dimsum Invalid',
        categoryId: 'cat-tidak-ada',
        price: 20000,
        spiceLevel: 6,
        stock: 10,
        image: 'javascript:alert(1)',
      },
      validCategoryIds
    );
    expect(res.valid).toBe(false);
    expect(res.errors.categoryId).toBeDefined();
    expect(res.errors.spiceLevel).toBeDefined();
    expect(res.errors.image).toBeDefined();
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('validates categories and prevents duplicates', () => {
    expect(validateCategory({ name: 'Dimsum Baru' }, ['Dimsum Kukus']).valid).toBe(true);
    expect(validateCategory({ name: '' }, ['Dimsum Kukus']).valid).toBe(false);
    expect(validateCategory({ name: 'dimsum kukus' }, ['Dimsum Kukus']).valid).toBe(false);
  });

  it('validates promotions including date range and discount bounds', () => {
    expect(
      validatePromotion({
        name: 'Promo Weekend',
        code: 'WEEKEND15',
        discountPercent: 15,
        discountAmount: 0,
        minPurchase: 50000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }).valid
    ).toBe(true);

    expect(
      validatePromotion({
        name: 'Promo Rusak',
        code: 'BAD DATE',
        discountPercent: 120,
        discountAmount: 0,
        minPurchase: -100,
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      }).valid
    ).toBe(false);
  });
});

describe('NYEMEK! Shopping Cart & Total Calculations', () => {
  const sampleProduct: Product = {
    ...DEFAULT_PRODUCTS[0],
    stock: 3,
  };

  it('adds product to cart and blocks adding when stock is exhausted', () => {
    const added = addToCart([], sampleProduct, 2);
    expect(added.cart).toHaveLength(1);
    expect(added.cart[0].quantity).toBe(2);

    const outOfStockProd: Product = { ...sampleProduct, stock: 0 };
    const blocked = addToCart([], outOfStockProd, 1);
    expect(blocked.cart).toHaveLength(0);
    expect(blocked.error).toBeDefined();
  });

  it('caps cart quantity to available stock and removes item when quantity <= 0', () => {
    const initial: CartItem[] = [
      {
        productId: sampleProduct.id,
        name: sampleProduct.name,
        price: sampleProduct.price,
        discountPrice: sampleProduct.discountPrice,
        image: sampleProduct.image,
        portions: sampleProduct.portions,
        spiceLevel: sampleProduct.spiceLevel,
        quantity: 2,
      },
    ];

    const capped = updateCartQuantity(initial, sampleProduct.id, 10, 3);
    expect(capped.cart[0].quantity).toBe(3);
    expect(capped.error).toBeDefined();

    const removed = updateCartQuantity(initial, sampleProduct.id, 0, 3);
    expect(removed.cart).toHaveLength(0);
  });

  it('calculates cart subtotal, active promo discount, and final total accurately', () => {
    const cart: CartItem[] = [
      {
        productId: 'prod-chili-oil',
        name: 'Dimsum Chili Oil',
        price: 24000,
        discountPrice: 20000,
        image: '',
        portions: '4 pcs',
        spiceLevel: 4,
        quantity: 3, // 3 * 20000 = 60000
      },
    ];

    const promo10 = DEFAULT_PROMOTIONS[0]; // NYEMEK10: 10% off min 50000
    const totals = calculateCartTotal(cart, promo10, new Date('2026-06-01T12:00:00Z'));
    expect(totals.subtotal).toBe(60000);
    expect(totals.discount).toBe(6000);
    expect(totals.total).toBe(54000);
    expect(totals.itemCount).toBe(3);
  });

  it('rejects promo discount when minimum purchase is not met', () => {
    const cart: CartItem[] = [
      {
        productId: 'prod-chili-oil',
        name: 'Dimsum Chili Oil',
        price: 24000,
        discountPrice: 20000,
        image: '',
        portions: '4 pcs',
        spiceLevel: 4,
        quantity: 1, // 20000 < 50000
      },
    ];

    const totals = calculateCartTotal(
      cart,
      DEFAULT_PROMOTIONS[0],
      new Date('2026-06-01T12:00:00Z')
    );
    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(20000);
    expect(totals.promoError).toBeDefined();
  });
});

describe('NYEMEK! Phone Validation, Orders & WhatsApp Checkout', () => {
  it('validates Indonesian and international phone numbers', () => {
    expect(validatePhoneNumber('081234567890')).toBe(true);
    expect(validatePhoneNumber('+6281234567890')).toBe(true);
    expect(validatePhoneNumber('12345')).toBe(false);
    expect(validatePhoneNumber('abc0812345')).toBe(false);
  });

  it('validates order payload and rejects empty items or invalid phone', () => {
    expect(
      validateOrder({
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        customerAddress: 'Jl. Kemang Selatan No 10',
        method: 'Delivery',
        items: [{ productId: 'prod-1', quantity: 2 }],
        total: 40000,
      }).valid
    ).toBe(true);

    expect(
      validateOrder({
        customerName: 'Budi',
        customerPhone: '123',
        customerAddress: '',
        method: 'Delivery',
        items: [],
        total: 0,
      }).valid
    ).toBe(false);
  });

  it('builds properly encoded WhatsApp URL and throws on invalid WhatsApp number or empty payload', () => {
    const url = buildWhatsAppUrl('081234567890', {
      customerName: 'Siti Aminah',
      customerPhone: '081298765432',
      customerAddress: 'Jl. Sudirman No. 1',
      method: 'Delivery',
      notes: 'Ekstra pedas',
      items: [{ name: 'Dimsum Chili Oil', quantity: 2, unitPrice: 20000 }],
      subtotal: 40000,
      total: 40000,
    });

    expect(url.startsWith('https://wa.me/6281234567890?text=')).toBe(true);
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('HALO NYEMEK!');
    expect(decoded).toContain('Siti Aminah');
    expect(decoded).toContain('Dimsum Chili Oil');

    expect(() =>
      buildWhatsAppUrl('invalid-phone', {
        customerName: 'Siti',
        customerPhone: '081298765432',
        customerAddress: 'Jl. Sudirman',
        method: 'Pickup',
        items: [{ name: 'Dimsum', quantity: 1, unitPrice: 20000 }],
        subtotal: 20000,
        total: 20000,
      })
    ).toThrow();
  });
});

describe('NYEMEK! LocalStorage & Import Safety', () => {
  it('safely handles corrupt JSON and invalid schemas in parseLocalStorage', () => {
    const corruptResult = parseLocalStorage(
      '{broken_json:::',
      isProductArray,
      DEFAULT_PRODUCTS
    );
    expect(corruptResult).toEqual(DEFAULT_PRODUCTS);

    const wrongSchemaResult = parseLocalStorage(
      JSON.stringify([{ bad: 'object' }]),
      isProductArray,
      DEFAULT_PRODUCTS
    );
    expect(wrongSchemaResult).toEqual(DEFAULT_PRODUCTS);
  });

  it('deduplicates product IDs and sanitizes unsafe image URLs during JSON import', () => {
    const payload = JSON.stringify({
      categories: DEFAULT_CATEGORIES,
      products: [
        { ...DEFAULT_PRODUCTS[0], image: 'javascript:alert(1)' },
        { ...DEFAULT_PRODUCTS[0] }, // duplicate ID
      ],
      promotions: DEFAULT_PROMOTIONS,
      orders: [],
      inventoryLogs: [],
      settings: {
        brandName: 'NYEMEK!',
        tagline: 'DIMSUM PEDAS',
        announcementText: 'Promo',
        logoText: 'NYEMEK!',
        whatsappNumber: '6281234567890',
        address: 'Jl. Kemang',
        openHours: '11-22',
        mapsUrl: 'https://maps.google.com',
        deliveryInfo: 'Instan',
        pickupInfo: 'Outlet',
        promoHeadline: 'Promo',
        promoSubtext: 'Sub',
      },
    });

    const parsed = parseImportJson(payload);
    expect(parsed.valid).toBe(true);
    expect(parsed.data?.products).toHaveLength(1);
    expect(parsed.data?.products[0].image).toBe(DEFAULT_PRODUCTS[0].image);
  });
});
