import { useState, useMemo } from 'react'
import { AlertTriangle, Search, UserPlus } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { ParticipanteFichaSheet } from '../components/participantes/ParticipanteFichaSheet'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { Input } from '../components/ui/input'
import { useAuthContext } from '../contexts/auth-context'
import { useParticipantes } from '../hooks/use-participantes'
import type { Pessoa } from '@koinonia/shared'

interface ParticipanteListItem extends Pessoa {
  id: string
  papel?: 'encontrista' | 'servo'
  quarto?: string
  setor?: string
}

function getInitial(nome: string): string {
  return nome.trim()[0]?.toUpperCase() ?? '?'
}

function getRestrictionLabel(p: ParticipanteListItem): string | null {
  if (p.condicoes_medicas) return p.condicoes_medicas
  if (p.alergias) return p.alergias
  if (p.restricoes_alimentares && p.restricoes_alimentares.length > 0) {
    return p.restricoes_alimentares.join(', ')
  }
  return null
}

type FilterChip = 'todos' | 'encontrista' | 'servo' | 'M' | 'F'

function normalizeSearchText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function ParticipantsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterChip>('todos')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [selectedParticipanteId, setSelectedParticipanteId] = useState<string | undefined>()
  const { user } = useAuthContext()

  const userRole = user?.role === 'admin' || user?.role === 'lider' || user?.role === 'servo'
    ? user.role
    : 'servo'
  const canWrite = userRole === 'admin' || userRole === 'lider'
  const canDelete = userRole === 'admin'
  const participantesQuery = useParticipantes({ page: 1, pageSize: 100 })
  const participantes = (participantesQuery.data?.data ?? []) as ParticipanteListItem[]

  const filtered = useMemo(() => {
    const searchTerm = normalizeSearchText(search.trim())
    return participantes.filter((p) => {
      const matchSearch = !searchTerm || [p.nome, p.telefone, p.email].some(
        (v) => normalizeSearchText(v).includes(searchTerm)
      )
      const matchFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'encontrista' && p.papel === 'encontrista') ||
        (activeFilter === 'servo' && p.papel === 'servo') ||
        (activeFilter === 'M' && p.genero === 'M') ||
        (activeFilter === 'F' && p.genero === 'F')
      return matchSearch && matchFilter
    })
  }, [participantes, search, activeFilter])

  function openCreate() {
    setSheetMode('create')
    setSelectedParticipanteId(undefined)
    setSheetOpen(true)
  }

  function openFicha(id: string) {
    setSheetMode('edit')
    setSelectedParticipanteId(id)
    setSheetOpen(true)
  }

  const actions = (
    <Button variant="gold" size="sm" onClick={openCreate} disabled={!canWrite}>
      <UserPlus className="size-4" />
      <span>Novo participante</span>
    </Button>
  )

  return (
    <AppLayout title="Participantes" actions={actions}>
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="pl-10"
            />
          </div>
          <FilterTabs
            ariaLabel="Filtros de participantes"
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as FilterChip)}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'encontrista', label: 'Encontristas' },
              { value: 'servo', label: 'Servos' },
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
            ]}
          />
        </div>

        {participantesQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {participantesQuery.error && (
          <div className="rounded-lg border border-status-danger/25 bg-status-danger-bg p-8 text-center">
            <p className="font-semibold text-status-danger">Erro ao carregar participantes</p>
            <p className="mt-1 text-sm text-status-danger">{(participantesQuery.error as Error).message}</p>
          </div>
        )}

        {!participantesQuery.isLoading && !participantesQuery.error && (
          filtered.length === 0 ? (
            <EmptyState
              title="Nenhum participante encontrado"
              description="Revise os filtros ou limpe o termo de busca."
              action={
                <Button variant="outline" onClick={() => { setSearch(''); setActiveFilter('todos') }}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <p className="text-sm text-text-secondary">{filtered.length} participante{filtered.length !== 1 ? 's' : ''}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    <th className="px-5 py-3 text-left">Participante</th>
                    <th className="px-5 py-3 text-left">Gênero</th>
                    <th className="px-5 py-3 text-left">Papel</th>
                    <th className="px-5 py-3 text-left">Contato</th>
                    <th className="px-5 py-3 text-left">Restrições</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const restrictionLabel = getRestrictionLabel(p)
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-surface-raised">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                              {getInitial(p.nome)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{p.nome}</p>
                              {p.email && <p className="text-xs text-text-tertiary">{p.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-text-secondary">
                          {p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : '—'}
                        </td>
                        <td className="px-5 py-3">
                          {p.papel ? (
                            <Badge variant={p.papel === 'encontrista' ? 'gold' : 'neutral'}>
                              {p.papel === 'encontrista' ? 'Encontrista' : 'Servo'}
                            </Badge>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-text-secondary">
                          {p.telefone ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          {restrictionLabel ? (
                            <span className="flex items-center gap-1.5 text-status-warning">
                              <AlertTriangle className="size-3.5 shrink-0" />
                              <span className="truncate max-w-[160px]">{restrictionLabel}</span>
                            </span>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            className="font-semibold text-warm-gold hover:underline"
                            onClick={() => openFicha(p.id)}
                          >
                            Ver ficha
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <ParticipanteFichaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        participanteId={selectedParticipanteId}
        mode={sheetMode}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </AppLayout>
  )
}
