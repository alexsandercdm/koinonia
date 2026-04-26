import { CamaCard } from './CamaCard'
import type { MapaAcomodacao } from '@koinonia/shared'
import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

type GeneroFilter = 'todos' | 'M' | 'F'

const generoLabel: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  MISTO: 'Misto',
}

const generoBorderColor: Record<string, string> = {
  M: 'border-l-status-info',
  F: 'border-l-status-warning',
  MISTO: 'border-l-warm-gold',
}

const generoTagStyle: Record<string, string> = {
  M: 'bg-status-info-bg text-status-info border border-status-info/25',
  F: 'bg-status-warning-bg text-status-warning border border-status-warning/25',
  MISTO: 'bg-warm-gold-soft text-primary border border-warm-gold/25',
}

interface QuartoMapaComContadores {
  id: string
  nome: string
  genero_permitido: 'M' | 'F' | 'MISTO'
  capacidade: number
  camas: CamaMapaItem[]
  ocupados: number
  disponiveis: number
}

interface QuartoCardProps {
  quarto: QuartoMapaComContadores
  onAssign?: (cama: CamaMapaItem) => void
  onRelease?: (cama: CamaMapaItem) => void
}

function QuartoCard({ quarto, onAssign, onRelease }: QuartoCardProps) {
  const borderColor = generoBorderColor[quarto.genero_permitido] ?? 'border-l-warm-gold'
  const tagStyle = generoTagStyle[quarto.genero_permitido] ?? 'bg-warm-gold-soft text-primary border border-warm-gold/25'

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-border border-l-4 bg-card shadow-sm ${borderColor}`}
      data-quarto-id={quarto.id}
    >
      {/* Card header */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight text-foreground">{quarto.nome}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tagStyle}`}>
                {generoLabel[quarto.genero_permitido] ?? quarto.genero_permitido}
              </span>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-border bg-surface-raised px-3 py-1">
            <span className="whitespace-nowrap text-xs font-semibold text-foreground">
              {quarto.ocupados} / {quarto.capacidade} Ocupadas
            </span>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-status-success" />
            {quarto.disponiveis} disponível(is)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-status-info" />
            {quarto.ocupados} ocupada(s)
          </span>
        </div>
      </div>

      {/* Beds grid */}
      <div className="p-5">
        {quarto.camas.length === 0 ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-3xl text-text-tertiary">hotel</span>
            <p className="mt-1 text-sm italic text-text-secondary">Sem camas cadastradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quarto.camas.map((cama) => (
              <CamaCard
                key={cama.id}
                cama={cama}
                onAssign={onAssign}
                onRelease={onRelease}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface MapaQuartosGridProps {
  mapa: MapaAcomodacao
  generoFilter?: GeneroFilter
  onAssign?: (cama: CamaMapaItem) => void
  onRelease?: (cama: CamaMapaItem) => void
}

function derivarContadores(quarto: MapaAcomodacao['quartos'][number]): QuartoMapaComContadores {
  const camas = quarto.camas as unknown as CamaMapaItem[]
  const ocupados = camas.filter(c => c.ocupante !== null).length
  const disponiveis = camas.filter(c => !c.bloqueada && c.ocupante === null).length
  return {
    id: quarto.id,
    nome: quarto.nome,
    genero_permitido: quarto.genero_permitido,
    capacidade: quarto.capacidade,
    camas,
    ocupados,
    disponiveis,
  }
}

export function MapaQuartosGrid({ mapa, generoFilter = 'todos', onAssign, onRelease }: MapaQuartosGridProps) {
  if (!mapa.local?.id) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border bg-surface-raised p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-text-tertiary">location_off</span>
        <p className="font-semibold text-foreground">Evento sem local vinculado</p>
        <p className="text-sm text-text-secondary">
          Para visualizar o mapa de acomodações, o evento precisa ter um local configurado.
        </p>
      </div>
    )
  }

  const quartosComContadores = mapa.quartos.map(derivarContadores)

  const quartosFiltrados =
    generoFilter === 'todos'
      ? quartosComContadores
      : quartosComContadores.filter((q) => q.genero_permitido === generoFilter)

  if (quartosFiltrados.length === 0) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border bg-surface-raised p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-text-tertiary">bed</span>
        <p className="font-semibold text-foreground">Nenhum quarto encontrado</p>
        <p className="text-sm text-text-secondary">
          {mapa.quartos.length === 0
            ? 'Adicione quartos na seção de estrutura para ver o mapa.'
            : 'Nenhum quarto corresponde ao filtro selecionado.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5" data-testid="mapa-quartos-grid">
      {quartosFiltrados.map((quarto) => (
        <QuartoCard
          key={quarto.id}
          quarto={quarto}
          onAssign={onAssign}
          onRelease={onRelease}
        />
      ))}
    </div>
  )
}
