import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data: calls, error } = await supabase
    .from('calls')
    .select('*, clients(business_name)')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalCalls = calls.length;
  const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const completionRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  const dayMap = {};
  calls.forEach((c) => {
    const day = new Date(c.created_at).toISOString().slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const callsByDay = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date, count }));

  const agentMap = {};
  calls.forEach((c) => {
    const name = c.clients?.business_name || 'Unknown';
    if (!agentMap[name]) agentMap[name] = { name, calls: 0, totalDuration: 0 };
    agentMap[name].calls += 1;
    agentMap[name].totalDuration += c.duration_seconds || 0;
  });
  const callsByAgent = Object.values(agentMap)
    .map((a) => ({ name: a.name, calls: a.calls, avgDuration: Math.round(a.totalDuration / a.calls) }))
    .sort((a, b) => b.calls - a.calls);

  const directionMap = {};
  calls.forEach((c) => {
    const d = c.direction || 'unknown';
    directionMap[d] = (directionMap[d] || 0) + 1;
  });
  const byDirection = Object.entries(directionMap).map(([direction, count]) => ({ direction, count }));

  return NextResponse.json({ totalCalls, avgDuration, completionRate, callsByDay, callsByAgent, byDirection });
}
