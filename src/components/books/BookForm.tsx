'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BookFormData } from '@/lib/types/book'
import { categoryService, Category } from '@/services/category.service'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
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

  // Cargar categorías y actualizar formulario cuando se abra el modal
  useEffect(() => {
    if (open) {
      // Cargar categorías desde Supabase
      categoryService.getAll().then(setCategories).catch(console.error)

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
        setCategoryInput(initialData.category || '')
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
        setCategoryInput('')
      }
    }
  }, [initialData, open, reset])

  const onSubmitForm = async (data: BookSchema) => {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Si la categoría es nueva (no está en la lista), guardarla
    const categoryExists = categories.some(c => c.name === data.category)
    if (!categoryExists && data.category) {
      await categoryService.create(data.category)
    }

    onSubmit(data as BookFormData)
    reset()
    setCategoryInput('')
    onOpenChange(false)
  }

  // Interceptar cierre del modal
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen && isDirty) {
      // Si hay cambios sin guardar, mostrar confirmación
      setShowDiscardDialog(true)
    } else {
      onOpenChange(isOpen)
    }
  }

  // Confirmar descarte de cambios
  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false)
    reset()
    onOpenChange(false)
  }

  return (
    <>
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white">
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={handleDialogChange}>
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

              <div className="space-y-2 relative">
                <Label htmlFor="category" className="text-zinc-400">Categoría</Label>
                <div className="relative">
                  <Input
                    id="category"
                    placeholder="Selecciona o escribe nueva..."
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value)
                      setValue('category', e.target.value)
                      setShowCategoryDropdown(true)
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    className="flat-input bg-zinc-900/50 border-zinc-800"
                    data-testid="input-category"
                    autoComplete="off"
                  />
                  {showCategoryDropdown && categories.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {categories
                        .filter(c => c.name.toLowerCase().includes(categoryInput.toLowerCase()))
                        .map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setCategoryInput(category.name)
                              setValue('category', category.name)
                              setShowCategoryDropdown(false)
                            }}
                          >
                            {category.name}
                          </button>
                        ))}
                      {categoryInput && !categories.some(c => c.name.toLowerCase() === categoryInput.toLowerCase()) && (
                        <div className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-800">
                          + Crear "{categoryInput}" como nueva categoría
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)} className="hover:bg-zinc-800 text-zinc-400">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white" data-testid="submit-book-btn">
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Libro' : 'Crear Libro')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
