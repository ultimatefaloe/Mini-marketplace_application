import React, { useEffect, useCallback, useRef } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useAuth } from '@/hooks'
import { toast } from 'react-toastify'
import { useAddToCart } from '@/api/mutations'
import { useCart as useCartQuery } from '@/api/hooks'

interface CartProviderProps {
  children: React.ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { localCart, setServerCart, setSyncing, clearLocalCart, setError } =
    useCartStore()

  const addToCartMutation = useAddToCart()
  const { data: serverCartData, refetch: refetchServerCart } = useCartQuery()

  // Track if sync has been completed to avoid duplicate syncs
  const hasSyncedRef = useRef(false)
  const isSyncingRef = useRef(false)

  /**
   * Sync local cart with server
   */
  const syncCartWithServer = useCallback(async () => {
    if (
      !isAuthenticated ||
      localCart.items.length === 0 ||
      isSyncingRef.current
    ) {
      return
    }

    isSyncingRef.current = true
    setSyncing(true)

    try {
      // Add all local items to server cart
      for (const localItem of localCart.items) {
        await addToCartMutation.mutateAsync({
          items: [localItem],
        })
      }

      // Fetch updated cart
      await refetchServerCart()

      // Clear local cart after successful sync
      clearLocalCart()
      hasSyncedRef.current = true

      toast.success('Your cart has been synchronized')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sync cart'
      setError(errorMessage)
      console.error('Cart sync error:', error)

      // Show error but don't clear local cart
      toast.error('Could not sync cart. Items remain in local storage.')
    } finally {
      setSyncing(false)
      isSyncingRef.current = false
    }
  }, [
    isAuthenticated,
    localCart.items,
    addToCartMutation,
    refetchServerCart,
    clearLocalCart,
    setSyncing,
    setError,
  ])

  /**
   * Sync cart when user logs in
   */
  useEffect(() => {
    const shouldSync =
      isAuthenticated &&
      !authLoading &&
      localCart.items.length > 0 &&
      !hasSyncedRef.current

    if (shouldSync) {
      syncCartWithServer()
    }
  }, [isAuthenticated, authLoading, localCart.items.length, syncCartWithServer])

  /**
   * Update server cart in store when fetched
   */
  useEffect(() => {
    if (isAuthenticated && serverCartData) {
      setServerCart(serverCartData)
    }
  }, [isAuthenticated, serverCartData, setServerCart])

  /**
   * Clear server cart on logout
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setServerCart(null)
      hasSyncedRef.current = false
    }
  }, [isAuthenticated, setServerCart])

  /**
   * Handle online/offline state
   */
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && localCart.items.length > 0) {
        toast.info('Reconnected. Syncing cart...')
        syncCartWithServer()
      }
    }

    const handleOffline = () => {
      toast.warning('You are offline. Cart changes will be saved locally.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, localCart.items.length, syncCartWithServer])

  /**
   * Handle before unload - warn if cart sync is pending
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSyncingRef.current) {
        e.preventDefault()
        e.returnValue = 'Cart is syncing. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return <>{children}</>
}
