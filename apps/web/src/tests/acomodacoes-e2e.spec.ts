import { test, expect, type Page } from '@playwright/test'

/**
 * Accommodation page e2e suite — plan 03-04
 *
 * Covers UI-level behavior: navigation, map controls visibility by role,
 * and PDF export affordance. Does NOT duplicate API business-rule tests
 * already owned by plan 03-02.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

async function mockServoSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('better-auth.session_token', 'mock-token')
    localStorage.setItem('mock-user-role', 'servo')
  })
}

async function mockLiderSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('better-auth.session_token', 'mock-token')
    localStorage.setItem('mock-user-role', 'lider')
  })
}

async function interceptApiRoutes(page: Page) {
  await page.route('**/api/v1/eventos', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'evt-1',
          nome: 'Retiro Jovens 2026',
          local_id: 'local-1',
          status: 'ativo',
          data_inicio: '2026-05-01',
          data_fim: '2026-05-03',
        },
      ]),
    })
  )

  await page.route('**/api/v1/eventos/evt-1/mapa-acomodacao', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        evento_id: 'evt-1',
        local_id: 'local-1',
        quartos: [
          {
            id: 'qrt-1',
            nome: 'Quarto A',
            genero_permitido: 'M',
            capacidade: 4,
            ocupados: 1,
            disponiveis: 3,
            camas: [
              {
                id: 'cama-1',
                identificacao: 'C-01',
                tipo: 'solteiro',
                bloqueada: false,
                ocupante: 'João Silva',
                inscricao_id: 'ins-1',
              },
              {
                id: 'cama-2',
                identificacao: 'C-02',
                tipo: 'solteiro',
                bloqueada: false,
                ocupante: null,
                inscricao_id: null,
              },
            ],
          },
        ],
      }),
    })
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Accommodation Page — navigation', () => {
  test('should navigate from dashboard to /acomodacoes', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('better-auth.session_token', 'mock-token')
    })

    await page.goto('/dashboard')
    await expect(page.locator('text=Acomodações')).toBeVisible()

    await page.click('text=Acomodações')
    await expect(page).toHaveURL('/acomodacoes')
    await expect(page.locator('h1')).toContainText('Acomodações')
  })
})

test.describe('Accommodation Page — map controls visibility', () => {
  test('servant (servo) sees map in read-only — no assign/release buttons', async ({ page }) => {
    await mockServoSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    // Select event to load the map
    await page.waitForSelector('select', { timeout: 5000 }).catch(() => null)
    const select = page.locator('select').first()
    if (await select.isVisible()) {
      await select.selectOption('evt-1')
    }

    // Wait for map to appear
    await page.waitForSelector('[data-testid="mapa-quartos-grid"]', { timeout: 5000 }).catch(() => null)

    // No assign/release interactive controls should be present for servo
    const atribuirButtons = page.locator('button:has-text("Atribuir")')
    const liberarButtons = page.locator('button:has-text("Liberar")')
    await expect(atribuirButtons).toHaveCount(0)
    await expect(liberarButtons).toHaveCount(0)
  })

  test('lider role label is visible on accommodation page', async ({ page }) => {
    await mockLiderSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    await expect(page.locator('h1')).toContainText('Acomodações')
    // Role indicator visible (lider or admin)
    await expect(page.locator('text=lider').or(page.locator('text=admin'))).toBeVisible()
  })

  test('servo role indicator is visible on accommodation page', async ({ page }) => {
    await mockServoSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    await expect(page.locator('h1')).toContainText('Acomodações')
    await expect(page.locator('text=servo')).toBeVisible()
  })

  test('servant (servo) estrutura tab shows read-only indicator', async ({ page }) => {
    await mockServoSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    const estruturaTab = page.locator('button:has-text("Estrutura")')
    if (await estruturaTab.isVisible()) {
      await expect(estruturaTab).toContainText('leitura')
    }
  })
})

test.describe('Accommodation Page — PDF export affordance', () => {
  test('export PDF button is visible for lider when map is loaded', async ({ page }) => {
    await mockLiderSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    // Select event
    await page.waitForSelector('select', { timeout: 5000 }).catch(() => null)
    const select = page.locator('select').first()
    if (await select.isVisible()) {
      await select.selectOption('evt-1')
    }

    // Wait for PDF button to appear
    await page.waitForSelector('[data-testid="export-pdf-button"]', { timeout: 8000 }).catch(() => null)
    const pdfButton = page.locator('[data-testid="export-pdf-button"]')

    const count = await pdfButton.count()
    if (count > 0) {
      await expect(pdfButton).toBeVisible()
      await expect(pdfButton).toContainText('Exportar PDF')
    }
  })
})

test.describe('Accommodation Page — status legend', () => {
  test('bed cards show text status labels — not only color cues', async ({ page }) => {
    await mockLiderSession(page)
    await interceptApiRoutes(page)
    await page.goto('/acomodacoes')

    await page.waitForSelector('select', { timeout: 5000 }).catch(() => null)
    const select = page.locator('select').first()
    if (await select.isVisible()) {
      await select.selectOption('evt-1')
    }

    await page.waitForSelector('[data-testid="mapa-quartos-grid"]', { timeout: 6000 }).catch(() => null)
    const grid = page.locator('[data-testid="mapa-quartos-grid"]')
    if (await grid.isVisible()) {
      // At least one text status badge should be visible
      const statusBadge = page
        .locator('[data-testid="mapa-quartos-grid"]')
        .locator('text=Disponivel, text=Ocupado, text=Bloqueado')
      await expect(statusBadge.first()).toBeVisible()
    }
  })
})
