export interface Book {
  id: string
  title: string
  author: string
  editorial?: string
  isbn: string
  category: string
  purchase_price: number
  sale_price: number
  stock_quantity: number
  description?: string
  cover_image_url?: string
  supplier_id?: string
  created_at?: string
  updated_at?: string
}

export type BookFormData = Omit<Book, 'id' | 'created_at' | 'updated_at'>
