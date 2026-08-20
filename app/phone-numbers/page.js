'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Phone } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const PROVIDERS = ['vobiz', 'exotel', 'other'];
const DIRECTIONS = [
  ['inbound', 'Inbound'],
  ['outbound', 'Outbound'],
  ['both', 'Inbound + Outbound'],
];

function emptyForm() {
  return {
    number: '', provider: 'vobiz', country: 'IN', direction: 'inbound',
    sip_trunk_id: '', sip_domain: '', sip_username: '', sip_password: '',
    assigned_agent_id: '',
  };
}

export default function PhoneNumbersPage() {
  const [numbers, setNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [numRes, agentRes] = await Promise.all([
      fetch('/api/phone-numbers'),
      fetch('/api/clients'),
    ]);
    const numData = await numRes.json();
    const agentData = await agentRes.json();
    setNumbers(numData.numbers || []);
    setAgents(agentData.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    const res = await fetch('/api/phone-numbers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, assigned_agent_id: form.assigned_agent_id || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function deleteNumber(id) {
    if (!confirm('Ye number delete karna hai?')) return;
    await fetch(`/api/phone-numbers/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Phone Numbers</h1>
          <p className="mt-1 text-sm text-muted">Connect phone numbers and route them to your agents.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Add Phone Number
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : numbers.length === 0 ? (
          <EmptyState icon={Phone} title="No phone numbers connected"
            description="Add a number and its SIP trunk details to route calls to an agent." ctaLabel="Add Phone Number" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Number</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Direction</th>
                  <th className="px-5 py-3 font-medium">Assigned Agent</th>
                  <th className="px-5 py-3 font-medium">SIP Trunk</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {numbers.map((n) => (
                  <tr key={n.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{n.number}</td>
                    <td className="px-5 py-4 capitalize text-muted">{n.provider}</td>
                    <td className="px-5 py-4"><StatusBadge status={n.status === 'active' ? 'active' : 'paused'} /></td>
                    <td className="px-5 py-4 capitalize text-muted">{(n.direction || 'inbound').replace('both', 'inbound + outbound')}</td>
                    <td className="px-5 py-4 text-muted">{n.clients?.business_name || '—'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{n.sip_domain || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => deleteNumber(n.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Add Phone Number</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Phone number">
                <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Provider">
                <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="input">
                  {PROVIDERS.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Direction">
                <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="input">
                  {DIRECTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Assign to agent (optional)">
                <select value={form.assigned_agent_id} onChange={(e) => setForm({ ...form, assigned_agent_id: e.target.value })} className="input">
                  <option value="">— Unassigned —</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.business_name}</option>)}
                </select>
              </Field>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">SIP trunk details (from LiveKit)</p>
                <div className="mt-4 space-y-4">
                  <Field label="SIP Trunk ID">
                    <input value={form.sip_trunk_id} onChange={(e) => setForm({ ...form, sip_trunk_id: e.target.value })} placeholder="e.g. ST_xxxxxxxx" className="input" />
                  </Field>
                  <Field label="SIP Domain">
                    <input value={form.sip_domain} onChange={(e) => setForm({ ...form, sip_domain: e.target.value })} placeholder="e.g. xxxxx.sip.livekit.cloud" className="input" />
                  </Field>
                  <Field label="SIP Username">
                    <input value={form.sip_username} onChange={(e) => setForm({ ...form, sip_username: e.target.value })} className="input" />
                  </Field>
                  <Field label="SIP Password">
                    <input type="password" value={form.sip_password} onChange={(e) => setForm({ ...form, sip_password: e.target.value })} className="input" />
                  </Field>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Phone Number'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
