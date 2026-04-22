import { useState } from 'react'
import { Search, Users, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { useEventos, useInadimplentes } from '../hooks/use-inscricoes'
import type { InadimplenteItem } from '../hooks/use-inscricoes'

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = 'todos' | 'inadimplentes'
type PapelFilter = 'todos' | 'encontrista' | 'servo'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDENTE:      { label: 'Pendente',       classes: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' },
  PAGO_PARCIAL:  { label: 'Pago Parcial',   classes: 'bg-blue-400/10 text-blue-400 border border-blue-400/20' },
  PAGO_TOTAL:    { label: 'Pago Total',     classes: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' },
  LISTA_ESPERA:  { label: 'Lista de Espera',classes: 'bg-slate-400/10 text-slate-400 border border-slate-400/20' },
  CANCELADA:     { label: 'Cancelada',      classes: 'bg-red-400/10 text-red-400 border border-red-400/20' },
}

const PAPEL_LABELS: Record<string, string> = {
  encontrista: 'Encontrista',
  servo: 'Servo',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-slate-400/10 text-slate-400 border border-slate-400/20' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  iconBg?: string
}

function MetricCard({ icon, label, value, sub, iconBg = 'bg-primary/20' }: MetricCardProps) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex items-center gap-4">
      <div className={`size-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-red-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function InscricaoRow({ item }: { item: InadimplenteItem }) {
  const debitoAberto = item.valor_total - item.valor_pago
  const initial = item.pessoa?.nome?.trim()[0]?.toUpperCase() ?? '?'

  return (
    <tr className="border-b border-border-dark hover:bg-white/3 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary/80 shrink-0">
            {initial}
          </div>
          <div>
            <div className="font-medium text-white text-sm">{item.pessoa?.nome ?? '—'}</div>
            {item.pessoa?.telefone && (
              <div className="text-xs text-slate-500">{item.pessoa.telefone}</div>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-400">
        {PAPEL_LABELS[item.papel] ?? item.papel}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3 px-4 text-sm text-right">
        <div className="text-white">R$ {item.valor_total.toFixed(2)}</div>
        {item.valor_pago > 0 && (
          <div className="text-xs text-emerald-400">Pago: R$ {item.valor_pago.toFixed(2)}</div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right">
        {debitoAberto > 0 ? (
          <span className="text-red-400 font-medium">R$ {debitoAberto.toFixed(2)}</span>
        ) : (
          <span className="text-emerald-400">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function InscricoesPage() {
  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [papelFilter, setPapelFilter] = useState<PapelFilter>('todos')
  const [search, setSearch] = useState('')

  const { data: eventos, isLoading: eventosLoading } = useEventos()
  const { data: inadimplentes, isLoading: listLoading, error: listError } = useInadimplentes(selectedEventoId)

  const selectedEvento = eventos?.find((e) => e.id === selectedEventoId)

  // Filter rows
  const filteredItems = (inadimplentes ?? []).filter((item) => {
    if (statusFilter === 'inadimplentes') {
      const isInadimplente = item.status === 'PENDENTE' || item.status === 'PAGO_PARCIAL'
      if (!isInadimplente) return false
    }
    if (papelFilter !== 'todos' && item.papel !== papelFilter) return false
    if (search && !item.pessoa?.nome?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Summary stats
  const totalInscritos = inadimplentes?.length ?? 0
  const totalInadimplentes = inadimplentes?.filter(
    (i) => i.status === 'PENDENTE' || i.status === 'PAGO_PARCIAL',
  ).length ?? 0
  const totalPagos = inadimplentes?.filter((i) => i.status === 'PAGO_TOTAL').length ?? 0
  const totalArrecadado = inadimplentes?.reduce((sum, i) => sum + i.valor_pago, 0) ?? 0
  const totalAPagar = inadimplentes?.reduce((sum, i) => sum + (i.valor_total - i.valor_pago), 0) ?? 0

  return (
    <AppLayout title="Inscrições">
      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* Event selector */}
        <div className="bg-surface-dark border border-border-dark rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Selecionar Evento</label>
          {eventosLoading ? (
            <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <select
              className="w-full bg-white/5 border border-border-dark rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={selectedEventoId}
              onChange={(e) => setSelectedEventoId(e.target.value)}
            >
              <option value="" className="bg-surface-dark">-- Selecione um evento --</option>
              {(eventos ?? []).map((evento) => (
                <option key={evento.id} value={evento.id} className="bg-surface-dark">
                  {evento.nome} ({evento.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Metric cards — only when event is selected and data loaded */}
        {selectedEventoId && inadimplentes && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              icon={<Users className="size-5 text-purple-300" />}
              label="Total Inscritos"
              value={totalInscritos}
              iconBg="bg-primary/20"
            />
            <MetricCard
              icon={<AlertTriangle className="size-5 text-red-400" />}
              label="Inadimplentes"
              value={totalInadimplentes}
              iconBg="bg-red-400/10"
            />
            <MetricCard
              icon={<CheckCircle className="size-5 text-emerald-400" />}
              label="Pagamento Total"
              value={totalPagos}
              iconBg="bg-emerald-400/10"
            />
            <MetricCard
              icon={<DollarSign className="size-5 text-amber-400" />}
              label="Arrecadado"
              value={`R$ ${totalArrecadado.toFixed(2)}`}
              sub={totalAPagar > 0 ? `Pendente: R$ ${totalAPagar.toFixed(2)}` : undefined}
              iconBg="bg-amber-400/10"
            />
          </div>
        )}

        {/* Filters + Table */}
        {selectedEventoId && (
          <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
            {/* Table header with search and filters */}
            <div className="p-5 border-b border-border-dark space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-white">
                  {selectedEvento?.nome ?? 'Evento'}
                  {filteredItems.length !== totalInscritos && (
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      ({filteredItems.length} de {totalInscritos})
                    </span>
                  )}
                </h3>
              </div>

              {/* Search bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome..."
                  className="w-full bg-white/5 border border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2">
                {/* Status filters */}
                <FilterPill label="Todos" active={statusFilter === 'todos'} onClick={() => setStatusFilter('todos')} />
                <FilterPill label="Inadimplentes" active={statusFilter === 'inadimplentes'} onClick={() => setStatusFilter('inadimplentes')} />
                <div className="w-px h-6 bg-border-dark mx-1 self-center" />
                {/* Papel filters */}
                <FilterPill label="Todos os papéis" active={papelFilter === 'todos'} onClick={() => setPapelFilter('todos')} />
                <FilterPill label="Encontristas" active={papelFilter === 'encontrista'} onClick={() => setPapelFilter('encontrista')} />
                <FilterPill label="Servos" active={papelFilter === 'servo'} onClick={() => setPapelFilter('servo')} />
              </div>
            </div>

            {/* Table body */}
            {listLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : listError ? (
              <div className="m-6 rounded-xl border border-red-900/50 bg-red-900/20 p-8 text-center">
                <p className="text-red-400 font-medium">Erro ao carregar inscrições</p>
                <p className="text-sm text-red-500 mt-1">
                  {(listError as Error).message || 'Tente novamente mais tarde.'}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="font-medium">Nenhuma inscrição encontrada</p>
                <p className="text-sm mt-1">Altere os filtros ou selecione outro evento.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-dark bg-white/3">
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Participante</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Papel</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Débito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <InscricaoRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty state — no event selected */}
        {!selectedEventoId && !eventosLoading && (
          <div className="rounded-xl border-2 border-dashed border-border-dark p-16 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="size-8 text-primary/50" />
            </div>
            <p className="text-slate-400 font-medium">Selecione um evento para ver as inscrições</p>
            <p className="text-sm text-slate-500 mt-1">As inscrições são listadas por evento.</p>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
