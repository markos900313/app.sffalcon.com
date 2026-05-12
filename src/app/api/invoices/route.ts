import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { indexSingleRecord } from '@/lib/rag'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Ensure user has access
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let query = supabase
      .from('invoices')
      .select(`
        *,
        clients ( id, name, email ),
        projects ( id, name )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query

    if (error) throw error

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { client_id, project_id, concept, base_amount, tax_rate = 21, issue_date, due_date, notes } = body

    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    // Get organization info
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', member.organization_id)
      .single();

    // Generate Invoice Number
    const orgPrefix = org?.name
      ? org.name.replace(/\s+/g, '').substring(0, 3).toUpperCase()
      : 'SF';

    const year = new Date().getFullYear();
    const prefix = `${orgPrefix}-${year}-`;
    
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .like('invoice_number', `%${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoice_number) {
      const parts = lastInvoice.invoice_number.split('-');
      if (parts.length >= 3) {
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
    }
    const invoice_number = `${prefix}${String(nextNum).padStart(3, '0')}`;

    // Calculate amounts
    const tax_amount = (base_amount * tax_rate) / 100;
    const total_amount = base_amount + tax_amount;

    const newInvoice = {
      invoice_number,
      organization_id: member.organization_id,
      client_id,
      project_id: project_id || null, // project is optional in some cases
      concept,
      amount: Number(base_amount),
      tax_rate: Number(tax_rate),
      tax_amount: Number(tax_amount),
      total: Number(total_amount),
      issue_date,
      due_date,
      notes,
      status: 'pendiente', // default status
      user_id: user.id // Relate back to user
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(newInvoice)
      .select()
      .single()

    if (error) throw error

    // Reindexar en background
    indexSingleRecord(
      member.organization_id,
      'invoices',
      data.id,
      `Factura ${data.invoice_number}: ${data.concept}. Total: ${data.total}€. Estado: ${data.status}`,
      { invoice_number: data.invoice_number, total: data.total }
    ).catch(err => console.error('[RAG] Error auto-indexando factura:', err))

    return NextResponse.json({ invoice: data })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { id, status, paid_date, base_amount, ...restFields } = body
    
    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    // Obtener organization_id del usuario
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Construir payload con columnas correctas
    const updates: any = { ...restFields }
    
    if (status) updates.status = status
    if (status === 'pagada' && !paid_date) {
      updates.paid_date = new Date().toISOString()
    } else if (paid_date !== undefined) {
      updates.paid_date = paid_date
    }

    // Mapear base_amount → amount y recalcular
    if (base_amount !== undefined) {
      updates.amount = Number(base_amount)
      const rate = updates.tax_rate !== undefined ? Number(updates.tax_rate) : 21
      updates.tax_amount = (updates.amount * rate) / 100
      updates.total = updates.amount + updates.tax_amount
    }

    // Limpiar campos que no existen en la tabla
    delete updates.base_amount
    delete updates.clients
    delete updates.projects

    // Convertir strings vacíos a null
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') updates[key] = null;
    });

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    // Reindexar en background
    indexSingleRecord(
      member.organization_id,
      'invoices',
      data.id,
      `Factura ${data.invoice_number}: ${data.concept}. Total: ${data.total}€. Estado: ${data.status}`,
      { invoice_number: data.invoice_number, total: data.total }
    ).catch(err => console.error('[RAG] Error auto-indexando factura:', err))

    return NextResponse.json({ invoice: data })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 })
  }
}
