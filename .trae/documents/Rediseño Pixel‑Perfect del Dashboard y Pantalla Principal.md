## Objetivo
Implementar un dashboard y pantalla principal (post‑login) con fidelidad 1:1 al diseño de referencia, manteniendo el estilo Liquid Glass, alto rendimiento y arquitectura modular.

## Mapa de Componentes (1:1 con la referencia)
- **AppShell**: contenedor general con fondo tintado cálido y blur moderado.
- **TopBar**:
  - Botón menú (`hamburger`)
  - Título "Dashboard Overview"
  - Píldoras de navegación (Home, Courses, Bootcamp, Team Training, Ebook, Enrollments, Reports, Affiliate)
  - Grupo de acciones (iconos: grid, calendar, settings, notificaciones, perfil)
- **QuickStats** (fila de 4 tarjetas):
  - Courses
  - Number of Lessons
  - Number of Enrollment
  - Number of Students
  - Cada tarjeta: subtítulos (Active/Upcoming/New) y icono.
- **AdminRevenue** (gráfico de líneas):
  - Toolbar: intervalos (This Year), iconos de modo gráfico.
  - Tooltip estilo glass y puntos con acento naranja.
- **RequestedWithdrawal** (lista):
  - Ítems con avatar, email, nombre, monto y botón de acción (+).
  - Filtro de rango (6 Months).
- **BottomGrid**:
  - **TopCourses** (lista con icono y total sales / tabs: Top Courses | Best Selling).
  - **CourseOverview** (donut chart con leyenda a la derecha, KPIs a la izquierda).

## Sistema Visual
- **Colores** (tokens CSS vars):
  - Fondo base cálido: `--bg-warm: linear-gradient(135deg, #3a2a28 0%, #2b3a39 40%, #6a3b2a 100%)`
  - Acento naranja: `--accent: #ff7a1a`
  - Vidrio: blancos/ámbar muy transparentes (`rgba(255,255,255,0.06–0.18)`) con **border** `rgba(255,255,255,0.25)`
- **Tipografía**:
  - Titulares: Inter/SF, 700
  - Etiquetas pequeñas: 11–12px, tracking amplio
- **Elevación**:
  - Sombra externa cálida: `0 20px 50px -12px rgba(40,30,20,0.45)`
  - Sombras inset para brillo solar (arriba/izquierda) y profundidad (abajo/derecha)
- **Bordes**: radios consistentes (18px tarjetas, 26px contenedores grandes)

## Animaciones y Micro‑interacciones
- Píldoras de navegación: transición `scale` y `background` (150–220ms, `ease-out`).
- Tarjetas: `hover` incrementa brillo y `translateY(-1px)`.
- Gráfico: entrada con `opacity` + línea dibujada (strokeDashoffset).
- Listas: `reveal` vertical con `height` auto y `opacity`.
- Tooltips: `fade + slight scale` (120ms).

## Arquitectura Técnica
- **Next.js App Router + TypeScript** (cliente sólo en componentes interactivos).
- **Tailwind + utilidades CSS** con tokens en `globals.css`.
- **Recharts** para gráficas (línea y donut) como client components.
- **Glass UI**: reutilizar `GlassCard`, `GlassButton`, `GlassInput`, ampliando variantes (tinted/warm).
- **Estado**:
  - Controles de filtro con `useState`.
  - Datos iniciales mockeados; se conectarán a Supabase posteriormente.
- **Acceso**: `middleware.ts` ya protege `/dashboard`; login se mantiene intocable.

## Estructura de Carpetas
- `src/components/dashboard/`:
  - `TopBar.tsx`, `NavPills.tsx`, `QuickStats.tsx`, `RevenueChart.tsx`, `WithdrawalList.tsx`, `TopCourses.tsx`, `CourseOverview.tsx`
- `src/features/dashboard/`:
  - `types.ts`, `mocks.ts`, `utils.ts` (formateadores, colores)
- `src/app/dashboard/page.tsx`: compone el layout con los nuevos bloques.

## Rendimiento
- Reducir `backdrop-blur` a 8–12px en contenedores; evitar blur en elementos internos.
- GPU `transform` para animaciones; `will-change: transform, opacity` sólo donde aplica.
- Lazy load de gráficos (import dinámico) y carga diferida de avatars.
- Preload de fuentes/íconos críticos; el SVG de background ya se pre‑carga.

## Pruebas
- **Vitest + React Testing Library**:
  - Render de `TopBar` (nav activo, accesibilidad ARIA).
  - Interacción de `NavPills` (estado activo y callbacks).
  - `RevenueChart` snapshot y props básicas.
  - `WithdrawalList` filtra por rango.

## Plan Incremental y Hitos
1. **Fase A — Infra UI** (Glass warm, tokens, layout base, TopBar + NavPills) 
2. **Fase B — QuickStats** (4 tarjetas con datos mock, estados hover) 
3. **Fase C — Gráficas** (Revenue line + donut con leyenda y KPIs) 
4. **Fase D — Listas** (RequestedWithdrawal + TopCourses tabs) 
5. **Fase E — Pulidos** (animaciones, tooltips, accesibilidad, rendimiento) 
6. **Fase F — Pruebas** (unitarias y snapshots de componentes clave) 

## Criterios de Éxito
- Estructura y posiciones idénticas al diseño.
- Transiciones y estados equivalentes.
- Score de rendimiento estable (sin lag al teclear ni parpadeos).
- Login intacto; dashboard protegido por middleware.

¿Confirmas que avancemos con la Fase A inmediatamente para construir el TopBar, NavPills y el layout cálido con Glass? 