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
  M: 'text-status-info',
  F: 'text-status-warning',
  MISTO: 'text-warm-gold',
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

function derivarContadores(quarto: MapaAcomodacao['quartos'][number]): QuartoMapaComContadores {
  const camas = quarto.camas as unknown as CamaMapaItem[]
  const ocupados = camas.filter((c) => c.ocupante !== null).length
  const disponiveis = camas.filter((c) => !c.bloqueada && c.ocupante === null).length
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

interface OcupacaoHeaderProps {
  quartos: QuartoMapaComContadores[]
}

function OcupacaoHeader({ quartos }: OcupacaoHeaderProps) {
  const totalCamas = quartos.reduce((acc, q) => acc + q.camas.filter((c) => !c.bloqueada).length, 0)
  const totalOcupados = quartos.reduce((acc, q) => acc + q.ocupados, 0)
  const totalDisponiveis = Math.max(0, totalCamas - totalOcupados)
  const percentual = totalCamas > 0 ? Math.round((totalOcupados / totalCamas) * 100) : 0
  const quartosF = quartos.filter((q) => q.genero_permitido === 'F').length
  const quartosM = quartos.filter((q) => q.genero_permitido === 'M').length

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[240px] rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Ocupação geral</span>
          <span>{totalOcupados} / {totalCamas}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-pill bg-muted">
          <div
            className="h-full rounded-pill bg-warm-gold transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-text-tertiary">
          {totalDisponiveis} vagas disponíveis &middot; {percentual}%
        </p>
      </div>

      {quartosF > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-status-warning-bg text-lg text-status-warning">
            ♀
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{quartosF}</p>
            <p className="text-xs text-text-secondary">Quartos femininos</p>
          </div>
        </div>
      )}

      {quartosM > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-status-info-bg text-lg text-status-info">
            ♂
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{quartosM}</p>
            <p className="text-xs text-text-secondary">Quartos masculinos</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface QuartoCardProps {
  quarto: QuartoMapaComContadores
  onAssign?: (cama: CamaMapaItem) => void
  onRelease?: (cama: CamaMapaItem) => void
}

function QuartoCard({ quarto, onAssign, onRelease }: QuartoCardProps) {
  const borderColor = generoBorderColor[quarto.genero_permitido] ?? 'border-l-warm-gold'
  const tagColor = generoTagStyle[quarto.genero_permitido] ?? 'text-warm-gold'

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border border-l-4 bg-card ${borderColor}`}
      data-quarto-id={quarto.id}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{quarto.nome}</h3>
          <p className={`mt-0.5 text-xs font-medium ${tagColor}`}>
            {quarto.genero_permitido === 'F' ? '♀' : quarto.genero_permitido === 'M' ? '♂' : '⊕'}{' '}
            {generoLabel[quarto.genero_permitido]}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {quarto.ocupados}/{quarto.capacidade}
        </span>
      </div>

      <div className="space-y-2 px-5 pb-4">
        {quarto.camas.length === 0 ? (
          <p className="text-sm italic text-text-tertiary">Sem camas cadastradas</p>
        ) : (
          quarto.camas.map((cama) => (
            <CamaCard
              key={cama.id}
              cama={cama}
              quartoGenero={quarto.genero_permitido}
              onAssign={onAssign}
              onRelease={onRelease}
            />
          ))
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

export function MapaQuartosGrid({ mapa, generoFilter = 'todos', onAssign, onRelease }: MapaQuartosGridProps) {
  if (!mapa.local?.id) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border bg-surface-raised p-12 text-center">
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
    <div className="space-y-6">
      <OcupacaoHeader quartos={quartosComContadores} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3" data-testid="mapa-quartos-grid">
        {quartosFiltrados.map((quarto) => (
          <QuartoCard
            key={quarto.id}
            quarto={quarto}
            onAssign={onAssign}
            onRelease={onRelease}
          />
        ))}
      </div>
    </div>
  )
}
