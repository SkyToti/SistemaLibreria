# Reporte de Limpieza y Optimización

## Objetivo
Auditar y eliminar código y assets innecesarios manteniendo intacto el módulo de Login y consolidando la UI del Dashboard en componentes “Glass”.

## Cambios Realizados

### 1. Consolidación de UI
- Se mantiene `src/components/ui/glass.tsx` como sistema de UI (GlassCard, GlassInput, GlassButton, GlassBackground).
- Eliminados componentes estándar no usados:
  - `src/components/ui/button.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/input.tsx`

### 2. Estilos Globales
- Eliminadas utilidades `.glass`, `.glass-dark`, `.glass-panel` en `src/app/globals.css` por no uso y solapamiento conceptual.

### 3. Navegación
- `src/components/dashboard/Sidebar.tsx`: ocultados enlaces a rutas no implementadas (`pos`, `inventory`, `reports`, `settings`) para evitar rutas muertas.

### 4. Protección de Rutas
- Añadido `middleware.ts` para proteger `/dashboard/**` verificando cookies de sesión de Supabase (`sb-access-token`/`sb:token`) y redirigir al login si no hay sesión.

### 5. Assets
- Eliminados SVGs de muestra no usados en `public/`:
  - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- Añadido `preload` de `background_login.svg` en `src/app/layout.tsx` para mejorar la percepción de carga y evitar parpadeos.

## Impacto
- Reducción de peso del bundle y del árbol de dependencias de UI.
- Mejora de UX al evitar rutas muertas y parpadeo del fondo de login.
- Incremento de seguridad al proteger el acceso al dashboard.

## Próximos Pasos
- Crear páginas stub para `POS`, `Inventario`, `Reportes` y `Settings`.
- Añadir pruebas unitarias para servicios (`supplier.service.ts`) y futuras funcionalidades del dashboard.
- Revisar `vercel.json` y eliminar/ajustar si no aplica al App Router.

## Nota
El módulo de Login (`src/app/page.tsx`) no fue modificado en funcionalidad; solo se optimizó la carga del fondo con `preload`.

