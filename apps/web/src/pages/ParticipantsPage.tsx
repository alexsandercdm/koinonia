import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserPlus } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { Input } from '../components/ui/input'
import { apiFetch } from '../lib/api'
import type { Pessoa } from '@koinonia/shared'

interface ParticipanteListItem extends Pessoa {
  id: string
  papel?: 'encontrista' | 'servo'
  quarto?: string
  setor?: string
}

function useParticipantes() {
  return useQuery({
    queryKey: ['participantes'],
    queryFn: () => apiFetch<ParticipanteListItem[]>('/api/v1/participantes'),
    staleTime: 1000 * 60 * 2,
  })
}

function getInitial(nome: string): string {
  return nome.trim()[0]?.toUpperCase() ?? '?'
}

function hasRestrictions(p: ParticipanteListItem): boolean {
  return !!(p.alergias || p.condicoes_medicas || (p.restricoes_alimentares && p.restricoes_alimentares.length > 0))
}

function getRestrictionLabel(p: ParticipanteListItem): string | null {
  if (p.condicoes_medicas) return p.condicoes_medicas
  if (p.alergias) return `Alergia: ${p.alergias}`
  if (p.restricoes_alimentares && p.restricoes_alimentares.length > 0) {
    return p.restricoes_alimentares.join(', ')
  }
  return null
}

type FilterChip = 'todos' | 'encontrista' | 'servo' | 'M' | 'F'

function ParticipanteCard({ participante: p }: { participante: ParticipanteListItem }) {
  const restrictionLabel = getRestrictionLabel(p)
  const isPapelEncontrista = p.papel === 'encontrista'

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-warm-border-strong hover:bg-surface-raised">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
          <span className="text-xl font-semibold text-foreground">{getInitial(p.nome)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-foreground">{p.nome}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.papel ? (
              <Badge variant={isPapelEncontrista ? 'gold' : 'neutral'}>
                {isPapelEncontrista ? 'Encontrista' : 'Servo'}
              </Badge>
            ) : (
              <Badge variant="neutral">Sem papel</Badge>
            )}
            {hasRestrictions(p) ? <Badge variant="warning">Atenção</Badge> : null}
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            {restrictionLabel ? `"${restrictionLabel}"` : 'Sem restrições'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-text-secondary">
        <span>
          {p.quarto ?? p.setor ?? (p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : '—')}
        </span>
        <button className="font-semibold text-warm-gold">Ver ficha</button>
      </div>
    </div>
  )
}

export function ParticipantsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterChip>('todos')

  const { data: participantes, isLoading, error } = useParticipantes()

  const filtered = useMemo(() => {
    const list = participantes ?? []
    return list.filter((p) => {
      const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'encontrista' && p.papel === 'encontrista') ||
        (activeFilter === 'servo' && p.papel === 'servo') ||
        (activeFilter === 'M' && p.genero === 'M') ||
        (activeFilter === 'F' && p.genero === 'F')
      return matchSearch && matchFilter
    })
  }, [participantes, search, activeFilter])

  const actions = (
    <Button variant="gold" size="sm">
      <UserPlus className="size-4" />
      <span>Adicionar Participante</span>
    </Button>
  )

  return (
    <AppLayout title="Participantes" actions={actions}>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-tertiary" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar participantes por nome..."
              className="pl-11"
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

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5">
                <div className="h-28 animate-pulse rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-status-danger/25 bg-status-danger-bg p-8 text-center">
            <p className="font-semibold text-status-danger">Erro ao carregar participantes</p>
            <p className="mt-1 text-sm text-status-danger">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !error && (
          filtered.length === 0 ? (
            <EmptyState
              title="Sua busca não trouxe registros para esta etapa"
              description="Revise os filtros ou limpe o termo de busca para retornar aos participantes cadastrados."
              action={<Button variant="outline" onClick={() => { setSearch(''); setActiveFilter('todos') }}>Limpar filtros</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ParticipanteCard key={p.id} participante={p} />
              ))}
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-raised p-5 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-text-secondary">
                  <UserPlus className="size-6" />
                </div>
                <p className="font-semibold text-text-secondary">Novo Registro</p>
              </div>
            </div>
          )
        )}
      </div>
    </AppLayout>
  )
}
