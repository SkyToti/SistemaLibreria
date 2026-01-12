import { createClient } from '@/lib/supabase/client'
import { Supplier, SupplierFormData } from '@/lib/types/supplier'

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suppliers:', error)
      throw new Error('Error al cargar los proveedores')
    }

    return data || []
  },

  getById: async (id: string): Promise<Supplier | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching supplier:', error)
      return null
    }

    return data
  },

  create: async (data: SupplierFormData): Promise<Supplier> => {
    const supabase = createClient()
    const { data: newSupplier, error } = await supabase
      .from('suppliers')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error creating supplier:', error)
      throw new Error('Error al crear el proveedor')
    }

    return newSupplier
  },

  update: async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    const supabase = createClient()
    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating supplier:', error)
      throw new Error('Error al actualizar el proveedor')
    }

    if (!updatedSupplier) {
      throw new Error('No se encontró el proveedor para actualizar')
    }

    return updatedSupplier
  },

  delete: async (id: string): Promise<void> => {
    const supabase = createClient()
    const { error, count } = await supabase
      .from('suppliers')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) {
      console.error('Error deleting supplier:', error)
      // Check for foreign key constraint violation (Postgres code 23503)
      if (error.code === '23503') {
        throw new Error('CONSTRAINT_VIOLATION')
      }
      throw new Error('Error al eliminar el proveedor')
    }

    if (count === 0) {
      throw new Error('No se pudo eliminar el proveedor. Verifique permisos o si el registro existe.')
    }
  },

  // Add soft delete method just in case
  archive: async (id: string): Promise<void> => {
    const supabase = createClient()
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) {
      console.error('Error archiving supplier:', error)
      throw new Error('Error al archivar el proveedor')
    }
  }
}
