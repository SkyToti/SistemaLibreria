import { createClient } from '@/lib/supabase/client'

export interface Category {
    id: string
    name: string
    created_at?: string
}

export const categoryService = {
    /**
     * Obtener todas las categorías ordenadas por nombre
     */
    getAll: async (): Promise<Category[]> => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            throw new Error('Error al cargar categorías')
        }

        return data || []
    },

    /**
     * Crear una nueva categoría
     * Si ya existe, simplemente retorna sin error (ON CONFLICT)
     */
    create: async (name: string): Promise<Category | null> => {
        const supabase = createClient()

        // Primero verificar si ya existe
        const { data: existing } = await supabase
            .from('categories')
            .select('*')
            .eq('name', name)
            .single()

        if (existing) {
            return existing
        }

        // Si no existe, crear nueva
        const { data, error } = await supabase
            .from('categories')
            .insert({ name })
            .select()
            .single()

        if (error) {
            console.error('Error creating category:', error)
            // Si es error de duplicado, no lanzar error
            if (error.code === '23505') {
                return null
            }
            throw new Error('Error al crear categoría')
        }

        return data
    },

    /**
     * Buscar categoría por nombre (para autocompletado)
     */
    search: async (query: string): Promise<Category[]> => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('name', { ascending: true })
            .limit(10)

        if (error) {
            console.error('Error searching categories:', error)
            return []
        }

        return data || []
    }
}
