import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  ICart, 
  ICartItem, 
  IAddToCartPayload, 
  ObjectId,
  FrontendSafe, 
  IVariantOptions
} from '@/types';
import { useAddToCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useCart } from '@/api/cart.query';
import { useAuth } from '@/hooks';

// Local cart storage key
const LOCAL_CART_STORAGE_KEY = 'fashionket-local-cart';

interface LocalCart {
  items: ICartItem[];
  updatedAt: string;
}

interface CartState {
  // Local cart state (for unauthenticated users)
  localCart: ICart;
  
  // Server cart state (for authenticated users)
  serverCart: FrontendSafe<ICart> | null;
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  
  // Actions
  addToCart: (payload: {
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    quantity: number;
    variantOptions?: IVariantOptions;
  }) => Promise<void>;
  
  updateCartItem: (payload: {
    productId: string;
    quantity: number;
  }) => Promise<void>;
  
  removeFromCart: (productId: string) => Promise<void>;
  
  clearCart: () => Promise<void>;
  
  getCartSummary: () => {
    itemCount: number;
    subtotal: number;
    items: Array<{
      productId: string;
      nameSnapshot: string;
      priceSnapshot: number;
      quantity: number;
      variantOptions?: IVariantOptions;
      productImage?: string;
    }>;
  };
  
  syncCartWithServer: () => Promise<void>;
  
  // Internal actions
  _setServerCart: (cart: FrontendSafe<ICart> | null) => void;
  _setLoading: (loading: boolean) => void;
  _setSyncing: (syncing: boolean) => void;
}

// Helper functions
const createLocalCartItem = (
  productId: string,
  productName: string,
  productPrice: number,
  quantity: number,
  productImage?: string,
  variantOptions?: IVariantOptions
): ICartItem => ({
  productId,
  nameSnapshot: productName,
  priceSnapshot: productPrice,
  quantity,
  productImage,
  variantOptions,
});

const mergeCarts = (
  localCart: LocalCart,
  serverCart: FrontendSafe<ICart>
): IAddToCartPayload[] => {
  const mergePayloads: IAddToCartPayload[] = [];
  const serverItemsMap = new Map(
    serverCart.items.map(item => [item.productId.toString(), item.quantity])
  );

  // For each item in local cart, check if it exists in server cart
  localCart.items.forEach(localItem => {
    const serverQuantity = serverItemsMap.get(localItem.productId);
    
    if (serverQuantity) {
      // Item exists in both carts, update to combined quantity
      if (localItem.quantity !== serverQuantity) {
        mergePayloads.push({
          productId: localItem.productId as ObjectId,
          quantity: localItem.quantity + serverQuantity,
        });
      }
    } else {
      // Item only exists in local cart, add it
      mergePayloads.push({
        productId: localItem.productId as ObjectId,
        quantity: localItem.quantity,
      });
    }
  });

  return mergePayloads;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      localCart: {
        items: [],
        updatedAt: new Date().toISOString(),
      },
      serverCart: null,
      isLoading: false,
      isSyncing: false,

      // Actions
      addToCart: async (payload) => {
        const { isAuthenticated } = useAuth();
        const { localCart, serverCart } = get();
        
        if (isAuthenticated && serverCart) {
          // Authenticated user - add to server
          try {
            set({ isLoading: true });
            const { mutateAsync: addToCartMutation } = useAddToCart();
            await addToCartMutation({
              productId: payload.productId as ObjectId,
              quantity: payload.quantity,
            });
            
            // Fetch updated cart from server
            const { refetch } = useCart();
            const { data } = await refetch();
            set({ 
              serverCart: data || null,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to add item to server cart:', error);
            set({ isLoading: false });
            throw error;
          }
        } else {
          // Unauthenticated user - add to local storage
          const existingItemIndex = localCart.items.findIndex(
            item => item.productId === payload.productId
          );

          let updatedItems: ICartItem[];
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            updatedItems = [...localCart.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + payload.quantity,
            };
          } else {
            // Add new item
            const newItem = createLocalCartItem(
              payload.productId,
              payload.productName,
              payload.productPrice,
              payload.quantity,
              payload.productImage,
              payload.variantOptions
            );
            console.log(newItem)
            updatedItems = [...localCart.items, newItem];
          }

          set({
            localCart: {
              items: updatedItems,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      updateCartItem: async (payload) => {
        const { isAuthenticated } = useAuth();
        const { localCart, serverCart } = get();
        
        if (isAuthenticated && serverCart) {
          // Authenticated user - update on server
          try {
            set({ isLoading: true });
            const { mutateAsync: updateCartItemMutation } = useUpdateCartItem();
            await updateCartItemMutation({
              productId: payload.productId as ObjectId,
              quantity: payload.quantity,
            });
            
            // Fetch updated cart from server
            const { refetch } = useCart();
            const { data } = await refetch();
            set({ 
              serverCart: data || null,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to update cart item on server:', error);
            set({ isLoading: false });
            throw error;
          }
        } else {
          // Unauthenticated user - update in local storage
          const existingItemIndex = localCart.items.findIndex(
            item => item.productId === payload.productId
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...localCart.items];
            
            if (payload.quantity <= 0) {
              // Remove item if quantity is 0 or less
              updatedItems.splice(existingItemIndex, 1);
            } else {
              // Update quantity
              updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: payload.quantity,
              };
            }

            set({
              localCart: {
                items: updatedItems,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        }
      },

      removeFromCart: async (productId) => {
        const { isAuthenticated } = useAuth();
        const { localCart, serverCart } = get();
        
        if (isAuthenticated && serverCart) {
          // Authenticated user - remove from server
          try {
            set({ isLoading: true });
            const { mutateAsync: removeFromCartMutation } = useRemoveFromCart();
            await removeFromCartMutation(productId);
            
            // Fetch updated cart from server
            const { refetch } = useCart();
            const { data } = await refetch();
            set({ 
              serverCart: data || null,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to remove item from server cart:', error);
            set({ isLoading: false });
            throw error;
          }
        } else {
          // Unauthenticated user - remove from local storage
          const updatedItems = localCart.items.filter(
            item => item.productId !== productId
          );

          set({
            localCart: {
              items: updatedItems,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuth();
        
        if (isAuthenticated) {
          // Authenticated user - clear server cart
          try {
            set({ isLoading: true });
            const { mutateAsync: clearCartMutation } = useClearCart();
            await clearCartMutation();
            
            set({ 
              serverCart: null,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to clear server cart:', error);
            set({ isLoading: false });
            throw error;
          }
        }
        
        // Always clear local cart
        set({
          localCart: {
            items: [],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      getCartSummary: () => {
        const { isAuthenticated } = useAuth();
        const { localCart, serverCart } = get();
        
        if (isAuthenticated && serverCart) {
          // Use server cart for authenticated users
          const items = serverCart.items.map(item => ({
            productId: item.productId.toString(),
            nameSnapshot: item.nameSnapshot,
            priceSnapshot: item.priceSnapshot,
            quantity: item.quantity,
            variantOptions: item.variantOptions,
          }));
          
          return {
            itemCount: items.reduce((total, item) => total + item.quantity, 0),
            subtotal: items.reduce(
              (total, item) => total + (item.priceSnapshot * item.quantity),
              0
            ),
            items,
          };
        } else {
          // Use local cart for unauthenticated users
          const items = localCart.items.map(item => ({
            productId: item.productId,
            nameSnapshot: item.nameSnapshot,
            priceSnapshot: item.priceSnapshot,
            quantity: item.quantity,
            variantOptions: item.variantOptions,
            productImage: item.productImage,
          }));
          
          return {
            itemCount: items.reduce((total, item) => total + item.quantity, 0),
            subtotal: items.reduce(
              (total, item) => total + (item.priceSnapshot * item.quantity),
              0
            ),
            items,
          };
        }
      },

      syncCartWithServer: async () => {
        const { isAuthenticated } = useAuth();
        const { localCart } = get();
        
        if (!isAuthenticated || localCart.items.length === 0) {
          return;
        }

        try {
          set({ isSyncing: true });
          
          // Fetch current server cart
          const { data: serverCartData } = await useCart().refetch();
          
          if (serverCartData) {
            // Merge local cart with server cart
            const mergePayloads = mergeCarts(localCart, serverCartData);
            
            if (mergePayloads.length > 0) {
              const { mutateAsync: addToCartMutation } = useAddToCart();
              
              // Add all merged items to server
              for (const payload of mergePayloads) {
                await addToCartMutation(payload);
              }
            }
            
            // Fetch updated cart
            const { data: updatedCart } = await useCart().refetch();
            set({ 
              serverCart: updatedCart || null,
              localCart: {
                items: [],
                updatedAt: new Date().toISOString(),
              },
              isSyncing: false,
            });
          } else {
            // No existing server cart, create new one with all local items
            const { mutateAsync: addToCartMutation } = useAddToCart();
            
            for (const localItem of localCart.items) {
              await addToCartMutation({
                productId: localItem.productId as ObjectId,
                quantity: localItem.quantity,
              });
            }
            
            // Fetch new cart
            const { data: newCart } = await useCart().refetch();
            set({ 
              serverCart: newCart || null,
              localCart: {
                items: [],
                updatedAt: new Date().toISOString(),
              },
              isSyncing: false,
            });
          }
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
          set({ isSyncing: false });
          throw error;
        }
      },

      // Internal actions
      _setServerCart: (cart) => {
        set({ serverCart: cart });
      },
      
      _setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      _setSyncing: (syncing) => {
        set({ isSyncing: syncing });
      },
    }),
    {
      name: LOCAL_CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localCart: state.localCart,
      }),
      // // Only persist local cart, not server cart or loading states
      // partializeState: (state) => ({
      //   localCart: state.localCart,
      // }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Cart store rehydration error:', error);
          }
        };
      },
    }
  )
);