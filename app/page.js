import { getSupabaseAdmin } from '../lib/supabase';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getDashboardStats() {
  const supabase = getSupabaseAdmin();
  const [{ count: agentCount }, { data: calls }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('calls').select('duration_seconds, status'),
  ]);

  const totalCalls = calls?.length || 0;
  const totalSeconds = (calls || []).reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
  const totalMinutes = (totalSeconds / 60).toFixed(1);
  const completed = (calls || []).filter((c) => c.status === 'completed').length;
  const completionRate = totalCalls > 0 ? Math.round((completed / totalCalls) * 100) : 0;

  return { agentCount: agentCount || 0, totalCalls, totalMinutes, completionRate };
}

export default async function DashboardHome() {
  const stats = await getDashboardStats();

  return (
    <div className="relative">
      <div className="glow-blob h-64 w-64 bg-accent" style={{ top: '-40px', left: '20%' }} />
      <div className="glow-blob h-64 w-64 bg-accent2" style={{ top: '20px', right: '10%' }} />

      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your voice agent operations.</p>
        </div>
        <Link href="/agents" className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Create Agent
        </Link>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Agents" value={stats.agentCount} />
        <MetricCard label="Total Calls" value={stats.totalCalls} />
        <MetricCard label="Call Minutes" value={stats.totalMinutes} />
        <MetricCard label="Completion Rate" value={`${stats.completionRate}%`} />
      </div>

      <div className="relative mt-10 rounded-xl border border-border bg-panel p-8 text-center">
        <p className="text-sm text-muted">
          Head to <Link href="/analytics" className="text-accent hover:underline">Analytics</Link> for call trends, or{' '}
          <Link href="/settings" className="text-accent hover:underline">Settings</Link> for usage &amp; billing.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card-hover rounded-xl border border-border bg-panel p-5 hover:border-accent/40">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
