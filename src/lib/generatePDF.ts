import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { buildFinanceContext } from '@/lib/financeContext'
import { createClient } from '@/lib/supabase/client'

const PRIMARY: [number, number, number] = [27, 79, 216]
const DARK: [number, number, number] = [10, 22, 40]
const SLATE: [number, number, number] = [71, 85, 105]
const LIGHT: [number, number, number] = [248, 250, 252]

export const generateFinanceReport = async (
  entries: any[],
  selectedMonth: number,
  year: number,
  organizationName?: string
) => {
  console.log('generateFinanceReport iniciado con', entries.length, 'entradas')
  console.log('organizationName recibido:', organizationName)
  
  let orgName = organizationName
  if (!orgName) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('organizations(name)')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .maybeSingle()
      orgName = (member?.organizations as any)?.name || 'SF Gestor'
    }
  }
  console.log('orgName final:', orgName)
  
  const financeData = buildFinanceContext(entries, selectedMonth, year)
  console.log('financeData:', financeData)
  console.log('entries recibidos:', entries.length)
  if (!financeData) throw new Error('Sin datos financieros')

  let doc: jsPDF
  try {
    doc = new jsPDF()
    console.log('jsPDF creado OK')
  } catch (e) {
    console.error('Error en jsPDF:', e)
    throw e
  }

  // ────────────────────────────────────────────
  // PORTADA
  // ────────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 45, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text(orgName || 'SF Gestor', 20, 22)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Informe Financiero Mensual', 20, 32)

  doc.setTextColor(...DARK)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${financeData.mesSeleccionado} ${financeData.año}`, 20, 57)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...SLATE)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 67)

  doc.setDrawColor(...PRIMARY)
  doc.setLineWidth(0.5)
  doc.line(20, 73, 190, 73)

  // ────────────────────────────────────────────
  // SECCION 1 — RESUMEN EJECUTIVO
  // ────────────────────────────────────────────
  console.log('Sección 1: Resumen Ejecutivo OK')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('1. Resumen Ejecutivo', 20, 87)

  const balance = parseFloat(financeData.balanceMes)
  const esPositivo = balance >= 0

  console.log('Antes de autoTable Sección 1')
  autoTable(doc, {
    startY: 92,
    head: [['Concepto', 'Importe', 'Estado']],
    body: [
      ['Ingresos totales', `${Number(financeData.ingresosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'INGRESOS'],
      ['Gastos totales', `${Number(financeData.gastosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'GASTOS'],
      ['Balance neto', `${Number(financeData.balanceMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, esPositivo ? 'POSITIVO' : 'NEGATIVO']
    ],
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      2: { textColor: esPositivo ? [16, 185, 129] : [239, 68, 68], fontStyle: 'bold' }
    }
  })

  // ────────────────────────────────────────────
  // SECCION 2 — DESGLOSE DE TRANSACCIONES
  // ────────────────────────────────────────────
  console.log('Sección 2: Desglose de Transacciones OK')
  let finalY = (doc as any).lastAutoTable.finalY + 12

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('2. Desglose de Transacciones', 20, finalY)

  console.log('desgloseMes raw:', (financeData as any).desgloseMes)
  console.log('todosLosGastos raw:', (financeData as any).todosLosGastos)
  const desgloseData = (financeData as any).desgloseMes?.length 
    ? (financeData as any).desgloseMes 
    : (financeData as any).todosLosGastos || []
  
  const rows = desgloseData.map((g: string) => {
    if (!g || typeof g !== 'string') return ['Sin datos', '-']
    const idx = g.lastIndexOf(': ')
    if (idx === -1) return [g, '-']
    const concepto = g.substring(0, idx).trim()
    const importe = g.substring(idx + 2).trim()
    return [concepto || 'Sin concepto', importe || '-']
  })

  console.log('Antes de autoTable Sección 2')
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Concepto', 'Importe']],
    body: rows.length > 0 ? rows : [['Sin transacciones registradas', '-']],
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT }
  })

  // ────────────────────────────────────────────
  // SECCION 3 — COMPARATIVA MES ANTERIOR
  // ────────────────────────────────────────────
  console.log('Sección 3: Comparativa OK')
  finalY = (doc as any).lastAutoTable.finalY + 12
  if (finalY > 240) { doc.addPage(); finalY = 20 }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('3. Comparativa con Mes Anterior', 20, finalY)

  const ingActual = parseFloat(financeData.ingresosMes)
  const ingAnterior = parseFloat(financeData.ingresosMesAnterior || '0')
  const gasActual = parseFloat(financeData.gastosMes)
  const gasAnterior = parseFloat(financeData.gastosMesAnterior || '0')
  const balAnterior = ingAnterior - gasAnterior

  const varPct = (curr: number, prev: number) => {
    if (prev === 0 && curr === 0) return 'Sin cambio'
    if (prev === 0) return `+${fmtEur(curr)} (nuevo)`
    return `${((curr - prev) / Math.abs(prev) * 100).toFixed(1)}%`
  }

  const fmtEur = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`

  console.log('Antes de autoTable Sección 3')
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Concepto', 'Mes Anterior', 'Mes Actual', 'Variacion']],
    body: [
      ['Ingresos', fmtEur(ingAnterior), fmtEur(ingActual), varPct(ingActual, ingAnterior)],
      ['Gastos', fmtEur(gasAnterior), fmtEur(gasActual), varPct(gasActual, gasAnterior)],
      ['Balance', fmtEur(balAnterior), fmtEur(balance), varPct(balance, balAnterior)]
    ],
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT }
  })

  // ────────────────────────────────────────────
  // SECCION 4 — ANALISIS IA
  // ────────────────────────────────────────────
  console.log('Sección 4: Análisis IA OK')
  finalY = (doc as any).lastAutoTable.finalY + 12
  if (finalY > 220) { doc.addPage(); finalY = 20 }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('4. Observaciones y Recomendaciones', 20, finalY)

  let analisis = 'Analisis no disponible.'
  try {
    console.log('Llamando a /api/ai-groq...')
    const res = await fetch('/api/ai-groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: 'pdf_analysis',
        systemPrompt: `Eres un auditor financiero profesional.`,
        message: `Actúa como contable profesional de ${orgName}.
Escribe un análisis financiero formal de ${financeData.mesSeleccionado} ${financeData.año}.
Datos: Ingresos ${financeData.ingresosMes}€, Gastos ${financeData.gastosMes}€, Balance ${financeData.balanceMes}€.
Transacciones: ${(desgloseData || []).join(' | ')}
Escribe 3 párrafos cortos como análisis contable profesional.
NO menciones IA, inteligencia artificial ni tecnología.
NO uses "Observación X:". Solo texto natural profesional.
Sin asteriscos. Sin markdown. En español formal.`
      })
    })
    console.log('Respuesta de /api/ai-groq recibida')
    const data = await res.json()
    const reply = data?.response
    console.log('Reply extraído:', reply ? 'OK' : 'null')
    if (reply) {
      // Limpiar caracteres especiales que pueden corromper el PDF
      analisis = reply
        .replace(/[↑↓→←✓✗✔✘•]/g, '-')
        .replace(/[^\x00-\x7E\u00C0-\u024F\u00A0-\u00FF]/g, ' ')
    }
  } catch { 
    console.error('Error en análisis IA (silencioso)') 
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...SLATE)
  const lines = doc.splitTextToSize(analisis, 170)
  doc.text(lines, 20, finalY + 10)

  // ────────────────────────────────────────────
  // FOOTER EN TODAS LAS PÁGINAS
  // ────────────────────────────────────────────
  console.log('Footer: Generando footer')
  const pageCount = doc.getNumberOfPages()
  const today = new Date().toLocaleDateString('es-ES')
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Información generada por ${orgName || 'SF'} | Generado el ${today} | Pagina ${i} de ${pageCount}`,
      20, 287
    )
  }

  console.log('Guardando PDF...')
  doc.save(`Informe_SF_${financeData.mesSeleccionado}_${financeData.año}.pdf`)
  console.log('PDF guardado exitosamente')
}
