'use client';
import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Phone, Clock } from 'lucide-react';
import Select from '../../components/Select';

export default function SettingsPage() {
  const [agents, setAgents] = useState([]);
  const [billing, setBilling] = useState(null);
  const [rate, setRate] = useState(0);
  const [savingRate, setSavingRate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    async function load() {
      const [agentsRes, billingRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/billing'),
      ]);
      const agentsData = await agentsRes.json();
      const billingData = await billingRes.json();
      setAgents(agentsData.clients || []);
      setBilling(billingData);
      setRate(billingData?.settings?.cost_per_minute ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function saveRate() {
    if (!billing?.settings?.id) return;
    setSavingRate(true);
    const res = await fetch('/api/billing', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: billing.settings.id, cost_per_minute: Number(rate) }),
    });
    const data = await res.json();
    setSavingRate(false);
    if (data.settings) setBilling((b) => ({ ...b, settings: data.settings }));
  }

  const agentOptions = [
    { value: 'all', label: 'All agents' },
    ...agents.map((a) => ({ value: a.id, label: a.business_name })),
  ];

  const selectedAgentName = useMemo(() => {
    if (selectedAgent === 'all') return null;
    return agents.find((a) => a.id === selectedAgent)?.business_name;
  }, [agents, selectedAgent]);

  const selectedStats = useMemo(() => {
    if (!billing) return { calls: 0, minutes: 0, cost: 0 };
    if (selectedAgent === 'all') {
      return { calls: billing.totalCalls || 0, minutes: billing.totalMinutes || 0, cost: billing.totalCost || 0 };
    }
    const found = (billing.byAgent || []).find((a) => a.name === selectedAgentName);
    return found ? { calls: found.calls, minutes: found.minutes, cost: found.cost } : { calls: 0, minutes: 0, cost: 0 };
  }, [billing, selectedAgent, selectedAgentName]);

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
            <StatCard icon={Phone} label="Total Calls" value={selectedStats.calls} />
            <StatCard icon={Clock} label="Total Minutes" value={selectedStats.minutes.toFixed(1)} />
            <StatCard icon={DollarSign} label="Estimated Cost" value={`₹${selectedStats.cost.toFixed(2)}`} />
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
                {(billing?.byAgent || []).map((a) => (
                  <tr key={a.name} className={a.name === selectedAgentName ? 'bg-accent/5' : ''}>
                    <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                    <td className="px-5 py-4 text-muted">{a.calls}</td>
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
