import { useState } from 'react'
import { Search, Users, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useEventos, useInadimplentes } from '../hooks/use-inscricoes'
import type { InadimplenteItem } from '../hooks/use-inscricoes'

type StatusFilter = 'todos' | 'inadimplentes'
type PapelFilter = 'todos' | 'encontrista' | 'servo'

const STATUS_CONFIG: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  PAGO_PARCIAL: { label: 'Pago Parcial', variant: 'info' },
  PAGO_TOTAL: { label: 'Pago Total', variant: 'success' },
  LISTA_ESPERA: { label: 'Lista de Espera', variant: 'neutral' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

const PAPEL_LABELS: Record<string, string> = {
  encontrista: 'Encontrista',
  servo: 'Servo',
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
        <div>
          <div className="text-2xl font-semibold text-foreground">{value}</div>
          <div className="mt-0.5 text-xs text-text-secondary">{label}</div>
          {sub ? <div className="mt-0.5 text-xs text-status-danger">{sub}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function InscricaoRow({ item }: { item: InadimplenteItem }) {
  const debitoAberto = item.valor_total - item.valor_pago
  const initial = item.pessoa?.nome?.trim()[0]?.toUpperCase() ?? '?'

  return (
    <tr className="border-b border-border transition-colors hover:bg-surface-raised">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
            {initial}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{item.pessoa?.nome ?? '—'}</div>
            {item.pessoa?.telefone ? <div className="text-xs text-text-secondary">{item.pessoa.telefone}</div> : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{PAPEL_LABELS[item.papel] ?? item.papel}</td>
      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
      <td className="px-4 py-3 text-right text-sm">
        <div className="text-foreground">R$ {item.valor_total.toFixed(2)}</div>
        {item.valor_pago > 0 ? <div className="text-xs text-status-success">Pago: R$ {item.valor_pago.toFixed(2)}</div> : null}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        {debitoAberto > 0 ? (
          <span className="font-semibold text-status-danger">R$ {debitoAberto.toFixed(2)}</span>
        ) : (
          <span className="text-status-success">—</span>
        )}
      </td>
    </tr>
  )
}

export function InscricoesPage() {
  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [papelFilter, setPapelFilter] = useState<PapelFilter>('todos')
  const [search, setSearch] = useState('')

  const { data: eventos, isLoading: eventosLoading } = useEventos()
  const { data: inadimplentes, isLoading: listLoading, error: listError } = useInadimplentes(selectedEventoId)

  const selectedEvento = eventos?.find((e) => e.id === selectedEventoId)

  const filteredItems = (inadimplentes ?? []).filter((item) => {
    if (statusFilter === 'inadimplentes') {
      const isInadimplente = item.status === 'PENDENTE' || item.status === 'PAGO_PARCIAL'
      if (!isInadimplente) return false
    }
    if (papelFilter !== 'todos' && item.papel !== papelFilter) return false
    if (search && !item.pessoa?.nome?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalInscritos = inadimplentes?.length ?? 0
  const totalInadimplentes = inadimplentes?.filter((i) => i.status === 'PENDENTE' || i.status === 'PAGO_PARCIAL').length ?? 0
  const totalPagos = inadimplentes?.filter((i) => i.status === 'PAGO_TOTAL').length ?? 0
  const totalArrecadado = inadimplentes?.reduce((sum, i) => sum + i.valor_pago, 0) ?? 0
  const totalAPagar = inadimplentes?.reduce((sum, i) => sum + (i.valor_total - i.valor_pago), 0) ?? 0

  return (
    <AppLayout title="Inscrições">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-5">
            <label className="mb-2 block text-sm font-semibold text-foreground">Selecionar Evento</label>
            {eventosLoading ? (
              <div className="h-11 animate-pulse rounded-lg bg-muted" />
            ) : (
              <Select value={selectedEventoId} onChange={(e) => setSelectedEventoId(e.target.value)}>
                <option value="">-- Selecione um evento --</option>
                {(eventos ?? []).map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome} ({evento.status})
                  </option>
                ))}
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedEventoId && inadimplentes ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard icon={<Users className="size-5 text-foreground" />} label="Total Inscritos" value={totalInscritos} />
            <MetricCard icon={<AlertTriangle className="size-5 text-status-danger" />} label="Inadimplentes" value={totalInadimplentes} />
            <MetricCard icon={<CheckCircle className="size-5 text-status-success" />} label="Pagamento Total" value={totalPagos} />
            <MetricCard icon={<DollarSign className="size-5 text-warm-gold" />} label="Arrecadado" value={`R$ ${totalArrecadado.toFixed(2)}`} sub={totalAPagar > 0 ? `Pendente: R$ ${totalAPagar.toFixed(2)}` : undefined} />
          </div>
        ) : null}

        {selectedEventoId ? (
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>
                {selectedEvento?.nome ?? 'Evento'}
                {filteredItems.length !== totalInscritos ? (
                  <span className="ml-2 text-sm font-normal text-text-secondary">({filteredItems.length} de {totalInscritos})</span>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome..." className="pl-10" />
              </div>

              <div className="flex flex-col gap-3">
                <FilterTabs
                  ariaLabel="Filtro de status"
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  options={[
                    { value: 'todos', label: 'Todos' },
                    { value: 'inadimplentes', label: 'Inadimplentes' },
                  ]}
                />
                <FilterTabs
                  ariaLabel="Filtro de papel"
                  value={papelFilter}
                  onValueChange={(value) => setPapelFilter(value as PapelFilter)}
                  options={[
                    { value: 'todos', label: 'Todos os papéis' },
                    { value: 'encontrista', label: 'Encontristas' },
                    { value: 'servo', label: 'Servos' },
                  ]}
                />
              </div>

              {listLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="size-10 animate-spin rounded-full border-b-2 border-ring" />
                </div>
              ) : listError ? (
                <div className="rounded-lg border border-status-danger/25 bg-status-danger-bg p-8 text-center">
                  <p className="font-semibold text-status-danger">Erro ao carregar inscrições</p>
                  <p className="mt-1 text-sm text-status-danger">{(listError as Error).message || 'Tente novamente mais tarde.'}</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <EmptyState title="Nenhuma inscrição encontrada" description="Altere os filtros ou selecione outro evento." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-raised">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Participante</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Papel</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">Valor</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">Débito</th>
                      </tr>
                    </thead>
                    <tbody>{filteredItems.map((item) => <InscricaoRow key={item.id} item={item} />)}</tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {!selectedEventoId && !eventosLoading ? (
          <EmptyState
            icon={<Users className="size-8" />}
            title="Selecione um evento para ver as inscrições"
            description="As inscrições são listadas por evento e respeitam os filtros operacionais da equipe."
          />
        ) : null}
      </div>
    </AppLayout>
  )
}
