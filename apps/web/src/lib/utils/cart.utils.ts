import type { ICartItem } from '@/types';

export const calculateCartSubtotal = (items: ICartItem[]): number => {
  return items.reduce(
    (total, item) => total + (item.priceSnapshot * item.quantity),
    0
  );
};

export const calculateCartItemCount = (items: ICartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

export const formatCartItemVariant = (variant?: {
  size?: string;
  color?: string;
  material?: string;
  gender?: string;
}): string => {
  if (!variant) return '';
  
  const parts: string[] = [];
  
  if (variant.size) parts.push(`Size: ${variant.size}`);
  if (variant.color) parts.push(`Color: ${variant.color}`);
  if (variant.material) parts.push(`Material: ${variant.material}`);
  if (variant.gender) parts.push(`Gender: ${variant.gender}`);
  
  return parts.join(', ');
};

export const validateCartItem = (item: {
  productId: string;
  quantity: number;
  maxStock?: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!item.productId) {
    errors.push('Product ID is required');
  }
  
  if (!item.quantity || item.quantity < 1) {
    errors.push('Quantity must be at least 1');
  }
  
  if (item.maxStock !== undefined && item.quantity > item.maxStock) {
    errors.push(`Cannot add more than ${item.maxStock} items`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const mergeDuplicateCartItems = (
  items: Array<{
    productId: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    variant?: any;
  }>
): typeof items => {
  const mergedItems = new Map<string, typeof items[0]>();
  
  items.forEach(item => {
    const key = `${item.productId}-${JSON.stringify(item.variant || {})}`;
    
    if (mergedItems.has(key)) {
      const existing = mergedItems.get(key)!;
      mergedItems.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      mergedItems.set(key, { ...item });
    }
  });
  
  return Array.from(mergedItems.values());
};

export const generateCartItemKey = (
  productId: string,
  variant?: {
    size?: string;
    color?: string;
    material?: string;
    gender?: string;
  }
): string => {
  const variantString = variant ? JSON.stringify(variant) : 'default';
  return `${productId}-${variantString}`;
};