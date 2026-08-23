import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export async function DELETE(request, { params }) {
  const { id } = params;
  const supabase = getSupabaseAdmin();

  await supabase.from('campaign_contacts').delete().eq('campaign_id', id);
  const { error } = await supabase.from('campaigns').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
