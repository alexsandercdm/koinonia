import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { EstruturaAcomodacaoPanel } from '../components/acomodacoes/EstruturaAcomodacaoPanel'
import { MapaQuartosGrid } from '../components/acomodacoes/MapaQuartosGrid'
import { AssignCamaSheet } from '../components/acomodacoes/AssignCamaSheet'
import { ExportMapaPdfButton } from '../components/acomodacoes/ExportMapaPdfButton'
import { useEventos, useMapaAcomodacao } from '../hooks/use-acomodacoes'
import { useAuthContext } from '../contexts/auth-context'
import type { CamaMapaItem } from '../hooks/use-acomodacoes'

type UserRole = 'admin' | 'lider' | 'servo'
type GeneroFilter = 'todos' | 'M' | 'F'

export function AcomodacoesPage() {
  const { user } = useAuthContext()
  const userRole: UserRole =
    user?.role === 'admin' || user?.role === 'lider' ? (user.role as UserRole) : 'servo'

  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'mapa' | 'estrutura'>('mapa')
  const [generoFilter, setGeneroFilter] = useState<GeneroFilter>('todos')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedCama, setSelectedCama] = useState<CamaMapaItem | null>(null)

  const { data: eventos = [], isLoading: eventosLoading } = useEventos()

  const {
    data: mapa,
    isLoading: mapaLoading,
    error: mapaError,
  } = useMapaAcomodacao(selectedEventoId)

  const eventoOptions = eventos.map((e) => ({
    id: e.id,
    nome: e.nome,
    local_id: e.local_id,
  }))

  const selectedEvento = eventos.find((e) => e.id === selectedEventoId)
  const canWrite = userRole === 'admin' || userRole === 'lider'

  function handleCamaAction(cama: CamaMapaItem) {
    setSelectedCama(cama)
    setSheetOpen(true)
  }

  // Event selector in the AppLayout header actions
  const headerActions = (
    <div className="flex items-center gap-3">
      <select
        value={selectedEventoId}
        onChange={(e) => setSelectedEventoId(e.target.value)}
        disabled={eventosLoading}
        className="h-9 rounded-lg border border-border-dark bg-surface-elevated text-slate-200 text-sm px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      >
        <option value="">Selecione um evento...</option>
        {eventoOptions.map((evento) => (
          <option key={evento.id} value={evento.id}>
            {evento.nome}
          </option>
        ))}
      </select>
      {mapa && selectedEvento && (
        <ExportMapaPdfButton mapa={mapa} eventoNome={selectedEvento.nome ?? 'evento'} />
      )}
    </div>
  )

  return (
    <AppLayout title="Gestão de Acomodações" actions={headerActions}>
      <div className="p-6 space-y-6">
        {/* Tab + Gender filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Page tabs */}
          <div className="flex border-b border-border-dark gap-1">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'mapa'
                  ? 'border-b-2 border-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('mapa')}
            >
              Mapa Visual
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'estrutura'
                  ? 'border-b-2 border-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('estrutura')}
            >
              Estrutura
              {userRole === 'servo' && (
                <span className="ml-1 text-xs text-slate-500">(leitura)</span>
              )}
            </button>
          </div>

          {/* Gender filter pills — only visible on mapa tab */}
          {activeTab === 'mapa' && (
            <div className="flex bg-surface-dark p-1 rounded-xl border border-border-dark gap-1">
              {(
                [
                  { value: 'todos', label: 'Todos' },
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                ] as { value: GeneroFilter; label: string }[]
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setGeneroFilter(value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    generoFilter === value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mapa tab */}
        {activeTab === 'mapa' && (
          <section>
            {!selectedEventoId ? (
              <div className="rounded-xl border border-dashed border-border-dark p-12 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-600">bed</span>
                <p className="text-slate-300 font-medium">Nenhum evento selecionado</p>
                <p className="text-sm text-slate-500">
                  Selecione um evento acima para ver o mapa de acomodações.
                </p>
              </div>
            ) : mapaLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : mapaError ? (
              <div className="rounded-xl border border-red-800/40 bg-red-900/20 p-6 text-center space-y-2">
                <p className="text-red-400 font-medium">Erro ao carregar mapa</p>
                <p className="text-sm text-red-500">
                  {(mapaError as Error).message || 'Tente novamente mais tarde.'}
                </p>
              </div>
            ) : mapa ? (
              <MapaQuartosGrid
                mapa={mapa}
                generoFilter={generoFilter}
                onAssign={canWrite ? handleCamaAction : undefined}
                onRelease={canWrite ? handleCamaAction : undefined}
              />
            ) : null}
          </section>
        )}

        {/* Estrutura tab */}
        {activeTab === 'estrutura' && (
          <section>
            {userRole === 'servo' && (
              <div className="mb-4 rounded-xl bg-amber-900/20 border border-amber-700/40 px-4 py-3 text-sm text-amber-400">
                Modo somente leitura. Apenas administradores e líderes podem editar a estrutura.
              </div>
            )}
            <EstruturaAcomodacaoPanel userRole={userRole} />
          </section>
        )}
      </div>

      {/* Assignment / release sheet */}
      <AssignCamaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cama={selectedCama}
        eventoId={selectedEventoId}
        userRole={userRole}
      />
    </AppLayout>
  )
}
