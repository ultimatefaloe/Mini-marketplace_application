import React, { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useAuth } from '@/hooks'
import { toast } from 'react-toastify'

interface CartProviderProps {
  children: React.ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { syncCartWithServer, localCart } = useCartStore()

  // Handle cart synchronization on mount and auth changes
  useEffect(() => {
    const handleCartSync = async () => {
      if (isAuthenticated && !authLoading && localCart.items.length > 0) {
        try {
          await syncCartWithServer()

          // Show success notification only once
          setTimeout(() => {
            toast.success('Cart synchronized')
          }, 500)
        } catch (error) {
          console.error('Failed to sync cart:', error)

          // Don't show error toast on initial load to avoid annoyance
          if (localCart.items.length > 0) {
            toast.error(
              'Some items could not be saved. They remain in your local cart.',
            )
          }
        }
      }
    }

    // Only sync if user is authenticated and has local cart items
    if (isAuthenticated && localCart.items.length > 0) {
      handleCartSync()
    }
  }, [isAuthenticated, authLoading, localCart.items.length, syncCartWithServer])

  // Clear server cart on logout
  useEffect(() => {
    const handleLogout = () => {
      const { _setServerCart } = useCartStore.getState()
      _setServerCart(null)
    }

    // Listen for auth logout event
    const handleAuthLogout = () => handleLogout()
    window.addEventListener('auth-logout', handleAuthLogout)

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout)
    }
  }, [])

  // Handle offline/online state for cart persistence
  useEffect(() => {
    const handleOnline = () => {
      // When coming back online, attempt to sync if authenticated
      if (isAuthenticated && localCart.items.length > 0) {
        toast.info('Attempting to sync cart with server...')
        syncCartWithServer().catch(() => {
          toast.error(
            'Sync failed, please check your connection and try again.',
          )
        })
      }
    }

    const handleOffline = () => {
      toast.warning('Offline, cart changes will be saved locally.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, localCart.items.length, syncCartWithServer])

  return <>{children}</>
}
