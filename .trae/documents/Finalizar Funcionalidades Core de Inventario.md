## Completar Módulo de Inventario
Para que el sistema sea realmente útil y robusto antes de pasar a Ventas, es crucial que las funcionalidades de gestión básica estén operativas. No podemos vender libros si no podemos buscarlos o corregir sus precios.

### 1. Búsqueda y Filtrado (Prioridad Alta)
Actualmente la barra de búsqueda es solo visual.
- **Lógica**: Implementar filtrado en tiempo real por título, autor o ISBN.
- **UI**: Conectar el `Input` de búsqueda al estado del componente `BookList`.

### 2. Edición de Libros (Prioridad Alta)
Ya tienes el formulario, solo falta conectarlo.
- **Acción**: Hacer que el botón "Editar" (lápiz) abra el modal `BookForm` precargado con los datos del libro.
- **Backend**: Conectar la función de actualización con Supabase.

### 3. Eliminar Libros (Prioridad Media)
- **Acción**: Activar el botón de basura.
- **Seguridad**: Añadir un diálogo de confirmación "¿Estás seguro?" para evitar borrados accidentales.

---

### ¿Por qué hacer esto antes del POS?
El módulo de Ventas (POS) dependerá totalmente de que puedas **buscar** productos rápidamente para agregarlos al carrito. Si implementamos la lógica de búsqueda ahora en el Inventario, podremos reutilizarla casi idéntica en el POS.

Si estás de acuerdo, procederé a activar estas funcionalidades (Búsqueda, Edición y Borrado) para cerrar el capítulo de Inventario con broche de oro.