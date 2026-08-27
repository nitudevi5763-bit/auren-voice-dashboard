'use client';
import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Phone, Clock } from 'lucide-react';
import Select from '../../components/Select';

export default function SettingsPage() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [rate, setRate] = useState(5);
  const [savingRate, setSavingRate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    async function load() {
      const [agentsRes, callsRes, billingRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/calls'),
        fetch('/api/billing'),
      ]);
      const agentsData = await agentsRes.json();
      const callsData = await callsRes.json();
      const billingData = await billingRes.json();
      setAgents(agentsData.clients || []);
      setCalls(callsData.calls || []);
      setRate(billingData.cost_per_minute ?? 5);
      setLoading(false);
    }
    load();
  }, []);

  async function saveRate() {
    setSavingRate(true);
    await fetch('/api/billing', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost_per_minute: Number(rate) }),
    });
    setSavingRate(false);
  }

  const filteredCalls = useMemo(() => {
    if (selectedAgent === 'all') return calls;
    return calls.filter((c) => c.client_id === selectedAgent);
  }, [calls, selectedAgent]);

  const totalSeconds = filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
  const totalMinutes = totalSeconds / 60;
  const estimatedCost = totalMinutes * rate;

  const perAgentBreakdown = useMemo(() => {
    return agents.map((a) => {
      const agentCalls = calls.filter((c) => c.client_id === a.id);
      const seconds = agentCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
      const minutes = seconds / 60;
      return { id: a.id, name: a.business_name, totalCalls: agentCalls.length, minutes, cost: minutes * rate };
    });
  }, [agents, calls, rate]);

  const agentOptions = [
    { value: 'all', label: 'All agents' },
    ...agents.map((a) => ({ value: a.id, label: a.business_name })),
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      <p className="mt-1 text-sm text-muted">Workspace, billing, and account preferences.</p>

      <div className="mt-8 rounded-xl border border-border bg-panel p-6">
        <p className="text-sm text-white">Workspace</p>
        <p className="mt-1 text-sm text-muted">Auren</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-white">Usage & Billing</p>
        <div className="w-56">
          <Select value={selectedAgent} onChange={setSelectedAgent} options={agentOptions} placeholder="Select agent" />
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Phone} label="Total Calls" value={filteredCalls.length} />
            <StatCard icon={Clock} label="Total Minutes" value={totalMinutes.toFixed(1)} />
            <StatCard icon={DollarSign} label="Estimated Cost" value={`₹${estimatedCost.toFixed(2)}`} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-panel p-6">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Cost per minute (₹)</span>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input flex-1" />
                <button onClick={saveRate} disabled={savingRate} className="gradient-btn rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                  {savingRate ? 'Saving…' : 'Save'}
                </button>
              </div>
            </label>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Total Calls</th>
                  <th className="px-5 py-3 font-medium">Minutes</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perAgentBreakdown.map((a) => (
                  <tr key={a.id} className={a.id === selectedAgent ? 'bg-accent/5' : ''}>
                    <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                    <td className="px-5 py-4 text-muted">{a.totalCalls}</td>
                    <td className="px-5 py-4 text-muted">{a.minutes.toFixed(1)}</td>
                    <td className="px-5 py-4 text-muted">₹{a.cost.toFixed(2)}</td>
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
