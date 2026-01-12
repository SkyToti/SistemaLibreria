import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Book } from '@/lib/types/book'

export interface CartItem extends Book {
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (book: Book) => void
  removeItem: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (book) => {
        const items = get().items
        const existingItem = items.find((item) => item.id === book.id)

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === book.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...items, { ...book, quantity: 1 }] })
        }
      },

      removeItem: (bookId) => {
        set({ items: get().items.filter((item) => item.id !== bookId) })
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(bookId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === bookId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.sale_price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'pos-cart-storage',
    }
  )
)
