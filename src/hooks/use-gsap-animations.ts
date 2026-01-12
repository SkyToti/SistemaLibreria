import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * Hook para animar la entrada escalonada de elementos hijos
 * @param scopeRef Referencia al contenedor padre
 * @param selector Selector CSS de los elementos hijos (ej: '.card')
 */
export function useStaggeredEntrance(scopeRef: React.RefObject<HTMLElement | null>, selector: string) {
  useGSAP(() => {
    gsap.fromTo(
      selector,
      { 
        y: 50, 
        opacity: 0, 
        scale: 0.95 
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all" // Limpiar propiedades para no afectar layout posterior
      }
    )
  }, { scope: scopeRef })
}

/**
 * Hook para animar números (contador)
 * @param endValue Valor final numérico
 * @param duration Duración de la animación en segundos
 * @returns Objeto con ref para el elemento y el valor formateado si se necesita
 */
export function useAnimatedCounter(endValue: number, prefix: string = '', duration: number = 2) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const obj = { value: 0 }
    
    gsap.to(obj, {
      value: endValue,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        // Formatear con comas y 2 decimales si es necesario, o entero
        const formatted = obj.value.toLocaleString('en-US', {
          minimumFractionDigits: Number.isInteger(endValue) ? 0 : 2,
          maximumFractionDigits: Number.isInteger(endValue) ? 0 : 2
        })
        el.textContent = `${prefix}${formatted}`
      }
    })
  }, [endValue])

  return ref
}
