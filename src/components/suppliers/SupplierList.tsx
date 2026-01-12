'use client'

import { useState, useRef, useEffect } from 'react'
import { Supplier, SupplierFormData } from '@/lib/types/supplier'
import { supplierService } from '@/services/supplier.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Filter, Edit, Trash, Users, Phone, Mail, MapPin } from 'lucide-react'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'
import { SupplierForm } from './SupplierForm'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAll()
      setSuppliers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useStaggeredEntrance(containerRef, ".supplier-row")

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedSupplier(null)
    setIsFormOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveSupplier = async (data: SupplierFormData) => {
    try {
      if (selectedSupplier) {
        await supplierService.update(selectedSupplier.id, data)
        toast.success('Proveedor actualizado correctamente')
      } else {
        await supplierService.create(data)
        toast.success('Proveedor creado correctamente')
      }
      await fetchSuppliers()
    } catch (error) {
      toast.error('Error al guardar el proveedor')
      console.error(error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedSupplier) {
      try {
        await supplierService.delete(selectedSupplier.id)
        toast.success('Proveedor eliminado correctamente')
        await fetchSuppliers()
      } catch (error: any) {
        if (error.message === 'CONSTRAINT_VIOLATION') {
          toast.error('No se puede eliminar el proveedor', {
            description: 'Este proveedor tiene libros asociados en el inventario. Intenta marcarlo como inactivo en su lugar.',
            duration: 5000,
          })
        } else {
          toast.error('Error al eliminar el proveedor')
        }
        console.error(error)
      }
      setIsDeleteDialogOpen(false)
      setSelectedSupplier(null)
    }
  }

  if (loading) {
    return <div className="text-zinc-500 text-sm p-4">Cargando proveedores...</div>
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nombre, contacto o email..."
            className="pl-10 bg-zinc-950/50 border-white/10 rounded-xl focus:ring-indigo-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-zinc-800 text-zinc-300">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            onClick={handleCreate}
            data-testid="create-supplier-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      <SupplierForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSaveSupplier}
        initialData={selectedSupplier ? selectedSupplier : undefined}
        isEditing={!!selectedSupplier}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción eliminará al proveedor permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none" data-testid="confirm-delete-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grid de Proveedores */}
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="supplier-row group relative p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
            data-testid={`supplier-card-${supplier.name}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  onClick={() => handleEdit(supplier)}
                  data-testid={`edit-supplier-${supplier.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-red-900/20 text-zinc-400 hover:text-red-400"
                  onClick={() => handleDeleteClick(supplier)}
                  data-testid={`delete-supplier-${supplier.id}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{supplier.name}</h3>
            <p className="text-sm text-zinc-500 mb-4">{supplier.contact_person || 'Sin contacto'}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-600" />
                <span className="truncate">{supplier.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <Phone className="h-4 w-4 text-zinc-600" />
                <span>{supplier.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-600" />
                <span className="truncate">{supplier.address || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supplier.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-zinc-500/10 text-zinc-400'
                }`}>
                {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
