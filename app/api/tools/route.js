import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('tools')
    .select('*, agent_tools(agent_id)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tools: data });
}

export async function POST(request) {
  const body = await request.json();
  const { name, type, config, agent_ids } = body;

  if (!name || !type) return NextResponse.json({ error: 'Name aur type required hai' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('tools')
    .insert([{ name, type, config: config || {}, status: 'active' }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tool = data[0];

  if (agent_ids && agent_ids.length > 0) {
    const links = agent_ids.map((agentId) => ({ agent_id: agentId, tool_id: tool.id }));
    await supabase.from('agent_tools').insert(links);
  }

  return NextResponse.json({ tool }, { status: 201 });
}
