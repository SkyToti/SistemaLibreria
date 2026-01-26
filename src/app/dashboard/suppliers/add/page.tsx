'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supplierService } from '@/services/supplier.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { SupplierFormData } from '@/lib/types/supplier'

export default function AddSupplierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supplierService.create(formData)
      router.push('/dashboard/suppliers')
      router.refresh()
    } catch (error) {
      console.error('Error creating supplier:', error)
      alert('Error al crear el proveedor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/suppliers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Nuevo Proveedor</h1>
      </div>

      <Card className="p-8 flat-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">Nombre de la Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ej. Editorial Planeta"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-white/80">Persona de Contacto</Label>
              <Input
                id="contact"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej. 555-123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white/80">Dirección</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle Principal #123, Ciudad"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Guardar Proveedor
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
