'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCartStore } from '@/store/cart.store'
import { bookService } from '@/services/book.service'
import { Book } from '@/lib/types/book'
import { useState } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { salesService } from '@/services/sales.service'

export default function POSPage() {
  const containerRef = useRef(null)
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore()

  // Cargar libros con paginación y filtros
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const { data, count } = await bookService.getAll({
          page,
          limit: 12, // 12 items por página
          search: searchTerm,
          category: categoryFilter
        })
        setBooks(data)
        setTotalPages(Math.ceil(count / 12))
      } catch (error) {
        toast.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }

    // Debounce para búsqueda
    const timeoutId = setTimeout(() => {
      fetchBooks()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [page, searchTerm, categoryFilter])

  const [categories, setCategories] = useState<string[]>([])

  // Cargar categorías al inicio
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await bookService.getCategories()
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [searchTerm, categoryFilter])


  // Animación de entrada
  useGSAP(() => {
    const tl = gsap.timeline()

    tl.from(".pos-header", {
      y: -20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    })
      .from(".product-grid", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.3")
      .from(".cart-sidebar", {
        x: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.5")

  }, { scope: containerRef })

  // Ya no filtramos en cliente
  const filteredBooks = Array.isArray(books) ? books : []

  const handleAddToCart = (book: Book) => {
    if (book.stock_quantity <= 0) {
      toast.error('Producto sin stock')
      return
    }
    addItem(book)
    toast.success('Producto agregado', { duration: 1500 })
  }

  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setProcessing(true)
    try {
      await salesService.processSale(items, total(), paymentMethod)
      toast.success('¡Venta realizada con éxito!', { duration: 3000 })
      clearCart()

      // Recargar libros para actualizar stock visualmente
      // Forzamos un pequeño delay para asegurar que la transacción en DB se haya propagado
      // y la lectura subsiguiente obtenga los datos actualizados.
      setLoading(true)
      setTimeout(async () => {
        try {
          const { data, count } = await bookService.getAll({
            page,
            limit: 12,
            search: searchTerm,
            category: categoryFilter
          })
          setBooks(data)
          setTotalPages(Math.ceil(count / 12))
        } catch (error) {
          console.error('Error refreshing books:', error)
        } finally {
          setLoading(false)
        }
      }, 500)

    } catch (error) {
      toast.error('Error al procesar la venta')
      setProcessing(false) // Aseguramos que se desbloquee el botón si falla
    } finally {
      // Nota: El setProcessing(false) se maneja arriba en caso de éxito o error
      // Si lo ponemos aquí, podría parpadear si la recarga es muy rápida
      if (processing) setProcessing(false)
    }
  }

  return (
    <div ref={containerRef} className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="pos-header flex justify-between items-center bg-zinc-900/50 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Punto de Venta</h2>
          <p className="text-sm text-zinc-400">Selecciona productos para iniciar una venta</p>
        </div>
        <div className="flex gap-4">
          <div className="w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-zinc-950/50 border-white/10 rounded-xl text-zinc-300">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nombre o ISBN..."
              className="pl-10 bg-zinc-950/50 border-white/10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Catálogo de Productos (Izquierda) */}
        <div className="product-grid col-span-8 overflow-y-auto pr-2 pb-2">
          {loading && filteredBooks.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">Cargando catálogo...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">No se encontraron productos</div>
          ) : (
            <div className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {filteredBooks.map((book) => (
                <Card
                  key={book.id}
                  data-testid={`book-card-${book.id}`}
                  className="group relative border-none bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 transition-all cursor-pointer overflow-hidden"
                  onClick={() => handleAddToCart(book)}
                >
                  <div className="p-4 flex flex-col h-full gap-3">
                    <div className="h-32 w-full rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                      {book.cover_image_url ? (
                        <img src={book.cover_image_url} alt={book.title} className="h-full object-cover rounded-xl" />
                      ) : (
                        <BookOpen className="h-8 w-8 opacity-20" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">{book.title}</h3>
                      <p className="text-xs text-zinc-500 mb-2">{book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-400">${book.sale_price.toFixed(2)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${book.stock_quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {book.stock_quantity} un.
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {/* Paginación */}
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

        {/* Carrito (Derecha) */}
        <div className="cart-sidebar col-span-4 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              Carrito Actual
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={clearCart}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-zinc-950/30 p-3 rounded-xl border border-white/5">
                  <div className="h-16 w-12 bg-zinc-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-zinc-200 line-clamp-1">{item.title}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
                        <button
                          className="h-6 w-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          className="h-6 w-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-white">
                        ${(item.sale_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-zinc-950/50 border-t border-white/5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Impuestos</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/5">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
                onClick={() => handleCheckout('cash')}
                disabled={processing || items.length === 0}
              >
                <Banknote className="mr-2 h-4 w-4" />
                {processing ? 'Procesando...' : 'Efectivo'}
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
                onClick={() => handleCheckout('card')}
                disabled={processing || items.length === 0}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {processing ? 'Procesando...' : 'Tarjeta'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
