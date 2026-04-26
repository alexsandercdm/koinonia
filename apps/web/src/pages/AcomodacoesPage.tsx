import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { EstruturaAcomodacaoPanel } from '../components/acomodacoes/EstruturaAcomodacaoPanel'
import { MapaQuartosGrid } from '../components/acomodacoes/MapaQuartosGrid'
import { AssignCamaSheet } from '../components/acomodacoes/AssignCamaSheet'
import { ExportMapaPdfButton } from '../components/acomodacoes/ExportMapaPdfButton'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { Select } from '../components/ui/select'
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
      <Select
        value={selectedEventoId}
        onChange={(e) => setSelectedEventoId(e.target.value)}
        disabled={eventosLoading}
        className="h-10 min-w-[220px] text-sm"
      >
        <option value="">Selecione um evento...</option>
        {eventoOptions.map((evento) => (
          <option key={evento.id} value={evento.id}>
            {evento.nome}
          </option>
        ))}
      </Select>
      {mapa && selectedEvento && (
        <ExportMapaPdfButton mapa={mapa} eventoNome={selectedEvento.nome ?? 'evento'} />
      )}
    </div>
  )

  return (
    <AppLayout title="Gestão de Acomodações" actions={headerActions}>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Tab + Gender filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FilterTabs
            ariaLabel="Visualização de acomodações"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'mapa' | 'estrutura')}
            options={[
              { value: 'mapa', label: 'Mapa Visual' },
              { value: 'estrutura', label: userRole === 'servo' ? 'Estrutura (leitura)' : 'Estrutura' },
            ]}
          />

          {/* Gender filter pills — only visible on mapa tab */}
          {activeTab === 'mapa' && (
            <FilterTabs
              ariaLabel="Filtro de gênero dos quartos"
              value={generoFilter}
              onValueChange={(value) => setGeneroFilter(value as GeneroFilter)}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
              ]}
            />
          )}
        </div>

        {/* Mapa tab */}
        {activeTab === 'mapa' && (
          <section>
            {!selectedEventoId ? (
              <EmptyState
                title="Nenhum evento selecionado"
                description="Selecione um evento acima para ver o mapa de acomodações."
              />
            ) : mapaLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : mapaError ? (
              <div className="rounded-lg border border-status-danger/25 bg-status-danger-bg p-6 text-center">
                <p className="font-semibold text-status-danger">Erro ao carregar mapa</p>
                <p className="mt-1 text-sm text-status-danger">
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
              <div className="mb-4 rounded-lg border border-status-warning/25 bg-status-warning-bg px-4 py-3 text-sm text-status-warning">
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
