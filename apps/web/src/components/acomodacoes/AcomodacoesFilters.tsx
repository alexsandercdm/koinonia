import { Label } from '../ui/label'

export interface EventoOption {
  id: string
  nome: string
  local_id: string | null
}

interface AcomodacoesFiltersProps {
  eventos: EventoOption[]
  selectedEventoId: string
  onEventoChange: (eventoId: string) => void
  isLoading?: boolean
}

export function AcomodacoesFilters({
  eventos,
  selectedEventoId,
  onEventoChange,
  isLoading = false,
}: AcomodacoesFiltersProps) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Filtrar por Evento</h2>
      <div className="space-y-1.5">
        <Label htmlFor="evento-select">Evento</Label>
        <select
          id="evento-select"
          value={selectedEventoId}
          onChange={(e) => onEventoChange(e.target.value)}
          disabled={isLoading}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecione um evento...</option>
          {eventos.map((evento) => (
            <option key={evento.id} value={evento.id}>
              {evento.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
