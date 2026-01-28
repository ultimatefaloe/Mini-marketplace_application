import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useCart as useCartQuery } from '@/api/cart.query'
import { useAuth } from '@/hooks'
import { toast } from 'react-toastify'
import type { IVariantOptions } from '@/types'

export const useCart = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    localCart,
    isLoading: cartLoading,
    isSyncing,
    addToCart: storeAddToCart,
    updateCartItem: storeUpdateCartItem,
    removeFromCart: storeRemoveFromCart,
    clearCart: storeClearCart,
    getCartSummary,
    syncCartWithServer,
    _setServerCart,
  } = useCartStore()

  // Fetch server cart if authenticated
  const {
    data: serverCartData,
    isLoading: serverCartLoading,
    refetch: refetchServerCart,
  } = useCartQuery()

  // Sync server cart with store when fetched
  useEffect(() => {
    if (isAuthenticated && serverCartData) {
      _setServerCart(serverCartData)
    }
  }, [isAuthenticated, serverCartData, _setServerCart])

  // Sync local cart with server on authentication
  useEffect(() => {
    const syncOnAuth = async () => {
      if (isAuthenticated && localCart.items.length > 0) {
        try {
          await syncCartWithServer()
          toast.success(
            'Your local cart items have been added to your account.',
          )
        } catch (error) {
          toast.error('Could not sync cart with server. Please try again.')
        }
      }
    }

    if (isAuthenticated && !authLoading) {
      syncOnAuth()
    }
  }, [isAuthenticated, authLoading, localCart.items.length, syncCartWithServer])

  const addToCart = async (
    productId: string,
    productName: string,
    productPrice: number,
    productImage?: string,
    quantity?: number,
    variantOptions?: IVariantOptions,
  ) => {
    try {
      await storeAddToCart({
        productId,
        productName,
        productPrice,
        quantity: quantity || 1,
        productImage,
        variantOptions,
      })

      const summary = getCartSummary()
      const itemCount = summary.itemCount

      toast.success(`${productName} has been added to your cart.`)

      return { success: true, itemCount }
    } catch (error) {
      toast.error('Failed to add to cart, please try again.')
      return { success: false, itemCount: 0 }
    }
  }

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      await storeUpdateCartItem({ productId, quantity })

      if (quantity === 0) {
        toast.info('Item has been removed from your cart.')
      } else {
        toast.success('Cart item quantity has been updated.')
      }

      return { success: true }
    } catch (error) {
      toast.error('Please try again.')
      return { success: false }
    }
  }

  const removeFromCart = async (productId: string, productName?: string) => {
    try {
      await storeRemoveFromCart(productId)

      toast.success(`${productName || 'Item'} has been removed from your cart.`)

      return { success: true }
    } catch (error) {
      toast.error('Failed to remove item, please try again.')
      return { success: false }
    }
  }

  const clearCart = async () => {
    try {
      await storeClearCart()

      toast.success('Cart cleared')

      return { success: true }
    } catch (error) {
      toast.error('Failed to clear cart, please try again.')
      return { success: false }
    }
  }

  const getItemQuantity = (productId: string): number => {
    const { items } = getCartSummary()
    const item = items.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  const calculateSubtotal = () => {
    const { subtotal } = getCartSummary()
    return subtotal
  }

  const calculateTotalItems = () => {
    const { itemCount } = getCartSummary()
    return itemCount
  }

  const getCartItems = () => {
    const { items } = getCartSummary()
    return items
  }

  const isLoading = cartLoading || serverCartLoading || authLoading

  return {
    // State
    items: getCartItems(),
    subtotal: calculateSubtotal(),
    itemCount: calculateTotalItems(),
    isLoading,
    isSyncing,
    isAuthenticated,

    // Cart source info
    cartSource: isAuthenticated ? 'server' : 'local',
    hasLocalItems: localCart.items.length > 0,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getItemQuantity,
    refreshCart: refetchServerCart,

    // Utility
    isEmpty: calculateTotalItems() === 0,
  }
}
