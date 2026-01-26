export const queryKeys = {
  auth: {
    validate: () => ['auth', 'validate'] as const,
  },

  products: {
    all: (filters?: Record<string, any>) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },

  categories: {
    all: (filters?: Record<string, any>) => ['categories', 'list', filters] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    tree: () => ['categories', 'tree'] as const,
    bySlug: (slug: string) => ['categories', 'slug', slug] as const,
  },

  cart: {
    detail: () => ['cart'] as const,
  },

  orders: {
    all: (filters?: Record<string, any>) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    byNumber: (orderNumber: string) => ['orders', 'number', orderNumber] as const,
    stats: (userId?: string) => ['orders', 'stats', userId] as const,
  },

  admin: {
    all: (filters?: Record<string, any>) => ['admins', 'list', filters] as const,
    detail: (id: string) => ['admins', 'detail', id] as const,
  },

  users: {
    all: (filters?: Record<string, any>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
};