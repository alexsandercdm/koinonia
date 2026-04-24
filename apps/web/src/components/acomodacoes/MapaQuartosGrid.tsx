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
  M: 'border-l-blue-500',
  F: 'border-l-pink-500',
  MISTO: 'border-l-purple-500',
}

const generoTagStyle: Record<string, string> = {
  M: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  F: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  MISTO: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
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
  const borderColor = generoBorderColor[quarto.genero_permitido] ?? 'border-l-primary'
  const tagStyle = generoTagStyle[quarto.genero_permitido] ?? 'bg-primary/20 text-primary border border-primary/30'

  return (
    <div
      className={`bg-surface-dark border-l-4 ${borderColor} rounded-xl overflow-hidden flex flex-col shadow-xl border border-border-dark`}
      data-quarto-id={quarto.id}
    >
      {/* Card header */}
      <div className="p-5 border-b border-border-dark">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white leading-tight">{quarto.nome}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tagStyle}`}>
                {generoLabel[quarto.genero_permitido] ?? quarto.genero_permitido}
              </span>
            </div>
          </div>
          <div className="bg-background-dark/80 px-3 py-1 rounded-full border border-white/10 shrink-0">
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {quarto.ocupados} / {quarto.capacidade} Ocupadas
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-400 mt-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {quarto.disponiveis} disponível(is)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            {quarto.ocupados} ocupada(s)
          </span>
        </div>
      </div>

      {/* Beds grid */}
      <div className="p-5">
        {quarto.camas.length === 0 ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-slate-600 text-3xl">hotel</span>
            <p className="text-slate-500 text-sm mt-1 italic">Sem camas cadastradas</p>
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
      <div className="rounded-xl border border-dashed border-border-dark p-12 text-center space-y-2">
        <span className="material-symbols-outlined text-4xl text-slate-600">location_off</span>
        <p className="text-slate-300 font-medium">Evento sem local vinculado</p>
        <p className="text-sm text-slate-500">
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
      <div className="rounded-xl border border-dashed border-border-dark p-12 text-center space-y-2">
        <span className="material-symbols-outlined text-4xl text-slate-600">bed</span>
        <p className="text-slate-300 font-medium">Nenhum quarto encontrado</p>
        <p className="text-sm text-slate-500">
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
