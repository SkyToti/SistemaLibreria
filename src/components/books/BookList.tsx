'use client'

import { useState, useRef, useEffect } from 'react'
import { Book, BookFormData } from '@/lib/types/book'
import { bookService } from '@/services/book.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash } from 'lucide-react'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'
import { BookForm } from './BookForm'
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

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useStaggeredEntrance(containerRef, '.book-row')

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const { data, count } = await bookService.getAll({
        page,
        limit: 10,
        search: searchTerm
      })
      setBooks(data)
      setTotalPages(Math.ceil(count / 10))
    } catch (error) {
      toast.error('Error al cargar libros')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [page, searchTerm])

  // Resetear página al buscar
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // Ya no filtramos en cliente
  const filteredBooks = books

  // Handlers
  const handleCreate = () => {
    setSelectedBook(null)
    setIsFormOpen(true)
  }

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (book: Book) => {
    setSelectedBook(book)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveBook = async (data: BookFormData) => {
    try {
      if (selectedBook) {
        await bookService.update(selectedBook.id, data)
        toast.success('Libro actualizado correctamente')
      } else {
        await bookService.create(data)
        toast.success('Libro creado correctamente')
      }
      await fetchBooks()
    } catch (error) {
      toast.error('Error al guardar el libro')
      console.error(error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedBook) {
      try {
        await bookService.delete(selectedBook.id)
        toast.success('Libro eliminado correctamente')
        await fetchBooks()
      } catch (error) {
        toast.error('Error al eliminar el libro')
        console.error(error)
      }
      setIsDeleteDialogOpen(false)
      setSelectedBook(null)
    }
  }

  if (loading && books.length === 0) {
    return <div className="text-zinc-500 text-sm p-4">Cargando inventario...</div>
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por título, autor o ISBN..."
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
            data-testid="create-book-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Libro
          </Button>
        </div>
      </div>

      <BookForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSaveBook}
        initialData={selectedBook ? selectedBook : undefined}
        isEditing={!!selectedBook}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. El libro se eliminará permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none" data-testid="confirm-delete-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lista de Libros (Estilo Tabla Moderna) */}
      <div ref={containerRef} className={`grid gap-2 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          <div className="col-span-5">Libro</div>
          <div className="col-span-2">Categoría</div>
          <div className="col-span-2 text-right">Precio</div>
          <div className="col-span-2 text-center">Stock</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            data-testid={`book-row-${book.title}`}
            className="book-row grid grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-zinc-900/30 border border-transparent hover:bg-zinc-900/60 hover:border-white/5 transition-all duration-200 group"
          >
            {/* Info Libro */}
            <div className="col-span-5 flex gap-4 items-center">
              <div className="h-12 w-8 rounded bg-zinc-800 shadow-sm flex-shrink-0" /> {/* Placeholder portada */}
              <div>
                <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{book.title}</h3>
                <p className="text-xs text-zinc-500">{book.author}</p>
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{book.isbn}</p>
              </div>
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/5">
                {book.category}
              </span>
            </div>

            {/* Precio */}
            <div className="col-span-2 text-right font-medium text-zinc-300">
              ${book.sale_price.toFixed(2)}
            </div>

            {/* Stock */}
            <div className="col-span-2 flex justify-center">
              <div className={`
                px-3 py-1 rounded-full text-xs font-bold border
                ${book.stock_quantity === 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  book.stock_quantity < 10 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
              `}>
                {book.stock_quantity} un.
              </div>
            </div>

            {/* Acciones */}
            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                onClick={() => handleEdit(book)}
                data-testid={`edit-book-${book.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-red-900/20 text-zinc-400 hover:text-red-400"
                onClick={() => handleDeleteClick(book)}
                data-testid={`delete-book-${book.id}`}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-zinc-800"
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-zinc-400">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-zinc-800"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
