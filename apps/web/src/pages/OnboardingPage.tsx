import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { FormField } from '../components/ui/form-field'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2 } from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    // Auto-generate slug: lowercase, remove special chars, replace spaces with hyphens
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, '') // Keep only alphanumeric, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
    setSlug(generated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      setError('Nome e identificador são obrigatórios')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call Better Auth's organization.create()
      const organizationApi = authClient.organization ?? {}
      const create = organizationApi.create

      if (typeof create !== 'function') {
        throw new Error('Organização API não disponível')
      }

      const result = await create({ name, slug })

      if (result?.error) {
        throw new Error(result.error.message || 'Erro ao criar organização')
      }

      const orgId = result?.data?.id ?? result?.id
      if (!orgId) {
        throw new Error('ID da organização não retornado')
      }

      // Set the organization as active (try both method names for compatibility)
      const setActive =
        organizationApi.setActiveOrganization ??
        organizationApi.setActive

      if (typeof setActive !== 'function') {
        throw new Error('Organization client is not available')
      }

      await setActive({ organizationId: orgId })

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar organização')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-card rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Criar sua organização</h1>
        <p className="text-sm text-text-secondary mb-6">
          Configure sua igreja ou ministério. Você se tornará o Presidente automaticamente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            label="Nome da organização"
            htmlFor="org-name"
            required
          >
            <Input
              id="org-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Igreja Boa Nova"
              required
            />
          </FormField>

          <FormField
            label="Identificador (slug)"
            htmlFor="org-slug"
            required
            hint="Apenas letras minúsculas, números e hífens."
          >
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: igreja-boa-nova"
              pattern="[a-z0-9\-]+"
              required
            />
          </FormField>

          <Button
            type="submit"
            disabled={loading || !name.trim() || !slug.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Criando organização...
              </>
            ) : (
              'Criar organização'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
