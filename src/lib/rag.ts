import { createClient } from '@supabase/supabase-js'

// Generar embedding con Hugging Face (gratuito)
export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
  
  if (!HF_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY no configurada')
  }

  const endpoint = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction'
  
  // Reintentar hasta 3 veces
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_API_KEY}`
        },
        body: JSON.stringify({
          inputs: text,
          normalize: true
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(
          `[RAG] HuggingFace error ${response.status}:`,
          errText.slice(0, 200))
        
        // Si el modelo está cargando esperar y reintentar
        if (response.status === 503) {
          console.log(`[RAG] Modelo cargando, esperando 5s...`)
          await new Promise(r => setTimeout(r, 5000))
          continue
        }
        throw new Error(
          `HuggingFace error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[RAG] Embedding tipo:', 
        typeof data, Array.isArray(data), 
        Array.isArray(data?.[0]))
      
      // HuggingFace puede devolver:
      // - array plano: [0.1, 0.2, ...]
      // - array anidado: [[0.1, 0.2, ...]]
      if (Array.isArray(data) && 
          Array.isArray(data[0])) {
        return data[0] as number[]
      }
      if (Array.isArray(data)) {
        return data as number[]
      }
      
      throw new Error(
        'Formato de embedding inesperado')

    } catch (err: any) {
      console.error(
        `[RAG] Intento ${attempt} fallido:`, 
        err.message)
      if (attempt === 3) throw err
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  
  throw new Error('generateEmbedding falló después de 3 intentos')
}

// Buscar datos relevantes en Supabase
export async function searchRelevant(
  query: string,
  organizationId: string,
  matchCount: number = 8
): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generar embedding de la pregunta
    const queryEmbedding = await generateEmbedding(query)

    // Buscar registros similares
    const { data, error } = await supabase.rpc(
      'search_embeddings',
      {
        query_embedding: queryEmbedding,
        org_id: organizationId,
        match_count: matchCount,
        min_similarity: 0.3
      }
    )

    if (error || !data?.length) {
      return ''
    }

    // Formatear resultados relevantes
    return data.map((r: any) =>
      `[${r.source_table}] ${r.content}`
    ).join('\n')

  } catch (err) {
    console.error('[RAG] Error buscando:', err)
    return ''
  }
}

// Indexar/actualizar embeddings de una organización
export async function indexOrganizationData(
  organizationId: string
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Leer todos los datos de la organización
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
    supabase.from('clients').select('id, name, email, phone, status, company, notes').eq('organization_id', organizationId),
    supabase.from('invoices').select('id, invoice_number, concept, total, status, due_date').eq('organization_id', organizationId),
    supabase.from('projects').select('id, name, status, budget, paid, notes').eq('organization_id', organizationId),
    supabase.from('finance_entries').select('id, type, concept, amount, month, year').eq('organization_id', organizationId).limit(50),
    supabase.from('leads').select('id, nombre, temperatura, estado, email, notas').eq('organization_id', organizationId),
    supabase.from('pipeline_deals').select('id, nombre, valor_estimado, etapa, prioridad').eq('organization_id', organizationId),
    supabase.from('appointments').select('id, title, date, time, status, notes').eq('organization_id', organizationId).limit(30),
    supabase.from('catalogo_items').select('id, nombre, descripcion, precio').eq('organization_id', organizationId).eq('activo', true)
  ])

  const records: Array<{
    table: string, id: string, content: string, metadata: any
  }> = []

  // Convertir cada registro a texto indexable
  clients?.forEach(c => records.push({
    table: 'clients', id: c.id,
    content: `Cliente: ${c.name}. Email: ${c.email||''}. Teléfono: ${c.phone||''}. Estado: ${c.status}. Empresa: ${c.company||''}. Notas: ${c.notes||''}`,
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
    content: `${f.type === 'ingreso' ? 'Ingreso' : 'Gasto'}: ${f.concept}. Importe: ${f.amount}€. Mes: ${f.month}/${f.year}`,
    metadata: { type: f.type, amount: f.amount }
  }))

  leads?.forEach(l => records.push({
    table: 'leads', id: l.id,
    content: `Lead: ${l.nombre}. Temperatura: ${l.temperatura}. Estado: ${l.estado}. Email: ${l.email||''}. Notas: ${l.notas||''}`,
    metadata: { nombre: l.nombre, temperatura: l.temperatura }
  }))

  pipeline?.forEach(p => records.push({
    table: 'pipeline_deals', id: p.id,
    content: `Oportunidad: ${p.nombre}. Valor: ${p.valor_estimado}€. Etapa: ${p.etapa}. Prioridad: ${p.prioridad||''}`,
    metadata: { nombre: p.nombre, etapa: p.etapa }
  }))

  appointments?.forEach(a => records.push({
    table: 'appointments', id: a.id,
    content: `Cita: ${a.title}. Fecha: ${a.date} ${a.time||''}. Estado: ${a.status}. Notas: ${a.notes||''}`,
    metadata: { title: a.title, date: a.date, status: a.status }
  }))

  catalog?.forEach(c => records.push({
    table: 'catalogo_items', id: c.id,
    content: `Servicio: ${c.nombre}. Precio: ${c.precio}€. Descripción: ${c.descripcion||''}`,
    metadata: { nombre: c.nombre, precio: c.precio }
  }))

  // Generar e insertar embeddings en batches de 10
  const batchSize = 10
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    for (const record of batch) {
      try {
        const embedding = await generateEmbedding(record.content)
        
        await supabase.from('embeddings').upsert({
          organization_id: organizationId,
          source_table: record.table,
          source_id: record.id,
          content: record.content,
          embedding,
          metadata: record.metadata,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,source_table,source_id'
        })
      } catch (err) {
        console.error(`[RAG] Error indexando ${record.table}:`, err)
      }
    }
    // Pausa entre batches para no saturar HuggingFace
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`[RAG] Indexados ${records.length} registros para org ${organizationId}`)
}

// Reindexar un registro específico
// cuando se crea o actualiza
export async function indexSingleRecord(
  organizationId: string,
  table: string,
  id: string,
  content: string,
  metadata: any = {}
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false,
        persistSession: false } }
    )
    const embedding = await generateEmbedding(content)
    await supabase.from('embeddings').upsert({
      organization_id: organizationId,
      source_table: table,
      source_id: id,
      content,
      embedding,
      metadata,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'organization_id,source_table,source_id'
    })
    console.log(`[RAG] Indexado: ${table}/${id}`)
  } catch (err) {
    // No bloquear el flujo principal si falla
    console.error('[RAG] Error indexando registro:', err)
  }
}
