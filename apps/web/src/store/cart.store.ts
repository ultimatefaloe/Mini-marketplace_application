import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  ICart, 
  ICartItem, 
  ObjectId,
  FrontendSafe, 
  IVariantOptions
} from '@/types';

// Local cart storage key
const LOCAL_CART_STORAGE_KEY = 'fashionket-local-cart';

interface LocalCart {
  items: ICartItem[];
  updatedAt: string;
}

interface CartState {
  // Local cart state (for unauthenticated users)
  localCart: LocalCart;
  
  // Server cart state (for authenticated users)
  serverCart: FrontendSafe<ICart> | null;
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Actions
  addToLocalCart: (payload: {
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    quantity: number;
    variantOptions?: IVariantOptions;
  }) => void;
  
  updateLocalCartItem: (payload: {
    productId: string;
    quantity: number;
  }) => void;
  
  removeFromLocalCart: (productId: string) => void;
  
  clearLocalCart: () => void;
  
  getCartSummary: (isAuthenticated: boolean) => {
    itemCount: number;
    subtotal: number;
    items: Array<{
      _id?: string;
      productId: string;
      nameSnapshot: string;
      priceSnapshot: number;
      quantity: number;
      variantOptions?: IVariantOptions;
      productImage?: string;
    }>;
  };
  
  // Internal state setters
  setServerCart: (cart: FrontendSafe<ICart> | null) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset store
  reset: () => void;
}

// Helper function to create local cart item
const createLocalCartItem = (
  productId: string,
  productName: string,
  productPrice: number,
  quantity: number,
  productImage?: string,
  variantOptions?: IVariantOptions,
  _id?: string,
): ICartItem => ({
  productId: productId as ObjectId,
  nameSnapshot: productName,
  priceSnapshot: productPrice,
  quantity,
  productImage,
  variantOptions,
  _id: _id || ''
});

const initialState = {
  localCart: {
    items: [],
    updatedAt: new Date().toISOString(),
  },
  serverCart: null,
  isLoading: false,
  isSyncing: false,
  error: null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Local cart actions (no API calls here - keep pure)
      addToLocalCart: (payload) => {
        const { localCart } = get();
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
          updatedItems = [...localCart.items, newItem];
        }

        set({
          localCart: {
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          },
          error: null,
        });
      },

      updateLocalCartItem: (payload) => {
        const { localCart } = get();
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
            error: null,
          });
        }
      },

      removeFromLocalCart: (productId) => {
        const { localCart } = get();
        const updatedItems = localCart.items.filter(
          item => item.productId !== productId
        );

        set({
          localCart: {
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          },
          error: null,
        });
      },

      clearLocalCart: () => {
        set({
          localCart: {
            items: [],
            updatedAt: new Date().toISOString(),
          },
          error: null,
        });
      },

      getCartSummary: (isAuthenticated) => {
        const { localCart, serverCart } = get();
        
        if (isAuthenticated && serverCart) {
          // Use server cart for authenticated users
          const items = serverCart.items.map(item => ({
            _id: item._id,
            productId: item.productId.toString(),
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
        } else {
          // Use local cart for unauthenticated users
          const items = localCart.items.map(item => ({
            productId: item.productId.toString(),
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

      // Internal state setters
      setServerCart: (cart) => {
        set({ serverCart: cart, error: null });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setSyncing: (syncing) => {
        set({ isSyncing: syncing });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: LOCAL_CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localCart: state.localCart,
      }),
      onRehydrateStorage: () => {
        return (error) => {
          if (error) {
            console.error('Cart store rehydration error:', error);
          }
        };
      },
    }
  )
);