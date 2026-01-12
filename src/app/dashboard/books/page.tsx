'use client'

import { useRef } from 'react'
import { BookList } from '@/components/books/BookList'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function BooksPage() {
  const containerRef = useRef(null)

  useGSAP(() => {
    gsap.from(".page-header", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="page-header flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Inventario de Libros</h2>
        <p className="text-zinc-400">Gestiona el catálogo, existencias y precios.</p>
      </div>

      <BookList />
    </div>
  )
}
