import { getSupabaseAdmin } from '../lib/supabase';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getAgentCount() {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  return count || 0;
}

export default async function DashboardHome() {
  const agentCount = await getAgentCount();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your voice agent operations.</p>
        </div>
        <Link href="/agents" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
          <Plus size={16} /> Create Agent
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Agents" value={agentCount} />
        <MetricCard label="Total Calls" value="—" note="Call tracking coming soon" />
        <MetricCard label="Call Minutes" value="—" note="Call tracking coming soon" />
        <MetricCard label="Appointments" value="—" note="Coming soon" />
      </div>

      <div className="mt-10 rounded-xl border border-border bg-panel p-8 text-center">
        <p className="text-sm text-muted">
          Call logs, campaign analytics and usage tracking will appear here once phone numbers and call routing are connected.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
