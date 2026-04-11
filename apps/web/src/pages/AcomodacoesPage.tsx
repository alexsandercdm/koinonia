import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { AcomodacoesFilters } from '../components/acomodacoes/AcomodacoesFilters'
import { EstruturaAcomodacaoPanel } from '../components/acomodacoes/EstruturaAcomodacaoPanel'
import { MapaQuartosGrid } from '../components/acomodacoes/MapaQuartosGrid'
import { AssignCamaSheet } from '../components/acomodacoes/AssignCamaSheet'
import { ExportMapaPdfButton } from '../components/acomodacoes/ExportMapaPdfButton'
import { useEventos, useMapaAcomodacao } from '../hooks/use-acomodacoes'
import type { CamaMapaItem } from '../hooks/use-acomodacoes'

type UserRole = 'admin' | 'lider' | 'servo'

export function AcomodacoesPage() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const userRole: UserRole =
    user?.role === 'admin' || user?.role === 'lider' ? (user.role as UserRole) : 'servo'

  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'mapa' | 'estrutura'>('mapa')

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Voltar ao dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Acomodações</h1>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="h-10">
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Event filter */}
        <AcomodacoesFilters
          eventos={eventoOptions}
          selectedEventoId={selectedEventoId}
          onEventoChange={setSelectedEventoId}
          isLoading={eventosLoading}
        />

        {/* Tab switcher — all roles see both tabs; servo gets read-only estrutura */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'mapa'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('mapa')}
          >
            Mapa Visual
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'estrutura'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('estrutura')}
          >
            Estrutura
            {userRole === 'servo' && (
              <span className="ml-1 text-xs text-gray-400">(leitura)</span>
            )}
          </button>
        </div>

        {/* Mapa tab */}
        {activeTab === 'mapa' && (
          <section>
            {!selectedEventoId ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center space-y-2">
                <p className="text-gray-500 font-medium">Nenhum evento selecionado</p>
                <p className="text-sm text-gray-400">
                  Selecione um evento acima para ver o mapa de acomodações.
                </p>
              </div>
            ) : mapaLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            ) : mapaError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-2">
                <p className="text-red-700 font-medium">Erro ao carregar mapa</p>
                <p className="text-sm text-red-500">
                  {(mapaError as Error).message || 'Tente novamente mais tarde.'}
                </p>
              </div>
            ) : mapa ? (
              <>
                <div className="flex justify-end mb-3">
                  <ExportMapaPdfButton
                    mapa={mapa}
                    eventoNome={selectedEvento?.nome ?? 'evento'}
                  />
                </div>
                <MapaQuartosGrid
                  mapa={mapa}
                  onAssign={canWrite ? handleCamaAction : undefined}
                  onRelease={canWrite ? handleCamaAction : undefined}
                />
              </>
            ) : null}
          </section>
        )}

        {/* Estrutura tab — write for admin/lider, read-only for servo */}
        {activeTab === 'estrutura' && (
          <section>
            {userRole === 'servo' && (
              <div className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
                Modo somente leitura. Apenas administradores e líderes podem editar a estrutura.
              </div>
            )}
            <EstruturaAcomodacaoPanel userRole={userRole} />
          </section>
        )}
      </main>

      {/* Assignment / release sheet */}
      <AssignCamaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cama={selectedCama}
        eventoId={selectedEventoId}
        userRole={userRole}
      />
    </div>
  )
}
