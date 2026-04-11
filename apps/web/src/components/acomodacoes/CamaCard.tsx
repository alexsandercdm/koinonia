import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

type CamaStatus = 'Disponivel' | 'Ocupado' | 'Bloqueado'

function getStatus(cama: CamaMapaItem): CamaStatus {
  if (cama.bloqueada) return 'Bloqueado'
  if (cama.ocupante) return 'Ocupado'
  return 'Disponivel'
}

const statusStyles: Record<CamaStatus, string> = {
  Disponivel: 'bg-green-50 border-green-300 text-green-800',
  Ocupado: 'bg-blue-50 border-blue-400 text-blue-900',
  Bloqueado: 'bg-red-50 border-red-400 text-red-900',
}

const statusBadgeStyles: Record<CamaStatus, string> = {
  Disponivel: 'bg-green-100 text-green-700',
  Ocupado: 'bg-blue-100 text-blue-700',
  Bloqueado: 'bg-red-100 text-red-700',
}

interface CamaCardProps {
  cama: CamaMapaItem
  /** Placeholder callback — will be activated in plan 03-04 */
  onAssign?: (camaId: string) => void
  /** Placeholder callback — will be activated in plan 03-04 */
  onRelease?: (inscricaoId: string) => void
}

export function CamaCard({ cama }: CamaCardProps) {
  const status = getStatus(cama)

  return (
    <div
      className={`rounded-lg border-2 p-3 space-y-1 transition-colors min-h-[72px] ${statusStyles[status]}`}
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
      <p className="text-xs opacity-60 capitalize">{cama.tipo.replace(/_/g, ' ')}</p>
    </div>
  )
}
