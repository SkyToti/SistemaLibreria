'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { SupplierFormData } from '@/lib/types/supplier'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const supplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type SupplierSchema = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SupplierFormData) => void
  initialData?: SupplierFormData
  isEditing?: boolean
}

export function SupplierForm({ open, onOpenChange, onSubmit, initialData, isEditing = false }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          contact_person: initialData.contact_person || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          address: initialData.address || '',
          status: initialData.status,
        })
      } else {
        reset({
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          address: '',
          status: 'active',
        })
      }
    }
  }, [initialData, open, reset])

  const onSubmitForm = async (data: SupplierSchema) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    onSubmit(data as SupplierFormData)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-400">Nombre de la Empresa</Label>
            <Input
              id="name"
              placeholder="Ej. Editorial Planeta"
              {...register('name')}
              className="flat-input bg-zinc-900/50 border-zinc-800"
              data-testid="input-name"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-zinc-400">Contacto</Label>
              <Input
                id="contact_person"
                placeholder="Nombre del contacto"
                {...register('contact_person')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-400">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+52..."
                {...register('phone')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-phone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@editorial.com"
              {...register('email')}
              className="flat-input bg-zinc-900/50 border-zinc-800"
              data-testid="input-email"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-zinc-400">Dirección</Label>
            <Input
              id="address"
              placeholder="Calle Principal #123"
              {...register('address')}
              className="flat-input bg-zinc-900/50 border-zinc-800"
              data-testid="input-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-zinc-400">Estado</Label>
            <Select
              value={watch('status')}
              onValueChange={(val) => setValue('status', val as 'active' | 'inactive')}
            >
              <SelectTrigger className="flat-input bg-zinc-900/50 border-zinc-800" data-testid="select-status">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 text-zinc-400">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white" data-testid="submit-supplier-btn">
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
