import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useEventos, useInadimplentes } from '../hooks/use-inscricoes'
import type { InadimplenteItem } from '../hooks/use-inscricoes'

type StatusFilter = 'todos' | 'inadimplentes'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PAGO_PARCIAL: { label: 'Pago Parcial', color: 'bg-blue-100 text-blue-800' },
  PAGO_TOTAL: { label: 'Pago Total', color: 'bg-green-100 text-green-800' },
  LISTA_ESPERA: { label: 'Lista de Espera', color: 'bg-gray-100 text-gray-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
}

const PAPEL_LABELS: Record<string, string> = {
  encontrista: 'Encontrista',
  servo: 'Servo',
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? { label: status, color: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

function InscricaoRow({ item }: { item: InadimplenteItem }) {
  const debitoAberto = item.valor_total - item.valor_pago
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{item.pessoa?.nome ?? '—'}</div>
        {item.pessoa?.telefone && (
          <div className="text-xs text-gray-500">{item.pessoa.telefone}</div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {PAPEL_LABELS[item.papel] ?? item.papel}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3 px-4 text-sm text-right">
        <div className="text-gray-900">R$ {item.valor_total.toFixed(2)}</div>
        {item.valor_pago > 0 && (
          <div className="text-xs text-green-600">Pago: R$ {item.valor_pago.toFixed(2)}</div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right">
        {debitoAberto > 0 ? (
          <span className="text-red-600 font-medium">R$ {debitoAberto.toFixed(2)}</span>
        ) : (
          <span className="text-green-600">—</span>
        )}
      </td>
    </tr>
  )
}

export function InscricoesPage() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [papelFilter, setPapelFilter] = useState<string>('todos')

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Voltar ao dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Inscricoes</h1>
              <p className="text-xs text-gray-500">Gestao de inscricoes por evento</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Event selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecionar Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {eventosLoading ? (
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            ) : (
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedEventoId}
                onChange={(e) => setSelectedEventoId(e.target.value)}
              >
                <option value="">-- Selecione um evento --</option>
                {(eventos ?? []).map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome} ({evento.status})
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {/* Summary cards */}
        {selectedEventoId && inadimplentes && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-gray-900">{totalInscritos}</div>
                <div className="text-xs text-gray-500 mt-1">Total Inscritos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{totalInadimplentes}</div>
                <div className="text-xs text-gray-500 mt-1">Inadimplentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{totalPagos}</div>
                <div className="text-xs text-gray-500 mt-1">Pagamento Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">R$ {totalArrecadado.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Arrecadado</div>
                {totalAPagar > 0 && (
                  <div className="text-xs text-red-500">Pendente: R$ {totalAPagar.toFixed(2)}</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters + Table */}
        {selectedEventoId && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">
                  Inscricoes — {selectedEvento?.nome ?? 'Evento'}
                  {filteredItems.length !== totalInscritos && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredItems.length} de {totalInscritos})
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  >
                    <option value="todos">Todos os status</option>
                    <option value="inadimplentes">Somente inadimplentes</option>
                  </select>
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={papelFilter}
                    onChange={(e) => setPapelFilter(e.target.value)}
                  >
                    <option value="todos">Todos os papeis</option>
                    <option value="encontrista">Encontristas</option>
                    <option value="servo">Servos</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {listLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : listError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 m-4 p-6 text-center space-y-2">
                  <p className="text-red-700 font-medium">Erro ao carregar inscricoes</p>
                  <p className="text-sm text-red-500">
                    {(listError as Error).message || 'Tente novamente mais tarde.'}
                  </p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="font-medium">Nenhuma inscricao encontrada</p>
                  <p className="text-sm mt-1">Altere os filtros ou selecione outro evento.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Participante</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Papel</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-700">Valor</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-700">Debito</th>
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
            </CardContent>
          </Card>
        )}

        {/* Empty state — no event selected */}
        {!selectedEventoId && !eventosLoading && (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center space-y-2">
            <p className="text-gray-500 font-medium">Selecione um evento para ver as inscricoes</p>
            <p className="text-sm text-gray-400">
              As inscricoes sao listadas por evento.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
