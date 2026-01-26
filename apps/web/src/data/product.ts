import type {
  IPaginationMeta, IProductListItem,
  IProductQueryFilters, ICategoryTreeNode
} from '@/types';

// Categories data
export const categories: ICategoryTreeNode[] = [
  {
    _id: 'cat_001',
    name: "Men's Clothing",
    slug: 'mens-clothing',
    icon: 'https://images.unsplash.com/photo-1521334884684-d80222895322',
    order: 1,
  },
  {
    _id: 'cat_002',
    name: "Women's Clothing",
    slug: 'womens-clothing',
    icon: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    order: 2,
  },
  {
    _id: 'cat_003',
    name: 'Footwear',
    slug: 'footwear',
    icon: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    order: 3,
  },
  {
    _id: 'cat_004',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
    order: 4,
  },
  {
    _id: 'cat_005',
    name: 'Bags & Luggage',
    slug: 'bags-luggage',
    icon: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7',
    order: 5,
  },
  {
    _id: 'cat_006',
    name: 'Eyewear',
    slug: 'eyewear',
    icon: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
    order: 6,
  },
  {
    _id: 'cat_007',
    name: 'Jewelry',
    slug: 'jewelry',
    icon: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    order: 7,
  },
  {
    _id: 'cat_008',
    name: 'Activewear',
    slug: 'activewear',
    icon: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74',
    order: 8,
  },
  {
    _id: 'cat_009',
    name: 'Luxury',
    slug: 'luxury',
    icon: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
    order: 9,
  },
  {
    _id: 'cat_010',
    name: 'Trending',
    slug: 'trending',
    icon: 'https://images.unsplash.com/photo-1517148815978-75f6acaaf32c',
    order: 10,
  },
];

// Product images mapping
const productImages: Record<string, string[]> = {
  'Premium Leather Jacket': [
    'https://images.unsplash.com/photo-1520975916090-3105956dac38',
    'https://images.unsplash.com/photo-1528701800489-20be7c2a1c53',
  ],
  'Silk Evening Dress': [
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956',
    'https://images.unsplash.com/photo-1520974735194-6c4f8b1f4c8f',
  ],
  'Designer Sneakers': [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  ],
  'Luxury Watch': [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e',
  ],
  'Handbag Collection': [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c',
  ],
  'Sunglasses Pro': [
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
    'https://images.unsplash.com/photo-1577801599717-7e0c7b0a1c35',
  ],
  'Gold Necklace': [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6',
  ],
  'Yoga Outfit Set': [
    'https://images.unsplash.com/photo-1554284126-aa88f22d8b74',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
  ],
  'Designer Suit': [
    'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47',
    'https://images.unsplash.com/photo-1593032465171-8c96d8b4f45c',
  ],
  'Casual T-Shirt': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
  ],
  'Winter Coat': [
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef',
  ],
  'Summer Dress': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
  ],
  'Running Shoes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
  ],
  'Smart Watch': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1',
  ],
  'Backpack': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    'https://images.unsplash.com/photo-1585916420730-d7f95e942d43',
  ],
  'Prescription Glasses': [
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
    'https://images.unsplash.com/photo-1577801599717-7e0c7b0a1c35',
  ],
  'Diamond Ring': [
    'https://images.unsplash.com/photo-1603561596112-0a132b757442',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
  ],
  'Gym Wear': [
    'https://images.unsplash.com/photo-1594736797933-d01f6e6c3be6',
    'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0',
  ],
  'Formal Shirt': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176',
  ],
  'Denim Jacket': [
    'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5',
    'https://images.unsplash.com/photo-1559561892-5e6e4c3a8a29',
  ],
};

// Generate sample products
export const sampleProducts: IProductListItem[] = Array.from(
  { length: 50 },
  (_, i) => {
    const productNames = [
      'Premium Leather Jacket',
      'Silk Evening Dress',
      'Designer Sneakers',
      'Luxury Watch',
      'Handbag Collection',
      'Sunglasses Pro',
      'Gold Necklace',
      'Yoga Outfit Set',
      'Designer Suit',
      'Casual T-Shirt',
      'Winter Coat',
      'Summer Dress',
      'Running Shoes',
      'Smart Watch',
      'Backpack',
      'Prescription Glasses',
      'Diamond Ring',
      'Gym Wear',
      'Formal Shirt',
      'Denim Jacket',
    ];

    const name = productNames[i % 20];
    const productNumber = i + 1;

    return {
      _id: `prod_${String(productNumber).padStart(3, '0')}`,
      name,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${productNumber}`,
      description: `${name} - Premium fashion item with excellent quality and design. Made from high-quality materials for maximum comfort and style.`,
      categoryId: `cat_${String(Math.floor(i / 5) + 1).padStart(3, '0')}`,
      brand: ['FashionKet', 'LuxStyle', 'UrbanWear', 'ClassicMode', 'TrendSet'][i % 5],
      price: [
        8999, 12999, 19999, 29999, 4999, 15999, 39999, 7999, 24999, 9999,
      ][i % 10],
      discount: i % 3 === 0 ? [10, 20, 30, 40, 50][i % 5] : 0,
      stock: Math.floor(Math.random() * 50) + 10,
      images: productImages[name]?.map(
        (url) => `${url}?w=400&h=500&fit=crop&auto=format`,
      ) ?? [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop',
        ],
      isActive: true,
      tags: ['fashion', 'premium', 'trending', 'new', name.split(' ')[0].toLowerCase()],
      viewCount: Math.floor(Math.random() * 1000) + 100,
      soldCount: Math.floor(Math.random() * 500) + 50,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    };
  },
);

// Helper functions
export const getCategoryBySlug = (slug: string): ICategoryTreeNode | undefined => {
  return categories.find(category => category.slug === slug);
};

export const getCategoryById = (id: string): ICategoryTreeNode | undefined => {
  return categories.find(category => category._id === id);
};

export const getProductsByCategorySlug = (slug: string): IProductListItem[] => {
  const category = getCategoryBySlug(slug);
  if (!category) return [];

  return sampleProducts.filter(product => {
    const productCategory = getCategoryById(product.categoryId);
    return productCategory?.slug === slug;
  });
};

export const getProductBySlug = (slug: string): IProductListItem | undefined => {
  return sampleProducts.find(product => product.slug === slug);
};

export const getRelatedProducts = (productId: string, limit: number = 4): IProductListItem[] => {
  const product = sampleProducts.find(p => p._id === productId);
  if (!product) return [];

  return sampleProducts
    .filter(p => p._id !== productId && p.categoryId === product.categoryId)
    .slice(0, limit);
};

export const getAllBrands = (): string[] => {
  const brands = new Set(sampleProducts.map(product => product.brand).filter(Boolean) as string[]);
  return Array.from(brands).sort();
};

export const getAllTags = (): string[] => {
  const tags = new Set(sampleProducts.flatMap(product => product.tags));
  return Array.from(tags).sort();
};

// Filter products function
export const filterProducts = (
  products: IProductListItem[],
  filters: IProductQueryFilters
): IProductListItem[] => {
  let filtered = [...products];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (filters.categoryId) {
    filtered = filtered.filter(product => product.categoryId === filters.categoryId);
  }

  // Brand filter
  if (filters.brand) {
    filtered = filtered.filter(product => product.brand === filters.brand);
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(product => product.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(product => product.price <= filters.maxPrice!);
  }

  // Active status filter
  if (filters.isActive !== undefined) {
    filtered = filtered.filter(product => product.isActive === filters.isActive);
  }

  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price * (1 - a.discount / 100);
          bValue = b.price * (1 - b.discount / 100);
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          aValue = a.soldCount;
          bValue = b.soldCount;
          break;
        case 'rating':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const start = (page - 1) * limit;
  const end = start + limit;

  return filtered.slice(start, end);
};

export const getProductsCount = (filters: IProductQueryFilters): number => {
  const filtered = filterProducts(sampleProducts, { ...filters, page: undefined, limit: undefined });
  return filtered.length;
};


/**
 * Filter products with pagination support
 */
export const filterProductsWithPagination = (
  filters: IProductQueryFilters
): {
  products: IProductListItem[];
  meta: IPaginationMeta
} => {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    tags,
    sortBy,
    sortOrder = 'asc',
    isActive = true,
  } = filters;

  // Start with all products
  let filtered = [...sampleProducts];

  // Apply active filter
  filtered = filtered.filter(product => product.isActive === isActive);

  // Search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (categoryId) {
    filtered = filtered.filter(product => product.categoryId === categoryId);
  }

  // Brand filter
  if (brand) {
    filtered = filtered.filter(product => product.brand === brand);
  }

  // Price range filter
  if (minPrice !== undefined) {
    filtered = filtered.filter(product => product.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter(product => product.price <= maxPrice);
  }

  // Tags filter
  if (tags) {
    filtered = filtered.filter(product => product.tags.includes(tags));
  }

  // Sorting
  if (sortBy) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'price':
          const aDiscounted = a.price * (1 - a.discount / 100);
          const bDiscounted = b.price * (1 - b.discount / 100);
          aValue = aDiscounted;
          bValue = bDiscounted;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'popularity':
          aValue = a.soldCount;
          bValue = b.soldCount;
          break;
        case 'rating':
          aValue = a.viewCount / 100;
          bValue = b.viewCount / 100;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
  }

  // Calculate pagination meta
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * limit;
  const end = start + limit;

  // Get paginated products
  const paginatedProducts = filtered.slice(start, end);

  return {
    products: paginatedProducts,
    meta: {
      total,
      page: currentPage,
      limit,
      totalPages,
    },
  };
};

/**
 * Get maximum price from all products
 */
export const getMaxPrice = (): number => {
  return Math.max(...sampleProducts.map(p => p.price), 0);
};