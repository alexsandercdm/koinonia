import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { MapaAcomodacaoResponse } from '../../hooks/use-acomodacoes'

export interface ExportOptions {
  mapa: MapaAcomodacaoResponse
  eventoNome: string
  localNome?: string
  containerEl: HTMLElement
}

/**
 * Captures the printable map subtree and generates an offline-readable A4 PDF.
 *
 * Legend: Disponivel (green) | Ocupado (blue) | Bloqueado (red)
 * Filename: `${eventoNome}-mapa-acomodacao.pdf`
 */
export async function exportMapaAcomodacao(options: ExportOptions): Promise<void> {
  const { mapa, eventoNome, localNome, containerEl } = options

  // Capture only the printable subtree (excludes interactive controls)
  const canvas = await html2canvas(containerEl, {
    scale: 2,
    useCORS: true,
    logging: false,
    // Hide interactive controls (.no-print) during capture
    onclone: (document) => {
      document.querySelectorAll('.no-print').forEach((el) => {
        ;(el as HTMLElement).style.display = 'none'
      })
    },
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 12

  // --- Header ---
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Mapa de Acomodações', margin, 18)

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Evento: ${eventoNome}`, margin, 26)
  if (localNome) {
    pdf.text(`Local: ${localNome}`, margin, 32)
  }

  const exportDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  pdf.setFontSize(9)
  pdf.setTextColor(120, 120, 120)
  pdf.text(`Exportado em: ${exportDate}`, margin, localNome ? 38 : 32)

  // --- Room summary (text grouping) ---
  let yPos = localNome ? 46 : 40
  pdf.setFontSize(10)
  pdf.setTextColor(60, 60, 60)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Resumo por quarto:', margin, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  for (const quarto of mapa.quartos) {
    const line = `${quarto.nome} — ${quarto.ocupados} ocupado(s) / ${quarto.disponiveis} disponivel(s) / Cap. ${quarto.capacidade}`
    pdf.text(line, margin, yPos)
    yPos += 5
    if (yPos > pageHeight - 60) {
      pdf.addPage()
      yPos = 18
    }
  }

  // --- Legend ---
  yPos += 4
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)
  pdf.text('Legenda de status:', margin, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  // Disponivel
  pdf.setFillColor(220, 252, 231)
  pdf.rect(margin, yPos - 3.5, 5, 5, 'F')
  pdf.setTextColor(22, 101, 52)
  pdf.text('Disponivel', margin + 7, yPos)

  // Ocupado
  pdf.setFillColor(219, 234, 254)
  pdf.rect(margin + 35, yPos - 3.5, 5, 5, 'F')
  pdf.setTextColor(30, 64, 175)
  pdf.text('Ocupado', margin + 42, yPos)

  // Bloqueado
  pdf.setFillColor(254, 226, 226)
  pdf.rect(margin + 70, yPos - 3.5, 5, 5, 'F')
  pdf.setTextColor(153, 27, 27)
  pdf.text('Bloqueado', margin + 77, yPos)

  yPos += 10

  // --- Map image ---
  pdf.setTextColor(0, 0, 0)
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height / canvas.width) * imgWidth

  if (yPos + imgHeight > pageHeight - margin) {
    pdf.addPage()
    yPos = margin
  }

  pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)

  // Sanitize filename
  const safeNome = eventoNome.replace(/[^a-zA-Z0-9\-_\u00C0-\u017E ]/g, '').trim().replace(/\s+/g, '-')
  pdf.save(`${safeNome}-mapa-acomodacao.pdf`)
}
