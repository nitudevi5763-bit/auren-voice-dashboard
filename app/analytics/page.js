'use client';
import { useState, useEffect } from 'react';
import { BarChart3, Phone, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import EmptyState from '../../components/EmptyState';

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={15} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-panel2 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-white">{formatDay(label)}</p>
      <p className="mt-0.5 text-muted">{payload[0].value} calls</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted">Loading…</p>;
  }

  if (!data || data.totalCalls === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Call volume, answer rates, and outcomes across all agents.</p>
        <div className="mt-8">
          <EmptyState icon={BarChart3} title="Not enough data yet"
            description="Run a Test Call from the Agents page to start seeing analytics here." />
        </div>
      </div>
    );
  }

  const maxCalls = Math.max(...data.callsByDay.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Call volume, answer rates, and outcomes across all agents.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Phone} label="Total Calls" value={data.totalCalls} />
        <StatCard icon={Clock} label="Avg Duration" value={formatDuration(data.avgDuration)} sublabel="per call" />
        <StatCard icon={CheckCircle2} label="Completion Rate" value={`${data.completionRate}%`} sublabel="calls completed successfully" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="text-sm font-semibold text-white">Calls over time</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.callsByDay}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" fill="url(#callsGradient)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Calls</th>
                <th className="px-5 py-3 font-medium">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.callsByAgent.map((a) => (
                <tr key={a.name} className="hover:bg-panel/50">
                  <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                  <td className="px-5 py-4 text-muted">{a.calls}</td>
                  <td className="px-5 py-4 text-muted">{formatDuration(a.avgDuration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-panel p-5">
          <h2 className="text-sm font-semibold text-white">By direction</h2>
          <div className="mt-4 space-y-3">
            {data.byDirection.map((d) => (
              <div key={d.direction} className="flex items-center justify-between">
                <span className="text-sm capitalize text-muted">{d.direction}</span>
                <span className="rounded-full border border-border bg-panel2 px-2.5 py-1 text-xs font-medium text-white">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
