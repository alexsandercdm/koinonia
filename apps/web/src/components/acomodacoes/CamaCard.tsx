import { BedDouble, Plus } from 'lucide-react'
import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

const quartoGeneroSlotStyle: Record<string, string> = {
  F: 'bg-[#fdf4e7] border-[#f0d9a8] text-[#7a5d1e]',
  M: 'bg-[#e8f0fb] border-[#b8d0f0] text-[#1e4a7a]',
  MISTO: 'bg-[#f3f0fa] border-[#c8b8e8] text-[#4a1e7a]',
}

interface CamaCardProps {
  cama: CamaMapaItem
  quartoGenero?: 'M' | 'F' | 'MISTO'
  onAssign?: (cama: CamaMapaItem) => void
  onRelease?: (cama: CamaMapaItem) => void
}

export function CamaCard({ cama, quartoGenero = 'MISTO', onAssign, onRelease }: CamaCardProps) {
  const isOcupada = !!cama.ocupante && !cama.bloqueada
  const isBloqueada = cama.bloqueada

  const slotStyle = quartoGeneroSlotStyle[quartoGenero] ?? quartoGeneroSlotStyle.MISTO

  if (isBloqueada) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 text-xs text-text-tertiary">
        <BedDouble className="size-3.5 shrink-0" />
        <span className="truncate">Bloqueada</span>
      </div>
    )
  }

  if (isOcupada) {
    return (
      <button
        type="button"
        className={`flex h-11 w-full items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-opacity hover:opacity-80 ${slotStyle}`}
        onClick={() => onRelease?.(cama)}
        title={`Liberar: ${cama.ocupante}`}
      >
        <BedDouble className="size-3.5 shrink-0" />
        <span className="truncate">{cama.ocupante}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-transparent px-3 text-xs text-text-tertiary transition-colors hover:border-warm-gold/50 hover:text-warm-gold"
      onClick={() => onAssign?.(cama)}
    >
      <div className="flex items-center gap-2">
        <BedDouble className="size-3.5 shrink-0" />
        <span>Livre</span>
      </div>
      {onAssign && <Plus className="size-3.5 shrink-0" />}
    </button>
  )
}
