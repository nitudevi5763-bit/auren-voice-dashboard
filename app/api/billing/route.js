import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: settingsRows, error: settingsError } = await supabase
    .from('billing_settings')
    .select('*')
    .limit(1);

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });
  const settings = settingsRows[0] || { cost_per_minute: 0, currency: 'INR' };

  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('duration_seconds, clients(business_name)');

  if (callsError) return NextResponse.json({ error: callsError.message }, { status: 500 });

  const totalSeconds = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
  const totalMinutes = totalSeconds / 60;
  const totalCost = totalMinutes * (settings.cost_per_minute || 0);

  const agentMap = {};
  calls.forEach((c) => {
    const name = c.clients?.business_name || 'Unknown';
    if (!agentMap[name]) agentMap[name] = { name, calls: 0, seconds: 0 };
    agentMap[name].calls += 1;
    agentMap[name].seconds += c.duration_seconds || 0;
  });
  const byAgent = Object.values(agentMap)
    .map((a) => ({
      name: a.name,
      calls: a.calls,
      minutes: a.seconds / 60,
      cost: (a.seconds / 60) * (settings.cost_per_minute || 0),
    }))
    .sort((a, b) => b.calls - a.calls);

  return NextResponse.json({
    settings,
    totalCalls: calls.length,
    totalMinutes,
    totalCost,
    byAgent,
  });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, cost_per_minute } = body;

  if (!id || cost_per_minute === undefined) {
    return NextResponse.json({ error: 'id aur cost_per_minute required hain' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('billing_settings')
    .update({ cost_per_minute, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data[0] });
}
