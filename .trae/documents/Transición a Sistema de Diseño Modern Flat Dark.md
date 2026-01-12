# Rediseño del Sistema de Diseño - Tema Oscuro Moderno (Flat)

## 1. Actualización de Documentación (.md)
Rediseñaremos `prd_book_stall_management.md` y `technical_architecture_book_stall.md` para reflejar el nuevo enfoque de diseño:
- **Estilo Visual**: Cambiar de "Liquid Glass" a "Modern Flat Dark Theme".
- **Paleta de Colores**: Definir grises oscuros profundos (`#09090b`), acentos vibrantes (e.g., violeta/azul eléctrico), y texto de alto contraste.
- **Tipografía**: Mantener sans-serif limpia (Inter/Geist), pero ajustar pesos y tamaños para modo oscuro.
- **Componentes**: Especificar bordes sutiles, sombras suaves (glow) en lugar de glassmorphism pesado, y tarjetas planas con fondos sólidos semi-transparentes.

## 2. Limpieza de "Liquid Glass" (Codebase)
Planificamos la eliminación de elementos del diseño anterior para evitar deuda técnica:
- **Componentes**: Eliminar `src/components/ui/glass.tsx` y `src/components/ui/liquid-filters.tsx`.
- **Assets**: Eliminar `public/background_login.svg` si ya no encaja con el estilo flat.
- **Estilos Globales**: Limpiar `src/app/globals.css` de animaciones `bg-move`, filtros SVG y clases utilitarias `.glass*`.

## 3. Implementación del Nuevo Sistema de Diseño
Crearemos una base sólida para el nuevo tema:
- **Tokens de Color (Tailwind)**:
  - `background`: `#09090b` (Zinc 950)
  - `surface`: `#18181b` (Zinc 900)
  - `surface-highlight`: `#27272a` (Zinc 800)
  - `primary`: `#6366f1` (Violet 500) o `#3b82f6` (Blue 500)
  - `text-primary`: `#fafafa` (Zinc 50)
  - `text-secondary`: `#a1a1aa` (Zinc 400)
- **Componentes Base**:
  - `Button`: Flat, sin gradientes complejos, estados hover claros.
  - `Input`: Fondo oscuro sólido, borde sutil, focus ring de color primario.
  - `Card`: Fondo `surface`, borde muy sutil (`border-zinc-800`), sin backdrop-blur pesado.

## 4. Rediseño de Pantallas Clave
- **Login**:
  - Fondo: Color sólido oscuro o gradiente radial muy sutil (sin imagen de bosque).
  - Formulario: Tarjeta central minimalista, inputs de alto contraste.
  - Feedback: Mensajes de error y éxito con colores planos y legibles.
- **Dashboard**:
  - Layout: Sidebar oscuro, contenido principal con fondo ligeramente más claro.
  - Tarjetas de métricas: Estilo flat, iconos simples.

## Plan de Ejecución
1.  **Actualizar Documentos**: Reescribir PRD y Arquitectura con las nuevas directrices.
2.  **Limpieza**: Borrar archivos `glass.tsx`, `liquid-filters.tsx`, `background_login.svg`.
3.  **Configuración**: Actualizar `globals.css` con las nuevas variables de tema oscuro.
4.  **Componentes**: Crear nuevos componentes base (`ui/button.tsx`, `ui/input.tsx`, `ui/card.tsx`) con el nuevo estilo.
5.  **Refactor**: Actualizar `Login` y `Dashboard` para usar los nuevos componentes y eliminar referencias a los antiguos.

¿Confirmas este plan para proceder con la actualización de la documentación y la posterior limpieza del código?