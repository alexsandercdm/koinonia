import type { StatusEvento } from '@koinonia/shared'
import type { BadgeProps } from '../ui/badge'

export const EVENTO_STATUS_OPTIONS: Array<{ value: StatusEvento; label: string }> = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const EVENTO_STATUS_META: Record<StatusEvento, { label: string; variant: BadgeProps['variant'] }> = {
  rascunho: { label: 'Rascunho', variant: 'neutral' },
  aberto: { label: 'Aberto', variant: 'success' },
  encerrado: { label: 'Encerrado', variant: 'warning' },
  realizado: { label: 'Realizado', variant: 'info' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
}

export function getEventoStatusMeta(status: string) {
  return EVENTO_STATUS_META[status as StatusEvento] ?? EVENTO_STATUS_META.rascunho
}
