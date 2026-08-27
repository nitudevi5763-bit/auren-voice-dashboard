'use client';
import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Phone, Clock, TrendingUp } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import Select from '../../components/Select';

function formatMinutes(totalSeconds) {
  const mins = totalSeconds / 60;
  return mins < 10 ? mins.toFixed(1) : Math.round(mins);
}

export default function AnalyticsPage() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    async function load() {
      const [agentsRes, callsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/calls'),
      ]);
      const agentsData = await agentsRes.json();
      const callsData = await callsRes.json();
      setAgents(agentsData.clients || []);
      setCalls(callsData.calls || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredCalls = useMemo(() => {
    if (selectedAgent === 'all') return calls;
    return calls.filter((c) => c.client_id === selectedAgent);
  }, [calls, selectedAgent]);

  const totalCalls = filteredCalls.length;
  const totalSeconds = filteredCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
  const avgSeconds = totalCalls ? totalSeconds / totalCalls : 0;

  const perAgentStats = useMemo(() => {
    return agents.map((a) => {
      const agentCalls = calls.filter((c) => c.client_id === a.id);
      const seconds = agentCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
      return {
        id: a.id,
        name: a.business_name,
        totalCalls: agentCalls.length,
        totalMinutes: formatMinutes(seconds),
      };
    });
  }, [agents, calls]);

  const last14Days = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = filteredCalls.filter((c) => (c.created_at || '').slice(0, 10) === key).length;
      days.push({ key, label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), count });
    }
    return days;
  }, [filteredCalls]);

  const maxDayCount = Math.max(1, ...last14Days.map((d) => d.count));

  const agentOptions = [
    { value: 'all', label: 'All agents' },
    ...agents.map((a) => ({ value: a.id, label: a.business_name })),
  ];

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-muted">Call volume, minutes, and outcomes.</p>
        </div>
        <div className="w-56">
          <Select value={selectedAgent} onChange={setSelectedAgent} options={agentOptions} placeholder="Select agent" />
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={BarChart3} title="Not enough data yet"
            description="Analytics will populate once real call data starts flowing in through connected phone numbers." />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Phone} label="Total Calls" value={totalCalls} />
            <StatCard icon={Clock} label="Total Minutes" value={formatMinutes(totalSeconds)} />
            <StatCard icon={TrendingUp} label="Avg Call Duration" value={`${Math.round(avgSeconds)}s`} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-panel p-6">
            <p className="text-sm font-medium text-white">Calls — last 14 days</p>
            <div className="mt-6 flex items-end gap-2" style={{ height: 140 }}>
              {last14Days.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-accent/70"
                    style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}%` }}
                    title={`${d.count} calls`}
                  />
                  <span className="text-[10px] text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Total Calls</th>
                  <th className="px-5 py-3 font-medium">Total Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perAgentStats.map((a) => (
                  <tr key={a.id} className={a.id === selectedAgent ? 'bg-accent/5' : ''}>
                    <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                    <td className="px-5 py-4 text-muted">{a.totalCalls}</td>
                    <td className="px-5 py-4 text-muted">{a.totalMinutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={16} />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
