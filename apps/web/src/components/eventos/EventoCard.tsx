import { CalendarDays, MapPin, Pencil, Users } from 'lucide-react'
import type { EventoListItem } from '@koinonia/shared'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { getEventoStatusMeta } from './evento-status'

export interface EventoCardProps {
  evento: EventoListItem
  canWrite: boolean
  onEdit: (evento: EventoListItem) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function EventoCard({ evento, canWrite, onEdit }: EventoCardProps) {
  const statusMeta = getEventoStatusMeta(evento.status)
  const inscritosCount = evento.inscritos_count ?? 0
  const ocupacaoPercentual = Math.min(100, Math.max(0, evento.ocupacao_percentual ?? 0))
  const capacidade = evento.capacidade_maxima

  return (
    <article className="rounded-panel border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-warm-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight text-foreground">
            {evento.nome}
          </h3>
          {evento.descricao ? (
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{evento.descricao}</p>
          ) : null}
        </div>
        {canWrite ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Editar ${evento.nome}`}
            onClick={() => onEdit(evento)}
          >
            <Pencil className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="mt-5 space-y-3 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-warm-gold" />
          <span>{formatDate(evento.data_inicio)} - {formatDate(evento.data_fim)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-warm-gold" />
          <span>{evento.local_id ? `Local ${evento.local_id.slice(0, 8)}` : 'Local nao definido'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-warm-gold" />
          <span>{inscritosCount} de {capacidade} inscritos</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Ocupacao</span>
          <span className="font-semibold text-foreground">{ocupacaoPercentual}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-pill bg-muted">
          <div
            className="h-full rounded-pill bg-warm-gold"
            style={{ width: `${ocupacaoPercentual}%` }}
          />
        </div>
      </div>
    </article>
  )
}
