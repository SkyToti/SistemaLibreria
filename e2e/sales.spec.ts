import { test, expect } from '@playwright/test';

test.describe('Flujo de Ventas (Sales Flow)', () => {
    // Nota: Credenciales reales proporcionadas por el usuario
    const EMAIL = 'skytotifama123@gmail.com';
    const PASSWORD = 'bahamas234yz.';

    test.beforeEach(async ({ page }) => {
        // 1. Navegar al Login
        await page.goto('/');

        // 2. Llenar credenciales
        await page.fill('#email', EMAIL);
        await page.fill('#password', PASSWORD);

        // 3. Submit
        await page.click('button[type="submit"]');

        // 4. Verificar redirección al Dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('Debería realizar una venta correctamente', async ({ page }) => {
        // 1. Navegar al POS
        // Vamos directo a la URL para asegurar
        await page.goto('/dashboard/pos');

        // 2. Esperar a que carguen los productos
        const productGrid = page.locator('.product-grid');
        await expect(productGrid).toBeVisible();

        // Esperar a que haya al menos un producto (tarjeta dentro del grid)
        const firstBook = productGrid.locator('> div').first();
        await expect(firstBook).toBeVisible({ timeout: 10000 });

        // Guardar referencia al carrito (sidebar derecho)
        const cartSidebar = page.locator('.cart-sidebar');
        await expect(cartSidebar).toBeVisible();

        // 3. Agregar al carrito
        // Usamos el data-testid para robustez
        const bookCard = productGrid.locator('[data-testid^="book-card-"]').first();

        await expect(bookCard).toBeVisible();

        // CRÍTICO: Esperar a que la grilla esté totalmente interactiva (sin opacidad de carga)
        // La clase de opacidad está en el div interno con clase 'grid'
        const gridContent = productGrid.locator('.grid');
        await expect(gridContent).toHaveClass(/opacity-100/);

        // Esperamos un poco para asegurar hidratación de React
        await page.waitForTimeout(1000);

        await bookCard.click();

        // Esperar a que el carrito se actualice (mejor que esperar el toast)
        // Debe aparecer el precio total del item en el carrito
        await expect(cartSidebar).not.toContainText('El carrito está vacío');

        // 4. Verificar que se agregó al carrito
        // Buscamos dentro del cart-sidebar si aparece el precio (indicando item)
        // o verificamos que NO esté el mensaje de vacío
        await expect(cartSidebar).not.toContainText('El carrito está vacío');
        await expect(cartSidebar).toContainText('$');

        // 5. Proceder al pago (Efectivo)
        // Buscamos el botón que dice "Efectivo"
        const cashButton = page.locator('button:has-text("Efectivo")');
        await expect(cashButton).toBeVisible();
        await cashButton.click();

        // 6. Verificar éxito
        // Buscamos el toast de éxito "¡Venta realizada con éxito!"
        const toast = page.locator('text=¡Venta realizada con éxito!');
        await expect(toast).toBeVisible({ timeout: 10000 });
    });
});
