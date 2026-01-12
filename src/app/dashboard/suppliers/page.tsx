'use client'

import { useRef } from 'react'
import { SupplierList } from '@/components/suppliers/SupplierList'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function SuppliersPage() {
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
        <h2 className="text-3xl font-bold tracking-tight text-white">Gestión de Proveedores</h2>
        <p className="text-zinc-400">Administra tu red de distribución y contactos.</p>
      </div>

      <SupplierList />
    </div>
  )
}
