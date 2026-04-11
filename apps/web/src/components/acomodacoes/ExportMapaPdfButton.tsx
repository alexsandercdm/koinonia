import { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { exportMapaAcomodacao } from '../../lib/pdf/exportMapaAcomodacao'
import type { MapaAcomodacaoResponse } from '../../hooks/use-acomodacoes'

interface ExportMapaPdfButtonProps {
  mapa: MapaAcomodacaoResponse
  eventoNome: string
  localNome?: string
}

export function ExportMapaPdfButton({ mapa, eventoNome, localNome }: ExportMapaPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  async function handleExport() {
    if (!containerRef.current) return
    setIsExporting(true)
    setError(null)
    try {
      await exportMapaAcomodacao({
        mapa,
        eventoNome,
        localNome,
        containerEl: containerRef.current,
      })
    } catch {
      setError('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      {error && (
        <p className="text-xs text-red-600 mb-1 text-right">{error}</p>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-10 no-print"
        onClick={handleExport}
        disabled={isExporting}
        data-testid="export-pdf-button"
        aria-label="Exportar mapa em PDF"
      >
        {isExporting ? (
          <>
            <span className="animate-spin inline-block h-4 w-4 border-b-2 border-gray-600 rounded-full mr-2" />
            Gerando PDF...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Exportar PDF
          </>
        )}
      </Button>

      {/* Off-screen printable map capture target — hidden from normal view */}
      <div
        ref={containerRef}
        className="absolute -left-[9999px] top-0 w-[900px] bg-white p-6 space-y-4"
        aria-hidden="true"
      >
        {mapa.quartos.map((quarto) => (
          <div key={quarto.id} className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{quarto.nome}</h2>
            <p className="text-xs text-gray-500 mb-2">
              {quarto.ocupados} ocupado(s) / {quarto.disponiveis} disponivel(s) / Cap.{' '}
              {quarto.capacidade}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {quarto.camas.map((cama) => {
                const status = cama.bloqueada
                  ? 'Bloqueado'
                  : cama.ocupante
                    ? 'Ocupado'
                    : 'Disponivel'
                const bgColor =
                  status === 'Disponivel'
                    ? '#dcfce7'
                    : status === 'Ocupado'
                      ? '#dbeafe'
                      : '#fee2e2'
                const textColor =
                  status === 'Disponivel'
                    ? '#166534'
                    : status === 'Ocupado'
                      ? '#1e3a8a'
                      : '#991b1b'
                return (
                  <div
                    key={cama.id}
                    style={{ backgroundColor: bgColor, color: textColor }}
                    className="rounded border p-2 text-xs"
                  >
                    <div className="font-semibold">{cama.identificacao}</div>
                    <div className="opacity-80">{status}</div>
                    {cama.ocupante && (
                      <div className="truncate text-xs mt-0.5">{cama.ocupante}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
