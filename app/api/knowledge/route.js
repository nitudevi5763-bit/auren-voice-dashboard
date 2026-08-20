import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('*, agent_knowledge(agent_id)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sources: data });
}

export async function POST(request) {
  const body = await request.json();
  const { name, type, content, agent_ids } = body;

  if (!name || !content) return NextResponse.json({ error: 'Name aur content required hai' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('knowledge_sources')
    .insert([{ name, type: type || 'text', content, status: 'active' }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const source = data[0];

  if (agent_ids && agent_ids.length > 0) {
    const links = agent_ids.map((agentId) => ({ agent_id: agentId, knowledge_source_id: source.id }));
    await supabase.from('agent_knowledge').insert(links);
  }

  return NextResponse.json({ source }, { status: 201 });
}
