He investigado por qué el Dashboard tarda un poco en cargar. El problema radica en el archivo `src/services/dashboard.service.ts` y cómo se calculan las métricas.

### 🕵️‍♂️ Diagnóstico del Problema

Actualmente, el método `getMetrics` realiza **4 llamadas secuenciales y pesadas** a la base de datos cada vez que entras al Dashboard:

1.  **Trae TODAS las ventas (`select('total_amount')`)**: Solo para sumar el total de ingresos. Si tienes 10,000 ventas, descarga 10,000 filas. Esto es muy lento.
2.  **Trae TODOS los libros (`select('stock_quantity')`)**: Para contar cuántos hay y cuáles tienen bajo stock. Ineficiente si el catálogo crece.
3.  **Trae TODOS los items vendidos (`select('sale_items')`)**: Para calcular manualmente en JavaScript cuáles son los "Top Productos". Esto es **extremadamente costoso** en memoria y CPU del navegador.

Esencialmente, estás haciendo el trabajo de la base de datos en el navegador del usuario.

### 🚀 Plan de Optimización (Mejorar UX y Velocidad)

Para acelerar la carga drásticamente, propongo:

1.  **Usar `.count()` de Supabase:** En lugar de traer todos los datos para contar el array `.length`, pediremos a la base de datos que solo nos dé el número. (Instantáneo).
2.  **Cálculos en Servidor (RPC):** Crearemos una función SQL simple para obtener los "Top Productos" y el "Revenue Total". Así la base de datos hace la suma y solo nos envía el resultado final (pocos bytes) en lugar de miles de filas.
3.  **Paralelizar Consultas:** Usaremos `Promise.all` para lanzar las peticiones al mismo tiempo en lugar de esperar una tras otra.

**Impacto esperado:** El tiempo de carga debería reducirse de segundos a milisegundos, eliminando la sensación de lentitud.

¿Procedemos a optimizar el `dashboard.service.ts` y crear la función RPC necesaria?