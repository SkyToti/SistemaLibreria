import { test, expect } from '@playwright/test';

test.describe('Gestión de Proveedores (Supplier Management)', () => {
    // Generate unique values for this test run to avoid collisions
    const TIMESTAMP = Date.now();
    const NEW_SUPPLIER = {
        name: `Test Supplier ${TIMESTAMP}`,
        contact_person: 'Test Contact',
        phone: '+52 123 456 7890',
        email: `test${TIMESTAMP}@supplier.com`,
        address: 'Test Address 123'
    };

    // Updated values for Edit test
    const UPDATED_SUPPLIER = {
        name: `Edited Supplier ${TIMESTAMP}`,
        contact_person: 'Updated Contact'
    };

    test.beforeEach(async ({ page }) => {
        // 1. Login
        await page.goto('/');
        await page.fill('#email', 'skytotifama123@gmail.com');
        await page.fill('#password', 'bahamas234yz.');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // 2. Navigate to Suppliers
        await page.goto('/dashboard/suppliers');
        await page.waitForLoadState('networkidle');
    });

    test('CRUD Completo de Proveedores', async ({ page }) => {
        // === CREATE ===
        await test.step('Create a new Supplier', async () => {
            await page.locator('[data-testid="create-supplier-btn"]').click();

            // Wait for Dialog to open
            await expect(page.locator('div[role="dialog"]')).toBeVisible();

            // Fill form
            await page.locator('[data-testid="input-name"]').fill(NEW_SUPPLIER.name);
            await page.locator('[data-testid="input-contact"]').fill(NEW_SUPPLIER.contact_person);
            await page.locator('[data-testid="input-phone"]').fill(NEW_SUPPLIER.phone);
            await page.locator('[data-testid="input-email"]').fill(NEW_SUPPLIER.email);
            await page.locator('[data-testid="input-address"]').fill(NEW_SUPPLIER.address);

            // Submit
            await page.locator('[data-testid="submit-supplier-btn"]').click();

            // Verify dialog closes
            await expect(page.locator('div[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

            // Verify toast
            await expect(page.locator('text=Proveedor creado correctamente')).toBeVisible({ timeout: 10000 });
        });

        // === READ ===
        await test.step('Verify the Supplier is visible in the list', async () => {
            // Search for the new supplier
            await page.fill('input[placeholder*="Buscar"]', NEW_SUPPLIER.name);
            await page.waitForTimeout(500); // Wait for filter

            // Verify supplier card is visible
            await expect(page.locator(`[data-testid="supplier-card-${NEW_SUPPLIER.name}"]`)).toBeVisible({ timeout: 10000 });
        });

        // === UPDATE ===
        await test.step('Edit the Supplier', async () => {
            // Hover over the supplier card to reveal buttons
            const supplierCard = page.locator(`[data-testid="supplier-card-${NEW_SUPPLIER.name}"]`);
            await supplierCard.hover();

            // Click edit button
            const editBtn = supplierCard.locator('[data-testid^="edit-supplier-"]');
            await editBtn.click({ force: true });

            // Wait for Dialog
            await expect(page.locator('div[role="dialog"]')).toBeVisible();

            // Update fields
            await page.locator('[data-testid="input-name"]').fill(UPDATED_SUPPLIER.name);
            await page.locator('[data-testid="input-contact"]').fill(UPDATED_SUPPLIER.contact_person);

            // Submit
            await page.locator('[data-testid="submit-supplier-btn"]').click();

            // Verify dialog closes
            await expect(page.locator('div[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

            // Verify toast
            await expect(page.locator('text=Proveedor actualizado correctamente')).toBeVisible({ timeout: 10000 });
        });

        // === Verify UPDATE ===
        await test.step('Verify the updated Supplier name', async () => {
            // Clear search and search for updated name
            await page.fill('input[placeholder*="Buscar"]', '');
            await page.waitForTimeout(300);
            await page.fill('input[placeholder*="Buscar"]', UPDATED_SUPPLIER.name);
            await page.waitForTimeout(500);

            // Verify updated supplier card is visible
            await expect(page.locator(`[data-testid="supplier-card-${UPDATED_SUPPLIER.name}"]`)).toBeVisible({ timeout: 10000 });
        });

        // === DELETE ===
        await test.step('Delete the Supplier', async () => {
            // Find the updated supplier
            const supplierCard = page.locator(`[data-testid="supplier-card-${UPDATED_SUPPLIER.name}"]`);
            await supplierCard.hover();

            // Click delete button
            const deleteBtn = supplierCard.locator('[data-testid^="delete-supplier-"]');
            await deleteBtn.click({ force: true });

            // Confirm Dialog
            await expect(page.locator('div[role="alertdialog"]')).toBeVisible();
            await page.locator('[data-testid="confirm-delete-btn"]').click();

            // Verify toast
            await expect(page.locator('text=Proveedor eliminado correctamente')).toBeVisible({ timeout: 10000 });
        });

        // === Verify DELETE ===
        await test.step('Verify the Supplier is no longer in the list', async () => {
            // Clear search
            await page.fill('input[placeholder*="Buscar"]', '');
            await page.waitForTimeout(300);

            // Search for deleted supplier
            await page.fill('input[placeholder*="Buscar"]', UPDATED_SUPPLIER.name);
            await page.waitForTimeout(500);

            // Verify supplier card is NOT visible
            await expect(page.locator(`[data-testid="supplier-card-${UPDATED_SUPPLIER.name}"]`)).not.toBeVisible();
        });
    });
});
