import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export async function DELETE(request, { params }) {
  const { id } = params;
  const supabase = getSupabaseAdmin();

  await supabase.from('agent_tools').delete().eq('tool_id', id);
  const { error } = await supabase.from('tools').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
