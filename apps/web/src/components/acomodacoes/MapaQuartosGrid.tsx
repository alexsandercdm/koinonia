import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CamaCard } from './CamaCard'
import type { MapaAcomodacao } from '@koinonia/shared'
import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

const generoLabel: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  MISTO: 'Misto',
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
  return (
    <Card className="overflow-hidden" data-quarto-id={quarto.id}>
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{quarto.nome}</CardTitle>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full shrink-0">
            {generoLabel[quarto.genero_permitido] ?? quarto.genero_permitido}
          </span>
        </div>
        <div className="flex gap-3 text-xs text-gray-500 mt-1">
          <span>{quarto.ocupados} ocupado(s)</span>
          <span>{quarto.disponiveis} disponivel(s)</span>
          <span>Cap. {quarto.capacidade}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {quarto.camas.length === 0 ? (
          <p className="text-sm text-gray-400 py-2 text-center">Sem camas cadastradas</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
      </CardContent>
    </Card>
  )
}

interface MapaQuartosGridProps {
  mapa: MapaAcomodacao
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

export function MapaQuartosGrid({ mapa, onAssign, onRelease }: MapaQuartosGridProps) {
  if (!mapa.local?.id) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center space-y-2">
        <p className="text-gray-500 font-medium">Evento sem local vinculado</p>
        <p className="text-sm text-gray-400">
          Para visualizar o mapa de acomodações, o evento precisa ter um local configurado.
        </p>
      </div>
    )
  }

  if (mapa.quartos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center space-y-2">
        <p className="text-gray-500 font-medium">Nenhum quarto cadastrado</p>
        <p className="text-sm text-gray-400">
          Adicione quartos na seção de estrutura acima para ver o mapa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="mapa-quartos-grid">
      {mapa.quartos.map((quarto) => {
        const quartoComContadores = derivarContadores(quarto)
        return (
          <QuartoCard
            key={quarto.id}
            quarto={quartoComContadores}
            onAssign={onAssign}
            onRelease={onRelease}
          />
        )
      })}
    </div>
  )
}
