'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BookFormData } from '@/lib/types/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const bookSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  author: z.string().min(2, 'El autor debe tener al menos 2 caracteres'),
  editorial: z.string().optional(),
  isbn: z.string().min(10, 'El ISBN debe ser válido'),
  purchase_price: z.coerce.number().min(0, 'El precio de compra no puede ser negativo'),
  sale_price: z.coerce.number().min(0.01, 'El precio de venta debe ser mayor a 0'),
  stock_quantity: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  category: z.string().min(1, 'Selecciona una categoría'),
})

type BookSchema = z.infer<typeof bookSchema>

interface BookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BookFormData) => void
  initialData?: BookFormData
  isEditing?: boolean
}

export function BookForm({ open, onOpenChange, onSubmit, initialData, isEditing = false }: BookFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookSchema>({
    resolver: zodResolver(bookSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      editorial: initialData?.editorial || '',
      isbn: initialData?.isbn || '',
      purchase_price: initialData?.purchase_price || 0,
      sale_price: initialData?.sale_price || 0,
      stock_quantity: initialData?.stock_quantity || 0,
      category: initialData?.category || '',
    },
  })

  // Actualizar formulario cuando initialData cambie (al abrir edición)
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title,
          author: initialData.author,
          editorial: initialData.editorial || '',
          isbn: initialData.isbn,
          purchase_price: initialData.purchase_price,
          sale_price: initialData.sale_price,
          stock_quantity: initialData.stock_quantity,
          category: initialData.category,
        })
      } else {
        reset({
          title: '',
          author: '',
          editorial: '',
          isbn: '',
          purchase_price: 0,
          sale_price: 0,
          stock_quantity: 0,
          category: '',
        })
      }
    }
  }, [initialData, open, reset])

  const onSubmitForm = async (data: BookSchema) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    onSubmit(data as BookFormData)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Editar Libro' : 'Nuevo Libro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title" className="text-zinc-400">Título</Label>
              <Input
                id="title"
                placeholder="Ej. Cien Años de Soledad"
                {...register('title')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-title"
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="text-zinc-400">Autor</Label>
              <Input
                id="author"
                placeholder="Ej. Gabriel García Márquez"
                {...register('author')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-author"
              />
              {errors.author && <p className="text-xs text-red-400">{errors.author.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn" className="text-zinc-400">ISBN</Label>
              <Input
                id="isbn"
                placeholder="978-..."
                {...register('isbn')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-isbn"
              />
              {errors.isbn && <p className="text-xs text-red-400">{errors.isbn.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editorial" className="text-zinc-400">Editorial</Label>
              <Input
                id="editorial"
                placeholder="Ej. Planeta, Alfaguara..."
                {...register('editorial')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-editorial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-zinc-400">Precio Compra ($)</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                {...register('purchase_price')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-purchase-price"
              />
              {errors.purchase_price && <p className="text-xs text-red-400">{errors.purchase_price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price" className="text-zinc-400">Precio Venta ($)</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                {...register('sale_price')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-sale-price"
              />
              {errors.sale_price && <p className="text-xs text-red-400">{errors.sale_price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className="text-zinc-400">Stock</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...register('stock_quantity')}
                className="flat-input bg-zinc-900/50 border-zinc-800"
                data-testid="input-stock"
              />
              {errors.stock_quantity && <p className="text-xs text-red-400">{errors.stock_quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-zinc-400">Categoría</Label>
              <Select
                value={watch('category')}
                onValueChange={(val) => setValue('category', val)}
              >
                <SelectTrigger className="flat-input bg-zinc-900/50 border-zinc-800" data-testid="select-category">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="Ficción">Ficción</SelectItem>
                  <SelectItem value="No Ficción">No Ficción</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                  <SelectItem value="Educativo">Educativo</SelectItem>
                  <SelectItem value="Historia">Historia</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 text-zinc-400">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white" data-testid="submit-book-btn">
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Libro' : 'Crear Libro')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
