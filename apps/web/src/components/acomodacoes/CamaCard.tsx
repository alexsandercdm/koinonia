import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

type CamaStatus = 'Disponivel' | 'Ocupado' | 'Bloqueado'

function getStatus(cama: CamaMapaItem): CamaStatus {
  if (cama.bloqueada) return 'Bloqueado'
  if (cama.ocupante) return 'Ocupado'
  return 'Disponivel'
}

const statusStyles: Record<CamaStatus, string> = {
  Disponivel: 'bg-status-success-bg border-status-success/30 text-status-success',
  Ocupado: 'bg-status-info-bg border-status-info/30 text-status-info',
  Bloqueado: 'bg-status-danger-bg border-status-danger/25 text-status-danger',
}

const statusBadgeStyles: Record<CamaStatus, string> = {
  Disponivel: 'bg-card text-status-success',
  Ocupado: 'bg-card text-status-info',
  Bloqueado: 'bg-card text-status-danger',
}

interface CamaCardProps {
  cama: CamaMapaItem
  onAssign?: (cama: CamaMapaItem) => void
  onRelease?: (cama: CamaMapaItem) => void
}

export function CamaCard({ cama, onAssign, onRelease }: CamaCardProps) {
  const status = getStatus(cama)

  const handleClick = () => {
    if (cama.bloqueada) return
    if (status === 'Disponivel' && onAssign) onAssign(cama)
    if (status === 'Ocupado' && onRelease) onRelease(cama)
  }

  const isInteractive = !cama.bloqueada && (onAssign || onRelease)

  return (
    <div
      className={`rounded-lg border-2 p-3 space-y-1 transition-all min-h-[72px] ${statusStyles[status]} ${isInteractive ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}`}
      onClick={isInteractive ? handleClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && handleClick() : undefined}
      aria-label={
        isInteractive
          ? status === 'Disponivel'
            ? `Atribuir cama ${cama.identificacao}`
            : `Liberar cama ${cama.identificacao}`
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm leading-tight">{cama.identificacao}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadgeStyles[status]}`}
        >
          {status}
        </span>
      </div>
      {cama.ocupante && (
        <p className="text-xs leading-tight truncate" title={cama.ocupante}>
          {cama.ocupante}
        </p>
      )}
      <p className="text-xs opacity-50 capitalize">{cama.tipo.replace(/_/g, ' ')}</p>
    </div>
  )
}
