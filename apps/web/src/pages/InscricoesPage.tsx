import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Plus, Search, Users, Wallet } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { useInscricoes } from '../hooks/use-inscricoes'
import type { InscricaoListItem } from '../hooks/use-inscricoes'

const SELECTED_EVENT_KEY = 'koinonia:selectedEventoId'

type StatusFilter = 'todos' | 'inadimplentes'
type PapelFilter = 'todos' | 'encontrista' | 'servo'

const STATUS_CONFIG: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PAGO_TOTAL: { label: 'Pago', variant: 'success' },
  PAGO_PARCIAL: { label: 'Parcial', variant: 'info' },
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  LISTA_ESPERA: { label: 'Espera', variant: 'neutral' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

const PAPEL_LABELS: Record<string, string> = {
  encontrista: 'Encontrista',
  servo: 'Servo',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getInitial(nome: string) {
  return nome.trim()[0]?.toUpperCase() ?? '?'
}

function MetricCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  iconClass: string
}) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className={`mb-3 flex size-10 items-center justify-center rounded-[8px] ${iconClass}`}>
        {icon}
      </div>
      <p className="text-[28px] font-semibold leading-none tracking-tight text-foreground">{value}</p>
      <p className="mt-1.5 text-[13px] text-text-secondary">{label}</p>
    </div>
  )
}

function InscricaoRow({ item }: { item: InscricaoListItem }) {
  const debito = item.valor_total - item.valor_pago
  const statusCfg = STATUS_CONFIG[item.status] ?? { label: item.status, variant: 'neutral' as const }
  const nome = item.pessoa?.nome ?? '—'

  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-raised">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warm-gold-light text-[11px] font-bold text-warm-gold">
            {getInitial(nome)}
          </div>
          <span className="text-sm font-medium text-foreground">{nome}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-text-secondary">{PAPEL_LABELS[item.papel] ?? item.papel}</td>
      <td className="px-5 py-3.5">
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </td>
      <td className="px-5 py-3.5 text-right text-sm text-foreground">{formatCurrency(item.valor_total)}</td>
      <td className="px-5 py-3.5 text-right text-sm font-medium">
        {item.valor_pago > 0 ? (
          <span className="text-status-success">{formatCurrency(item.valor_pago)}</span>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right text-sm font-semibold">
        {debito > 0 ? (
          <span className="text-status-danger">{formatCurrency(debito)}</span>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        <button className="text-sm font-semibold text-warm-gold hover:underline">Detalhar</button>
      </td>
    </tr>
  )
}

export function InscricoesPage() {
  const [selectedEventoId, setSelectedEventoId] = useState(() =>
    typeof window !== 'undefined' ? (window.localStorage.getItem(SELECTED_EVENT_KEY) ?? '') : ''
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [papelFilter, setPapelFilter] = useState<PapelFilter>('todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handler = () => {
      setSelectedEventoId(window.localStorage.getItem(SELECTED_EVENT_KEY) ?? '')
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const { data: inscricoes, isLoading, error } = useInscricoes(selectedEventoId)

  const filtered = (inscricoes ?? []).filter((item) => {
    if (statusFilter === 'inadimplentes') {
      if (item.status !== 'PENDENTE' && item.status !== 'PAGO_PARCIAL') return false
    }
    if (papelFilter !== 'todos' && item.papel !== papelFilter) return false
    if (search && !item.pessoa?.nome?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalInscritos = inscricoes?.length ?? 0
  const totalInadimplentes = inscricoes?.filter((i) => i.status === 'PENDENTE' || i.status === 'PAGO_PARCIAL').length ?? 0
  const totalPagos = inscricoes?.filter((i) => i.status === 'PAGO_TOTAL').length ?? 0
  const totalArrecadado = inscricoes?.reduce((sum, i) => sum + i.valor_pago, 0) ?? 0

  return (
    <AppLayout
      title="Inscrições"
      actions={
        <Button size="sm">
          <Plus size={16} />
          Nova inscrição
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-7">
        {selectedEventoId && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              icon={<Users size={18} />}
              label="Total inscritos"
              value={totalInscritos}
              iconClass="bg-status-info-bg text-status-info"
            />
            <MetricCard
              icon={<AlertTriangle size={18} />}
              label="Inadimplentes"
              value={totalInadimplentes}
              iconClass="bg-status-warning-bg text-status-warning"
            />
            <MetricCard
              icon={<CheckCircle size={18} />}
              label="Pagamento total"
              value={totalPagos}
              iconClass="bg-status-success-bg text-status-success"
            />
            <MetricCard
              icon={<Wallet size={18} />}
              label="Arrecadado"
              value={formatCurrency(totalArrecadado)}
              iconClass="bg-warm-gold-light text-warm-gold"
            />
          </div>
        )}

        {selectedEventoId ? (
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome..."
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-ring"
                />
              </div>
              <FilterTabs
                ariaLabel="Filtro de status"
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'inadimplentes', label: 'Inadimplentes' },
                ]}
              />
              <FilterTabs
                ariaLabel="Filtro de papel"
                value={papelFilter}
                onValueChange={(v) => setPapelFilter(v as PapelFilter)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'encontrista', label: 'Encontristas' },
                  { value: 'servo', label: 'Servos' },
                ]}
              />
              <Button size="sm">
                <Plus size={16} />
                Nova inscrição
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-10 animate-spin rounded-full border-b-2 border-ring" />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="font-semibold text-status-danger">Erro ao carregar inscrições</p>
                <p className="mt-1 text-sm text-text-secondary">{(error as Error).message ?? 'Tente novamente mais tarde.'}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState title="Nenhuma inscrição encontrada" description="Altere os filtros para ver mais resultados." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised">
                      {['Participante', 'Papel', 'Status', 'Valor Total', 'Pago', 'Débito', ''].map((col, i) => (
                        <th
                          key={i}
                          className={[
                            'px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary',
                            i >= 3 ? 'text-right' : 'text-left',
                          ].join(' ')}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <InscricaoRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="size-8" />}
            title="Nenhum evento selecionado"
            description="Selecione um evento no seletor do topo para ver as inscrições."
          />
        )}
      </div>
    </AppLayout>
  )
}
