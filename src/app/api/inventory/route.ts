import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PRODUCT_TABLES = new Set([
  'productos_ropa',
  'productos_zapatos',
  'productos_accesorios',
  'productos_perfumeria',
  'productos_electrodomesticos'
]);

function withPrecioFinal<T extends Record<string, any>>(table: string, payload: T) {
  if (!PRODUCT_TABLES.has(table)) return payload;

  const precio = Number(payload.precio) || 0;
  const impuesto = Number(payload.impuesto) || 0;
  const transporte = Number(payload.transporte) || 0;
  const precio_final = precio + (precio * impuesto / 100) + transporte;

  const formattedPayload = {
    ...payload,
    precio_final
  };

  if (table === 'productos_perfumeria') {
    const colorValue = payload.color;
    formattedPayload.color = Array.isArray(colorValue)
      ? colorValue
      : colorValue == null
        ? []
        : [colorValue];
  }

  return formattedPayload;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table = 'inventory_items', ...data } = body;
    const insertData = withPrecioFinal(table, data);
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, table = 'inventory_items', ...updates } = body;
    const updateData = withPrecioFinal(table, updates);
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const table = searchParams.get('table') || 'inventory_items';
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
