import { useMemo, useState } from 'react'
import { CalendarPlus, Search } from 'lucide-react'
import type { CreateEvento, EventoListItem, StatusEvento, UpdateEvento } from '@koinonia/shared'
import { AppLayout } from '../components/layout/AppLayout'
import { EventoCard } from '../components/eventos/EventoCard'
import { EventoForm } from '../components/eventos/EventoForm'
import { EVENTO_STATUS_OPTIONS } from '../components/eventos/evento-status'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { FilterTabs } from '../components/ui/filter-tabs'
import { Input } from '../components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import { useAuthContext } from '../contexts/auth-context'
import { useCreateEvento, useEventos, useUpdateEvento } from '../hooks/use-eventos'

type EventoFilter = 'todos' | StatusEvento

function normalizeSearchText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function EventosPage() {
  const { user } = useAuthContext()
  const canWrite = user?.role === 'admin'
  const eventosQuery = useEventos()
  const createEvento = useCreateEvento()
  const updateEvento = useUpdateEvento()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<EventoFilter>('todos')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [selectedEvento, setSelectedEvento] = useState<EventoListItem | undefined>()

  const eventos = eventosQuery.data ?? []
  const filtered = useMemo(() => {
    const searchTerm = normalizeSearchText(search.trim())

    return eventos.filter((evento) => {
      const matchSearch = !searchTerm || [
        evento.nome,
        evento.descricao,
        evento.local_nome,
      ].some((value) => normalizeSearchText(value).includes(searchTerm))
      const matchFilter = activeFilter === 'todos' || evento.status === activeFilter

      return matchSearch && matchFilter
    })
  }, [activeFilter, eventos, search])

  function openCreate() {
    setSheetMode('create')
    setSelectedEvento(undefined)
    setSheetOpen(true)
  }

  function openEdit(evento: EventoListItem) {
    setSheetMode('edit')
    setSelectedEvento(evento)
    setSheetOpen(true)
  }

  async function handleSubmit(payload: CreateEvento | UpdateEvento) {
    if (sheetMode === 'edit' && selectedEvento?.id) {
      await updateEvento.mutateAsync({ id: selectedEvento.id, payload: payload as UpdateEvento })
    } else {
      await createEvento.mutateAsync(payload as CreateEvento)
    }

    setSheetOpen(false)
  }

  const mutationError = createEvento.error || updateEvento.error
  const isSubmitting = createEvento.isPending || updateEvento.isPending

  const actions = canWrite ? (
    <Button variant="gold" size="sm" onClick={openCreate}>
      <CalendarPlus className="size-4" />
      <span>Novo Evento</span>
    </Button>
  ) : undefined

  return (
    <AppLayout title="Eventos" actions={actions}>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, local ou descricao..."
              className="pl-11"
            />
          </div>

          <FilterTabs
            ariaLabel="Filtros de eventos"
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as EventoFilter)}
            options={[
              { value: 'todos', label: 'Todos', count: eventos.length },
              ...EVENTO_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
                count: eventos.filter((evento) => evento.status === option.value).length,
              })),
            ]}
          />

          {!canWrite ? (
            <p className="text-sm text-text-secondary">
              Voce pode consultar eventos, mas apenas administradores podem criar ou editar.
            </p>
          ) : null}
        </div>

        {eventosQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-panel border border-border bg-card p-5">
                <div className="h-40 animate-pulse rounded-panel bg-muted" />
              </div>
            ))}
          </div>
        ) : null}

        {eventosQuery.error ? (
          <div className="rounded-panel border border-status-danger/25 bg-status-danger-bg p-8 text-center">
            <p className="font-semibold text-status-danger">Erro ao carregar eventos</p>
            <p className="mt-1 text-sm text-status-danger">{(eventosQuery.error as Error).message}</p>
          </div>
        ) : null}

        {!eventosQuery.isLoading && !eventosQuery.error ? (
          filtered.length === 0 ? (
            <EmptyState
              title="Nenhum evento encontrado"
              description="Revise os filtros ou crie o proximo retiro quando estiver pronto para abrir as inscricoes."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setActiveFilter('todos')
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="mx-auto w-full max-w-4xl space-y-4">
              {filtered.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  canWrite={canWrite}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )
        ) : null}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{sheetMode === 'create' ? 'Novo evento' : 'Editar evento'}</SheetTitle>
            <SheetDescription>
              Defina datas, capacidade, status e local do retiro.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            {mutationError ? (
              <div className="mb-4 rounded-panel border border-status-danger/25 bg-status-danger-bg p-3 text-sm text-status-danger">
                {(mutationError as Error).message}
              </div>
            ) : null}
            <EventoForm
              mode={sheetMode}
              initialValue={selectedEvento}
              disabled={!canWrite}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}
