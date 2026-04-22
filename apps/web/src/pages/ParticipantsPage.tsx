import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserPlus } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { apiFetch } from '../lib/api'
import type { Pessoa } from '@koinonia/shared'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParticipanteListItem extends Pessoa {
  id: string
  papel?: 'encontrista' | 'servo'
}

// ─── Query ───────────────────────────────────────────────────────────────────

function useParticipantes() {
  return useQuery({
    queryKey: ['participantes'],
    queryFn: () => apiFetch<ParticipanteListItem[]>('/api/v1/participantes'),
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitial(nome: string): string {
  return nome.trim()[0]?.toUpperCase() ?? '?'
}

function hasRestrictions(p: ParticipanteListItem): boolean {
  return !!(p.alergias || p.condicoes_medicas || (p.restricoes_alimentares && p.restricoes_alimentares.length > 0))
}

function getRestrictionLabel(p: ParticipanteListItem): string | null {
  if (p.condicoes_medicas) return p.condicoes_medicas
  if (p.alergias) return `Alergia: ${p.alergias}`
  if (p.restricoes_alimentares && p.restricoes_alimentares.length > 0)
    return p.restricoes_alimentares.join(', ')
  return null
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type FilterChip = 'todos' | 'encontrista' | 'servo' | 'M' | 'F'

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
        active
          ? 'bg-primary text-white'
          : 'bg-white/5 border border-border-dark text-slate-300 hover:border-primary/50',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

interface ParticipanteCardProps {
  participante: ParticipanteListItem
}

function ParticipanteCard({ participante: p }: ParticipanteCardProps) {
  const restriction = hasRestrictions(p)
  const restrictionLabel = getRestrictionLabel(p)
  const isPapelEncontrista = p.papel === 'encontrista'

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-5 hover:shadow-lg hover:border-primary/40 transition-all group relative overflow-hidden">
      {restriction && (
        <div className="absolute top-3 right-3">
          <span
            className="material-symbols-outlined text-amber-400 text-[20px]"
            title="Possui restrições"
          >
            warning
          </span>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="size-20 rounded-full border-2 border-border-dark group-hover:border-primary/60 transition-colors bg-primary/20 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-primary/80">{getInitial(p.nome)}</span>
        </div>

        <h3 className="font-bold text-lg mb-1 text-white">{p.nome}</h3>

        {/* Role badge */}
        {p.papel ? (
          <span
            className={[
              'px-3 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider mb-3',
              isPapelEncontrista
                ? 'bg-primary/20 text-purple-300'
                : 'bg-white/10 text-slate-300',
            ].join(' ')}
          >
            {isPapelEncontrista ? 'Encontrista' : 'Servo'}
          </span>
        ) : (
          <span className="px-3 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider mb-3 bg-white/10 text-slate-400">
            —
          </span>
        )}

        {restrictionLabel ? (
          <p className="text-sm text-slate-400 italic">"{restrictionLabel}"</p>
        ) : (
          <p className="text-sm text-slate-500">Sem restrições</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border-dark flex justify-between items-center text-xs">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-sm">person</span>
          {p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : '—'}
        </span>
        <button className="text-primary font-semibold hover:underline transition-colors">
          Ver ficha
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ParticipantsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterChip>('todos')

  const { data: participantes, isLoading, error } = useParticipantes()

  const filtered = useMemo(() => {
    const list = participantes ?? []
    return list.filter((p) => {
      const matchSearch =
        !search || p.nome.toLowerCase().includes(search.toLowerCase())
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
    <button className="bg-amber-400 hover:bg-amber-400/90 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm text-sm">
      <UserPlus className="size-4" />
      <span>Adicionar Participante</span>
    </button>
  )

  return (
    <AppLayout title="Participantes" actions={actions}>
      <div className="p-8 max-w-7xl w-full mx-auto">
        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar participantes por nome..."
              className="w-full bg-white/5 border border-border-dark rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <FilterPill label="Todos" active={activeFilter === 'todos'} onClick={() => setActiveFilter('todos')} />
            <FilterPill label="Encontristas" active={activeFilter === 'encontrista'} onClick={() => setActiveFilter('encontrista')} />
            <FilterPill label="Servos" active={activeFilter === 'servo'} onClick={() => setActiveFilter('servo')} />
            <div className="w-px h-6 bg-border-dark mx-1" />
            <FilterPill label="Masculino" active={activeFilter === 'M'} onClick={() => setActiveFilter('M')} />
            <FilterPill label="Feminino" active={activeFilter === 'F'} onClick={() => setActiveFilter('F')} />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-dark border border-border-dark rounded-xl p-5 animate-pulse">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-20 rounded-full bg-white/5" />
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-20 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-900/20 p-8 text-center">
            <p className="text-red-400 font-medium">Erro ao carregar participantes</p>
            <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border-dark p-16 text-center">
                <p className="text-slate-400 font-medium">Nenhum participante encontrado</p>
                <p className="text-sm text-slate-500 mt-1">Tente outro termo de busca ou filtro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p) => (
                  <ParticipanteCard key={p.id} participante={p} />
                ))}

                {/* Add new placeholder */}
                <div className="border-2 border-dashed border-border-dark rounded-xl p-5 hover:border-amber-400/50 hover:bg-amber-400/5 transition-all group flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]">
                  <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-400/20 group-hover:text-amber-400 transition-all mb-4">
                    <UserPlus className="size-6" />
                  </div>
                  <p className="font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                    Novo Registro
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
