export interface Supplier {
  id: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export type SupplierFormData = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
