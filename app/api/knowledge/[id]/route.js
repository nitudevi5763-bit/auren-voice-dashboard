import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export async function PATCH(request, { params }) {
  const body = await request.json();
  const { agent_ids, ...fields } = body;
  const supabase = getSupabaseAdmin();

  if (Object.keys(fields).length > 0) {
    await supabase.from('knowledge_sources').update(fields).eq('id', params.id);
  }

  if (agent_ids !== undefined) {
    await supabase.from('agent_knowledge').delete().eq('knowledge_source_id', params.id);
    if (agent_ids.length > 0) {
      const links = agent_ids.map((agentId) => ({ agent_id: agentId, knowledge_source_id: params.id }));
      await supabase.from('agent_knowledge').insert(links);
    }
  }

  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('*, agent_knowledge(agent_id)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data });
}

export async function DELETE(request, { params }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('knowledge_sources').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
