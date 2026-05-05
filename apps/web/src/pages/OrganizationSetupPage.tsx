import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Building2, Check, Loader2, PlusCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'
import { useAuthContext } from '../contexts/auth-context'
import { useOrgContext } from '../contexts/org-context'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function OrganizationSetupPage() {
  const { user } = useAuthContext()
  const { activeOrgId, organizations, isLoading, setActiveOrg, createOrganization } = useOrgContext()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const suggestedSlug = useMemo(() => slugify(name), [name])

  if (activeOrgId) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleCreateOrganization(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await createOrganization({
        name: name.trim(),
        slug: (slug || suggestedSlug).trim(),
      })
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel criar a organizacao')
      setSubmitting(false)
    }
  }

  async function handleSelectOrganization(orgId: string) {
    setSubmitting(true)
    setError('')

    try {
      await setActiveOrg(orgId)
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel ativar a organizacao')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-panel border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-gold">
                  Organizacao
                </p>
                <h1 className="text-[24px] font-semibold leading-tight">Vamos definir seu espaco de trabalho</h1>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-6 text-text-secondary">
              {user?.name ? `${user.name}, ` : ''}
              antes de acessar participantes, inscricoes e financeiro, precisamos ativar a organizacao
              que vai isolar os dados do seu retiro.
            </p>

            {error ? (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleCreateOrganization} className="mt-8 space-y-5">
              <FormField label="Nome da organizacao">
                <Input
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value
                    setName(nextName)
                    if (!slug) {
                      setSlug(slugify(nextName))
                    }
                  }}
                  placeholder="Ex: Igreja Koinonia Centro"
                  required
                />
              </FormField>

              <FormField label="Slug">
                <Input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder="igreja-koinonia-centro"
                  required
                />
              </FormField>

              <div className="rounded-[8px] border border-border bg-surface-raised px-4 py-3 text-xs text-text-secondary">
                URL interna sugerida: <span className="font-semibold text-foreground">{slug || suggestedSlug || 'sua-organizacao'}</span>
              </div>

              <Button type="submit" disabled={submitting || isLoading || !name.trim()}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle size={16} />}
                Criar organizacao
              </Button>
            </form>
          </section>

          <aside className="rounded-panel border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Ou entrar em uma organizacao existente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-0 pb-0">
                {organizations.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Nenhuma organizacao disponivel para esta conta ainda.
                  </p>
                ) : (
                  organizations.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => handleSelectOrganization(org.id)}
                      disabled={submitting}
                      className="flex w-full items-center justify-between rounded-[8px] border border-border bg-surface-raised px-4 py-3 text-left transition-colors hover:border-warm-border-strong hover:bg-background disabled:opacity-60"
                    >
                      <div>
                        <p className="font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-text-secondary">{org.slug}</p>
                      </div>
                      <Check size={16} className="text-warm-gold" />
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
