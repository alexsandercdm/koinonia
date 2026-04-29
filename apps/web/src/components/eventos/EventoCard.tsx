import { Building2, CalendarDays, Pencil, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { EventoListItem } from '@koinonia/shared'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { getEventoStatusMeta } from './evento-status'

export interface EventoCardProps {
  evento: EventoListItem
  canWrite: boolean
  onEdit: (evento: EventoListItem) => void
}

function formatDateRange(inicio: string, fim: string) {
  const fmt = (v: string) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(`${v}T00:00:00`)
    )
  return `${fmt(inicio)} → ${fmt(fim)}`
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const statusBorderColor: Record<string, string> = {
  aberto: 'border-l-warm-gold',
  encerrado: 'border-l-status-danger',
  realizado: 'border-l-status-info',
  rascunho: 'border-l-border',
  cancelado: 'border-l-status-danger',
}

export function EventoCard({ evento, canWrite, onEdit }: EventoCardProps) {
  const navigate = useNavigate()
  const statusMeta = getEventoStatusMeta(evento.status)
  const inscritosCount = evento.inscritos_count ?? 0
  const capacidade = evento.capacidade_maxima
  const ocupacaoPercentual = Math.min(100, Math.max(0, evento.ocupacao_percentual ?? 0))
  const vagasDisponiveis = Math.max(0, capacidade - inscritosCount)
  const percentualDisponivel = capacidade > 0 ? Math.round((vagasDisponiveis / capacidade) * 100) : 0
  const isAoVivo = evento.status === 'aberto'
  const borderColor = statusBorderColor[evento.status] ?? 'border-l-border'

  const precoEncontrista = (evento as any).preco_encontrista as number | null | undefined
  const precoServo = (evento as any).preco_servo as number | null | undefined
  const localNome = (evento as any).local_nome as string | null | undefined

  return (
    <article
      className={`overflow-hidden rounded-panel border border-border border-l-4 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${borderColor}`}
    >
      <div className="p-5">
        {/* Top row: status + actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            {isAoVivo && (
              <span className="flex items-center gap-1 text-xs font-medium text-status-success">
                <span className="inline-block size-1.5 rounded-full bg-status-success" />
                Ao vivo
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-xs">
              <QrCode className="size-3.5" />
              Check-in QR
            </Button>
            {canWrite && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs"
                onClick={() => onEdit(evento)}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold leading-tight text-foreground">{evento.nome}</h3>

        {/* Local + Dates */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
          {localNome && (
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-warm-gold" />
              {localNome}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-warm-gold" />
            {formatDateRange(evento.data_inicio, evento.data_fim)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text-secondary">Inscrições</span>
            <span className="font-semibold text-foreground">
              {inscritosCount} / {capacidade}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-pill bg-muted">
            <div
              className={`h-full rounded-pill transition-all ${
                ocupacaoPercentual >= 90 ? 'bg-status-danger' : 'bg-warm-gold'
              }`}
              style={{ width: `${ocupacaoPercentual}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">{percentualDisponivel}% de vagas disponíveis</p>
        </div>

        {/* Footer: prices + links */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-4">
            {precoEncontrista != null && (
              <div>
                <p className="text-base font-bold text-foreground">{formatBRL(precoEncontrista)}</p>
                <p className="text-xs text-text-tertiary">Encontrista</p>
              </div>
            )}
            {precoServo != null && (
              <div>
                <p className="text-base font-bold text-foreground">{formatBRL(precoServo)}</p>
                <p className="text-xs text-text-tertiary">Servo</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <button
              type="button"
              className="font-semibold text-warm-gold hover:underline"
              onClick={() => navigate(`/inscricoes?evento=${evento.id}`)}
            >
              Ver inscrições →
            </button>
            <button
              type="button"
              className="font-semibold text-warm-gold hover:underline"
              onClick={() => navigate(`/acomodacoes?evento=${evento.id}`)}
            >
              Mapa de camas →
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
