import { createClient } from '@/lib/supabase/client'
import { Book, BookFormData } from '@/lib/types/book'

export interface GetBooksParams {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export interface PaginatedBooks {
  data: Book[]
  count: number
}

export const bookService = {
  getAll: async (params: GetBooksParams = {}): Promise<PaginatedBooks> => {
    const supabase = createClient()
    const { page = 1, limit = 50, search, category } = params
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`title.ilike.%${search}%,isbn.ilike.%${search}%`)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching books:', error)
      throw new Error('Error al cargar los libros')
    }

    return {
      data: data || [],
      count: count || 0
    }
  },

  getCategories: async (): Promise<string[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('books')
      .select('category')
      .order('category')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Filter unique categories and remove nulls/undefined
    const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean)
    return uniqueCategories
  },

  getById: async (id: string): Promise<Book | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching book:', error)
      return null
    }

    return data
  },

  create: async (data: BookFormData): Promise<Book> => {
    const supabase = createClient()
    const { data: newBook, error } = await supabase
      .from('books')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error creating book - Full Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Error al crear el libro: ${error.message}`)
    }

    return newBook
  },

  update: async (id: string, data: Partial<BookFormData>): Promise<Book> => {
    const supabase = createClient()
    const { data: updatedBook, error } = await supabase
      .from('books')
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating book - Full Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Error al actualizar el libro: ${error.message}`)
    }

    if (!updatedBook) {
      console.error('No book found with ID:', id)
      throw new Error('No se encontró el libro para actualizar. Verifica que tienes permisos de administrador.')
    }

    return updatedBook
  },

  delete: async (id: string): Promise<void> => {
    const supabase = createClient()
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting book:', error)
      throw new Error('Error al eliminar el libro')
    }
  }
}
