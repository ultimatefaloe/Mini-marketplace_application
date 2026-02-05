import { useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks';
import { toast } from 'react-toastify';
import type { IVariantOptions, ObjectId } from '@/types';
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from '@/api/mutations';
import { useCart as useCartQuery } from '@/api/hooks';

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const {
    localCart,
    isLoading: storeLoading,
    isSyncing,
    error: storeError,
    addToLocalCart,
    updateLocalCartItem,
    removeFromLocalCart,
    clearLocalCart,
    getCartSummary,
    setServerCart,
    setLoading,
    setError,
  } = useCartStore();

  // Fetch server cart if authenticated
  const {
    data: serverCartData,
    error: serverCartError,
    refetch: refetchServerCart,
  } = useCartQuery();

  // Server mutations
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Sync server cart with store when fetched
  useEffect(() => {
    if (isAuthenticated && serverCartData) {
      setServerCart(serverCartData);
    } else if (!isAuthenticated) {
      setServerCart(null);
    }
  }, [isAuthenticated, serverCartData, setServerCart]);

  // Handle errors
  useEffect(() => {
    if (serverCartError) {
      setError(serverCartError.message);
    }
  }, [serverCartError, setError]);

  /**
   * Add item to cart (server or local)
   */
  const addToCart = useCallback(
    async (
      productId: string,
      productName: string,
      productPrice: number,
      productImage?: string,
      quantity: number = 1,
      variantOptions?: IVariantOptions,
    ) => {
      if (isAuthenticated) {
        // Authenticated user - add to server
        try {
          setLoading(true);
          await addToCartMutation.mutateAsync({
            items: [
              {
                _id: '',
                productId: productId as ObjectId,
                quantity,
                nameSnapshot: productName,
                priceSnapshot: productPrice,
                variantOptions
              }
            ]
          });

          // Refetch to get updated cart
          await refetchServerCart();

          toast.success(`${productName} added to your cart`);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to add to cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          setLoading(false);
        }
      } else {
        // Unauthenticated user - add to local storage
        try {
          addToLocalCart({
            productId,
            productName,
            productPrice,
            quantity,
            productImage,
            variantOptions,
          });

          toast.success(`${productName} added to your cart`);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to add to cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      }
    },
    [
      isAuthenticated,
      addToCartMutation,
      addToLocalCart,
      refetchServerCart,
      setLoading,
      setError,
    ],
  );

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(
    async ( productId: string, quantity: number, itemId: string,) => {
      if (isAuthenticated) {
        // Authenticated user - update on server
        try {
          setLoading(true);
          await updateCartItemMutation.mutateAsync({
            itemId,
            quantity,
          });

          // Refetch to get updated cart
          await refetchServerCart();

          if (quantity === 0) {
            toast.info('Item removed from your cart');
          } else {
            toast.success('Cart updated');
          }
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          setLoading(false);
        }
      } else {
        // Unauthenticated user - update in local storage
        try {
          updateLocalCartItem({ productId, quantity });

          if (quantity === 0) {
            toast.info('Item removed from your cart');
          } else {
            toast.success('Cart updated');
          }
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      }
    },
    [
      isAuthenticated,
      updateCartItemMutation,
      updateLocalCartItem,
      refetchServerCart,
      setLoading,
      setError,
    ],
  );

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(
    async (productId: string, itemId?: string, productName?: string) => {
      if (isAuthenticated) {
        // Authenticated user - remove from server
        try {
          setLoading(true);
          await removeFromCartMutation.mutateAsync(itemId ? itemId : '');

          // Refetch to get updated cart
          await refetchServerCart();

          toast.success(`${productName || 'Item'} removed from your cart`);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to remove from cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          setLoading(false);
        }
      } else {
        // Unauthenticated user - remove from local storage
        try {
          removeFromLocalCart(productId);

          toast.success(`${productName || 'Item'} removed from your cart`);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to remove from cart';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      }
    },
    [
      isAuthenticated,
      removeFromCartMutation,
      removeFromLocalCart,
      refetchServerCart,
      setLoading,
      setError,
    ],
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      // Authenticated user - clear server cart
      try {
        setLoading(true);
        await clearCartMutation.mutateAsync();

        // Also clear local cart
        clearLocalCart();

        toast.success('Cart cleared');
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to clear cart';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    } else {
      // Unauthenticated user - clear local cart
      try {
        clearLocalCart();

        toast.success('Cart cleared');
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to clear cart';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [
    isAuthenticated,
    clearCartMutation,
    clearLocalCart,
    setLoading,
    setError,
  ]);

  /**
   * Get quantity of specific item in cart
   */
  const getItemQuantity = useCallback(
    (productId: string): number => {
      const { items } = getCartSummary(isAuthenticated);
      const item = items.find((item) => item.productId === productId);
      return item ? item.quantity : 0;
    },
    [isAuthenticated, getCartSummary],
  );

  /**
   * Check if item is in cart
   */
  const isInCart = useCallback(
    (productId: string): boolean => {
      return getItemQuantity(productId) > 0;
    },
    [getItemQuantity],
  );

  // Get cart summary
  const summary = getCartSummary(isAuthenticated);

  const isLoading: boolean =
    storeLoading ||
    addToCartMutation.isPending ||
    updateCartItemMutation.isPending ||
    removeFromCartMutation.isPending ||
    clearCartMutation.isPending;

  return {
    // State
    items: summary.items,
    subtotal: summary.subtotal,
    itemCount: summary.itemCount,
    isEmpty: summary.itemCount === 0,
    isLoading,
    isSyncing,
    error: storeError,
    isAuthenticated,

    // Cart source info
    cartSource: isAuthenticated ? 'server' : ('local' as const),
    hasLocalItems: localCart.items.length > 0,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getItemQuantity,
    isInCart,
    refreshCart: refetchServerCart,
  };
};