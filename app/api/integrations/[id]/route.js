import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { status, notes } = body;

  const supabase = getSupabaseAdmin();
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const { data, error } = await supabase
    .from('integrations')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integration: data[0] });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('integrations').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
