import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/rag'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false,
      persistSession: false } }
  )

  try {
    // Obtener todas las organizaciones activas
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')

    if (!orgs?.length) {
      return NextResponse.json({ success: true,
        message: 'Sin organizaciones' })
    }

    let totalIndexed = 0

    for (const org of orgs) {
      // Leer datos de todas las tablas
      const [
        { data: clients },
        { data: invoices },
        { data: projects },
        { data: finances },
        { data: leads },
        { data: pipeline },
        { data: appointments },
        { data: catalog }
      ] = await Promise.all([
        supabase.from('clients')
          .select('id, name, email, phone, status, company')
          .eq('organization_id', org.id),
        supabase.from('invoices')
          .select('id, invoice_number, concept, total, status, due_date')
          .eq('organization_id', org.id),
        supabase.from('projects')
          .select('id, name, status, budget, paid')
          .eq('organization_id', org.id),
        supabase.from('finance_entries')
          .select('id, type, concept, amount, month, year')
          .eq('organization_id', org.id).limit(50),
        supabase.from('leads')
          .select('id, nombre, temperatura, estado, email')
          .eq('organization_id', org.id),
        supabase.from('pipeline_deals')
          .select('id, nombre, valor_estimado, etapa')
          .eq('organization_id', org.id),
        supabase.from('appointments')
          .select('id, title, date, time, status')
          .eq('organization_id', org.id).limit(30),
        supabase.from('catalogo_items')
          .select('id, nombre, descripcion, precio')
          .eq('organization_id', org.id)
          .eq('activo', true)
      ])

      const records: Array<{
        table: string, id: string,
        content: string, metadata: any
      }> = []

      clients?.forEach(c => records.push({
        table: 'clients', id: c.id,
        content: `Cliente: ${c.name}. Email: ${c.email||''}. Estado: ${c.status}. Empresa: ${c.company||''}`,
        metadata: { name: c.name, status: c.status }
      }))
      invoices?.forEach(i => records.push({
        table: 'invoices', id: i.id,
        content: `Factura ${i.invoice_number}: ${i.concept}. Total: ${i.total}€. Estado: ${i.status}. Vence: ${i.due_date||'sin fecha'}`,
        metadata: { invoice_number: i.invoice_number, total: i.total, status: i.status }
      }))
      projects?.forEach(p => records.push({
        table: 'projects', id: p.id,
        content: `Proyecto: ${p.name}. Estado: ${p.status}. Presupuesto: ${p.budget}€. Cobrado: ${p.paid}€. Pendiente: ${parseFloat(p.budget||0)-parseFloat(p.paid||0)}€`,
        metadata: { name: p.name, status: p.status }
      }))
      finances?.forEach(f => records.push({
        table: 'finance_entries', id: f.id,
        content: `${f.type==='ingreso'?'Ingreso':'Gasto'}: ${f.concept}. Importe: ${f.amount}€. Mes: ${f.month}/${f.year}`,
        metadata: { type: f.type, amount: f.amount }
      }))
      leads?.forEach(l => records.push({
        table: 'leads', id: l.id,
        content: `Lead: ${l.nombre}. Temperatura: ${l.temperatura}. Estado: ${l.estado}. Email: ${l.email||''}`,
        metadata: { nombre: l.nombre, temperatura: l.temperatura }
      }))
      pipeline?.forEach(p => records.push({
        table: 'pipeline_deals', id: p.id,
        content: `Oportunidad: ${p.nombre}. Valor: ${p.valor_estimado}€. Etapa: ${p.etapa}`,
        metadata: { nombre: p.nombre, etapa: p.etapa }
      }))
      appointments?.forEach(a => records.push({
        table: 'appointments', id: a.id,
        content: `Cita: ${a.title}. Fecha: ${a.date} ${a.time||''}. Estado: ${a.status}`,
        metadata: { title: a.title, date: a.date }
      }))
      catalog?.forEach(c => records.push({
        table: 'catalogo_items', id: c.id,
        content: `Servicio: ${c.nombre}. Precio: ${c.precio}€. Descripción: ${c.descripcion||''}`,
        metadata: { nombre: c.nombre, precio: c.precio }
      }))

      // Indexar en batches
      for (const record of records) {
        try {
          const embedding = await generateEmbedding(
            record.content)
          await supabase.from('embeddings').upsert({
            organization_id: org.id,
            source_table: record.table,
            source_id: record.id,
            content: record.content,
            embedding,
            metadata: record.metadata,
            updated_at: new Date().toISOString()
          }, {
            onConflict:
              'organization_id,source_table,source_id'
          })
          totalIndexed++
        } catch (err) {
          console.error(
            `[RAG Cron] Error ${record.table}:`, err)
        }
      }

      console.log(
        `[RAG Cron] Org ${org.name}: ${records.length} registros`)
    }

    return NextResponse.json({
      success: true,
      totalIndexed,
      organizations: orgs.length
    })

  } catch (error: any) {
    console.error('[RAG Cron] Error:', error)
    return NextResponse.json(
      { error: error.message }, { status: 500 })
  }
}
