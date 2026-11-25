import { Product, ProductFilterOptions, SortOption } from '../types';

export function getEffectivePrice(product: Pick<Product, 'price' | 'discountPrice'>): number {
  if (
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
  ) {
    return product.discountPrice;
  }
  return product.price;
}

export function formatRupiah(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  return 'Rp ' + safeAmount.toLocaleString('id-ID');
}

export function filterProducts(
  products: Product[],
  options: ProductFilterOptions = {},
  categoryNameMap?: Record<string, string>
): Product[] {
  const {
    search = '',
    categoryId = 'all',
    spiceLevel = 'all',
    onlyActive = false,
  } = options;

  const query = search.trim().toLowerCase();

  return products.filter((product) => {
    if (onlyActive && !product.isActive) {
      return false;
    }

    if (categoryId && categoryId !== 'all' && product.categoryId !== categoryId) {
      return false;
    }

    if (spiceLevel !== 'all' && product.spiceLevel !== spiceLevel) {
      return false;
    }

    if (query) {
      const catName = (categoryNameMap?.[product.categoryId] ?? '').toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesDesc = product.description.toLowerCase().includes(query);
      const matchesCat =
        catName.includes(query) || product.categoryId.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc && !matchesCat) {
        return false;
      }
    }

    return true;
  });
}

export function sortProducts(products: Product[], sortBy: SortOption = 'recommended'): Product[] {
  const copy = [...products];

  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case 'price-desc':
      return copy.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'recommended':
    default: {
      const labelRank = (label: Product['label']): number => {
        if (label === 'BEST SELLER') return 3;
        if (label === 'HOT DEAL') return 2;
        if (label === 'BARU') return 1;
        return 0;
      };
      return copy.sort((a, b) => {
        const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
        if (stockDiff !== 0) return stockDiff;
        const rankDiff = labelRank(b.label) - labelRank(a.label);
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }
}
