## Objetivo
Pulir el dashboard para que sea fluido en iPad y accesible, y cubrir los componentes clave con pruebas unitarias.

## Fase E — Rendimiento y Accesibilidad

### Rendimiento (Flat Dark, iPad-optimizado)
- Importación dinámica de gráficos para reducir TTI
  - `next/dynamic` con `ssr: false` para `RevenueChart` y `DonutOverview`
  - Envuelto en `React.Suspense` con skeletons livianos
- Memoización y reducción de renders
  - `React.memo` en `DashboardStats`, `TopCourses`, `RequestedWithdrawals`
  - Hooks (`useMemo`) para listas derivadas y formato de números
- Animaciones baratas en GPU
  - Sustituir `box-shadow` pesadas por `transform` + cambios de color
  - `will-change: transform, opacity` solo donde sea necesario
- Tamaños táctiles y responsive
  - Garantizar 44x44 px mínimos en ítems interactivos
  - Revisión de breakpoints (md, lg, xl) para iPad 11" landscape

### Accesibilidad
- Tabs en `TopCourses`
  - `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `id`
  - Navegación con teclado (izquierda/derecha) y roving tabindex
- Filtros en `RequestedWithdrawals`
  - Botones con `aria-pressed` y etiquetas claras
- Leyenda del donut
  - `aria-labels` por categoría y texto alternativo
- Focus ring consistente (usar tokens `--ring`)

### Skeletons y estados
- Placeholders para gráficos y listas mientras cargan dinámicamente
- Estados vacíos y de error con mensajes claros (Flat Dark)

## Fase F — Pruebas Unitarias (Vitest + React Testing Library)

### Alcance de pruebas
- `DashboardStats`
  - Renderiza 4 tarjetas, muestra valor y descripción
- `TopCourses`
  - Cambia entre tabs, lista y totales correctos, roles ARIA
- `RequestedWithdrawals`
  - Cambia rango 6m/12m (estado visual), renderiza filas
- `RevenueChart`
  - Render sin errores (mock de `recharts`), snapshot básico
- `DonutOverview`
  - Leyenda y total calculado

### Estructura de tests
- `src/components/dashboard/__tests__/DashboardStats.test.tsx`
- `src/components/dashboard/__tests__/TopCourses.test.tsx`
- `src/components/dashboard/__tests__/RequestedWithdrawals.test.tsx`
- `src/components/dashboard/__tests__/RevenueChart.test.tsx`
- `src/components/dashboard/__tests__/DonutOverview.test.tsx`

## Cambios Concretos (Archivos)
- `src/app/dashboard/page.tsx`
  - Reemplazar imports directos de charts por dynamic imports
  - Añadir `<Suspense fallback={<SkeletonChart/>}>`
- `src/components/dashboard/*`
  - Añadir `React.memo`/`useMemo` donde aplique
  - Añadir roles ARIA y teclado a `TopCourses`
  - Ajustar botones con `aria-pressed` en `RequestedWithdrawals`
- `src/components/ui/Skeletons.tsx`
  - Crear `SkeletonChart`, `SkeletonList`

## Entregables
- Dashboard sin parpadeos y con carga progresiva
- Controles accesibles y navegables por teclado
- Suite de pruebas pasando para componentes clave

¿Procedo con la implementación de Fase E/F (dynamic imports, accesibilidad y pruebas) antes de arrancar el servidor?