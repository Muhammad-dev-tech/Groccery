import { calculateNormalizedPrice } from '@/domain/units/normalizer';
import type { SearchProductItem, SearchFilterInput, SearchResult } from './schema';

export const DEMO_CATEGORIES = [
  { id: 'c0000000-0000-4000-8000-000000000001', name: 'Rice & Grains', icon: '🌾' },
  { id: 'c0000000-0000-4000-8000-000000000002', name: 'Cooking Oil', icon: '🫒' },
  { id: 'c0000000-0000-4000-8000-000000000003', name: 'Beverages', icon: '🧃' },
  { id: 'c0000000-0000-4000-8000-000000000004', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'c0000000-0000-4000-8000-000000000005', name: 'Fresh Vegetables', icon: '🥦' },
  { id: 'c0000000-0000-4000-8000-000000000006', name: 'Fresh Fruits', icon: '🍎' },
];

export const DEMO_VENDORS = [
  {
    id: 'v0000000-0000-4000-8000-000000000001',
    name: 'Arewa Organic Superstore',
    city: 'Kano',
    state: 'Kano',
    postalCodes: ['700213', '700241'],
  },
  {
    id: 'v0000000-0000-4000-8000-000000000002',
    name: 'Kwari & Sabon Gari Provisions',
    city: 'Kano',
    state: 'Kano',
    postalCodes: ['700221', '700213'],
  },
  {
    id: 'v0000000-0000-4000-8000-000000000003',
    name: 'Dawanau Grain & Food Mart',
    city: 'Kano',
    state: 'Kano',
    postalCodes: ['700241', '700233', '700223'],
  },
];

export const RAW_DEMO_PRODUCTS = [
  {
    id: 'p0000000-0000-4000-8000-000000000001',
    vendorId: 'v0000000-0000-4000-8000-000000000001',
    vendorName: 'Arewa Organic Superstore',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000001',
    categoryName: 'Rice & Grains',
    categoryIcon: '🌾',
    name: 'Royal Himalayan Basmati Rice 1kg',
    description: 'Aged fragrant long grain basmati rice, naturally cultivated.',
    price: 4500,
    currency: 'NGN',
    packageQuantity: 1.0,
    unitOfMeasurement: 'kg' as const,
    stockQuantity: 65,
    isAvailable: true,
    createdAt: '2026-10-20T10:00:00Z',
    imageUrl: null,
    serviceZones: ['700213', '700241'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000002',
    vendorId: 'v0000000-0000-4000-8000-000000000002',
    vendorName: 'Kwari & Sabon Gari Provisions',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000001',
    categoryName: 'Rice & Grains',
    categoryIcon: '🌾',
    name: 'Royal Himalayan Basmati Rice 5kg Sack',
    description: 'Bulk sack of aged aromatic basmati rice for family cooking.',
    price: 18000,
    currency: 'NGN',
    packageQuantity: 5.0,
    unitOfMeasurement: 'kg' as const,
    stockQuantity: 30,
    isAvailable: true,
    createdAt: '2026-10-20T10:05:00Z',
    imageUrl: null,
    serviceZones: ['700221', '700213'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000003',
    vendorId: 'v0000000-0000-4000-8000-000000000003',
    vendorName: 'Dawanau Grain & Food Mart',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000001',
    categoryName: 'Rice & Grains',
    categoryIcon: '🌾',
    name: 'Royal Himalayan Basmati Rice 500g',
    description: 'Convenient half-kilo pack of extra long grain basmati.',
    price: 2500,
    currency: 'NGN',
    packageQuantity: 500.0,
    unitOfMeasurement: 'g' as const,
    stockQuantity: 45,
    isAvailable: true,
    createdAt: '2026-10-20T10:10:00Z',
    imageUrl: null,
    serviceZones: ['700241', '700233', '700223'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000004',
    vendorId: 'v0000000-0000-4000-8000-000000000001',
    vendorName: 'Arewa Organic Superstore',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000002',
    categoryName: 'Cooking Oil',
    categoryIcon: '🫒',
    name: 'Cold Pressed Extra Virgin Olive Oil 500ml',
    description: 'First cold-pressed Mediterranean extra virgin olive oil.',
    price: 6000,
    currency: 'NGN',
    packageQuantity: 500.0,
    unitOfMeasurement: 'ml' as const,
    stockQuantity: 25,
    isAvailable: true,
    createdAt: '2026-10-20T10:15:00Z',
    imageUrl: null,
    serviceZones: ['700213', '700241'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000005',
    vendorId: 'v0000000-0000-4000-8000-000000000002',
    vendorName: 'Kwari & Sabon Gari Provisions',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000002',
    categoryName: 'Cooking Oil',
    categoryIcon: '🫒',
    name: 'Cold Pressed Extra Virgin Olive Oil 1L',
    description: 'Family bottle of 100% pure extra virgin olive oil.',
    price: 10500,
    currency: 'NGN',
    packageQuantity: 1.0,
    unitOfMeasurement: 'l' as const,
    stockQuantity: 40,
    isAvailable: true,
    createdAt: '2026-10-20T10:20:00Z',
    imageUrl: null,
    serviceZones: ['700221', '700213'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000006',
    vendorId: 'v0000000-0000-4000-8000-000000000003',
    vendorName: 'Dawanau Grain & Food Mart',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000002',
    categoryName: 'Cooking Oil',
    categoryIcon: '🫒',
    name: 'Cold Pressed Extra Virgin Olive Oil 750ml',
    description: 'Glass bottle of premium aromatic olive oil.',
    price: 8250,
    currency: 'NGN',
    packageQuantity: 750.0,
    unitOfMeasurement: 'ml' as const,
    stockQuantity: 35,
    isAvailable: true,
    createdAt: '2026-10-20T10:25:00Z',
    imageUrl: null,
    serviceZones: ['700241', '700233', '700223'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000007',
    vendorId: 'v0000000-0000-4000-8000-000000000001',
    vendorName: 'Arewa Organic Superstore',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000004',
    categoryName: 'Dairy & Eggs',
    categoryIcon: '🥛',
    name: 'Pure Farm Fresh Whole Milk 1L',
    description: 'Pasteurized, rich whole dairy milk from local farms.',
    price: 1800,
    currency: 'NGN',
    packageQuantity: 1.0,
    unitOfMeasurement: 'l' as const,
    stockQuantity: 50,
    isAvailable: true,
    createdAt: '2026-10-20T10:30:00Z',
    imageUrl: null,
    serviceZones: ['700213', '700241'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000008',
    vendorId: 'v0000000-0000-4000-8000-000000000002',
    vendorName: 'Kwari & Sabon Gari Provisions',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000004',
    categoryName: 'Dairy & Eggs',
    categoryIcon: '🥛',
    name: 'Pure Farm Fresh Whole Milk 2L Jug',
    description: 'Large 2-litre value jug of farm-fresh homogenized whole milk.',
    price: 3200,
    currency: 'NGN',
    packageQuantity: 2.0,
    unitOfMeasurement: 'l' as const,
    stockQuantity: 35,
    isAvailable: true,
    createdAt: '2026-10-20T10:35:00Z',
    imageUrl: null,
    serviceZones: ['700221', '700213'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000009',
    vendorId: 'v0000000-0000-4000-8000-000000000001',
    vendorName: 'Arewa Organic Superstore',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000005',
    categoryName: 'Fresh Vegetables',
    categoryIcon: '🥦',
    name: 'Organic Crisp Gala Apples 1kg',
    description: 'Sweet, crunchy gala apples harvested from local orchards.',
    price: 3000,
    currency: 'NGN',
    packageQuantity: 1.0,
    unitOfMeasurement: 'kg' as const,
    stockQuantity: 80,
    isAvailable: true,
    createdAt: '2026-10-20T10:40:00Z',
    imageUrl: null,
    serviceZones: ['700213', '700241'],
  },
  {
    id: 'p0000000-0000-4000-8000-000000000010',
    vendorId: 'v0000000-0000-4000-8000-000000000002',
    vendorName: 'Kwari & Sabon Gari Provisions',
    vendorCity: 'Kano',
    vendorState: 'Kano',
    categoryId: 'c0000000-0000-4000-8000-000000000005',
    categoryName: 'Fresh Vegetables',
    categoryIcon: '🥦',
    name: 'Fresh Gala Apples 1.5kg Bag',
    description: 'Pre-bagged crisp gala snacking apples.',
    price: 4200,
    currency: 'NGN',
    packageQuantity: 1.5,
    unitOfMeasurement: 'kg' as const,
    stockQuantity: 50,
    isAvailable: true,
    createdAt: '2026-10-20T10:45:00Z',
    imageUrl: null,
    serviceZones: ['700221', '700213'],
  },
];

export function getDemoProducts(filters: SearchFilterInput): SearchResult {
  let items: SearchProductItem[] = RAW_DEMO_PRODUCTS.map((p) => {
    const normalizedPrice = calculateNormalizedPrice(
      p.price,
      p.packageQuantity,
      p.unitOfMeasurement
    );
    return {
      ...p,
      normalizedPrice,
      servesSelectedLocation: true,
    };
  });

  // Category filter
  if (filters.categoryId) {
    items = items.filter((i) => i.categoryId === filters.categoryId);
  }

  // Text query
  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q))
    );
  }

  // Vendor filter
  if (filters.vendorId) {
    items = items.filter((i) => i.vendorId === filters.vendorId);
  }

  // Location filter (postal code)
  if (filters.postalCode) {
    items = items.filter((i) => i.serviceZones && i.serviceZones.includes(filters.postalCode!));
  }

  // Min / max price
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    items = items.filter((i) => i.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    items = items.filter((i) => i.price <= filters.maxPrice!);
  }

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      items.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      items.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
    case 'relevance':
    default:
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const totalCount = items.length;
  const offset = (filters.page - 1) * filters.limit;
  const paginated = items.slice(offset, offset + filters.limit);

  return {
    products: paginated,
    totalCount,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(totalCount / filters.limit),
    filtersApplied: filters,
  };
}
