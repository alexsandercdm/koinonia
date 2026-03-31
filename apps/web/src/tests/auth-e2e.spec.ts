import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Koinonia')
    await expect(page.locator('text=Entre com sua conta')).toBeVisible()
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Email inválido')).toBeVisible()
    await expect(page.locator('text=Senha deve ter pelo menos 6 caracteres')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Cadastre-se')
    await expect(page).toHaveURL('/register')
    await expect(page.locator('text=Crie sua conta')).toBeVisible()
  })

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="name"]', 'A')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '123')
    await page.fill('input[name="confirmPassword"]', '456')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Nome deve ter pelo menos 2 caracteres')).toBeVisible()
    await expect(page.locator('text=Email inválido')).toBeVisible()
    await expect(page.locator('text=Senha deve ter pelo menos 6 caracteres')).toBeVisible()
    await expect(page.locator('text=Senhas não coincidem')).toBeVisible()
  })

  test('should allow navigation back to login from register', async ({ page }) => {
    await page.goto('/register')
    await page.click('text=Faça login')
    await expect(page).toHaveURL('/login')
  })

  test('should display dashboard when authenticated', async ({ page }) => {
    // Mock authentication - in real test, you would use actual credentials
    await page.addInitScript(() => {
      localStorage.setItem('better-auth.session_token', 'mock-token')
    })

    await page.goto('/dashboard')
    await expect(page.locator('text=Bem-vindo')).toBeVisible()
    await expect(page.locator('text=Participantes')).toBeVisible()
    await expect(page.locator('text=Eventos')).toBeVisible()
    await expect(page.locator('text=Acomodações')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('better-auth.session_token', 'mock-token')
    })

    await page.goto('/dashboard')
    await page.click('button:has-text("Sair")')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
