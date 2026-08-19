'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Bot } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const VOICES = {
  American: [
    ['aura-2-andromeda-en', 'Andromeda — Casual, Expressive'],
    ['aura-2-apollo-en', 'Apollo — Confident, Casual'],
    ['aura-2-arcas-en', 'Arcas — Natural, Smooth, Clear'],
    ['aura-2-aries-en', 'Aries — Warm, Energetic'],
    ['aura-2-asteria-en', 'Asteria — Clear, Confident, Energetic'],
    ['aura-2-athena-en', 'Athena — Calm, Smooth, Professional'],
    ['aura-2-atlas-en', 'Atlas — Enthusiastic, Friendly'],
    ['aura-2-aurora-en', 'Aurora — Cheerful, Energetic'],
    ['aura-2-callista-en', 'Callista — Clear, Professional'],
    ['aura-2-cora-en', 'Cora — Smooth, Melodic, Caring'],
    ['aura-2-cordelia-en', 'Cordelia — Approachable, Warm, Polite'],
    ['aura-2-delia-en', 'Delia — Casual, Friendly, Cheerful'],
    ['aura-2-electra-en', 'Electra — Professional, Engaging'],
    ['aura-2-harmonia-en', 'Harmonia — Empathetic, Calm, Confident'],
    ['aura-2-helena-en', 'Helena — Caring, Natural, Friendly'],
    ['aura-2-hera-en', 'Hera — Smooth, Warm, Professional'],
    ['aura-2-hermes-en', 'Hermes — Expressive, Professional'],
    ['aura-2-iris-en', 'Iris — Cheerful, Approachable'],
    ['aura-2-janus-en', 'Janus — Southern, Smooth, Trustworthy'],
    ['aura-2-juno-en', 'Juno — Natural, Engaging, Melodic'],
    ['aura-2-jupiter-en', 'Jupiter — Expressive, Baritone'],
    ['aura-2-luna-en', 'Luna — Friendly, Natural, Engaging'],
    ['aura-2-mars-en', 'Mars — Smooth, Patient, Trustworthy'],
    ['aura-2-minerva-en', 'Minerva — Positive, Friendly, Natural'],
    ['aura-2-neptune-en', 'Neptune — Professional, Patient, Polite'],
    ['aura-2-odysseus-en', 'Odysseus — Calm, Professional'],
    ['aura-2-ophelia-en', 'Ophelia — Expressive, Enthusiastic'],
    ['aura-2-orion-en', 'Orion — Approachable, Calm, Polite'],
    ['aura-2-orpheus-en', 'Orpheus — Professional, Confident, Trustworthy'],
    ['aura-2-phoebe-en', 'Phoebe — Energetic, Warm, Casual'],
    ['aura-2-pluto-en', 'Pluto — Smooth, Calm, Empathetic'],
    ['aura-2-saturn-en', 'Saturn — Knowledgeable, Confident'],
    ['aura-2-selene-en', 'Selene — Expressive, Engaging, Energetic'],
    ['aura-2-thalia-en', 'Thalia — Clear, Confident, Energetic (default)'],
    ['aura-2-vesta-en', 'Vesta — Natural, Patient, Empathetic'],
    ['aura-2-zeus-en', 'Zeus — Deep, Trustworthy, Smooth'],
  ],
  British: [
    ['aura-2-draco-en', 'Draco — Warm, Trustworthy, Baritone'],
    ['aura-2-pandora-en', 'Pandora — Smooth, Calm, Melodic'],
  ],
  Australian: [
    ['aura-2-hyperion-en', 'Hyperion — Caring, Warm, Empathetic'],
    ['aura-2-theia-en', 'Theia — Expressive, Polite, Sincere'],
  ],
  Filipino: [
    ['aura-2-amalthea-en', 'Amalthea — Engaging, Natural, Cheerful'],
  ],
};

const LLM_MODELS = [
  ['openai/gpt-oss-120b', 'GPT-OSS 120B — best quality (recommended)'],
  ['openai/gpt-oss-20b', 'GPT-OSS 20B — faster, cheaper'],
  ['qwen/qwen3.6-27b', 'Qwen 3.6 27B — preview'],
];

const TELEPHONY_PROVIDERS = ['exotel', 'vobiz', 'other'];
const CALL_DIRECTIONS = [
  ['inbound', 'Inbound'],
  ['outbound', 'Outbound'],
  ['both', 'Inbound + Outbound'],
];

function emptyForm() {
  return {
    business_name: '', system_prompt: '',
    voice: 'aura-2-thalia-en', llm_model: 'openai/gpt-oss-120b',
    phone_number: '', telephony_provider: 'exotel', call_direction: 'inbound',
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const res = await fetch('/api/clients');
    const data = await res.json();
    setAgents(data.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function toggleActive(agent) {
    await fetch(`/api/clients/${agent.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !agent.is_active }),
    });
    load();
  }

  async function duplicateAgent(agent) {
    await fetch('/api/clients', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: `${agent.business_name} (copy)`,
        system_prompt: agent.system_prompt,
        voice: agent.voice,
        llm_model: agent.llm_model,
        phone_number: null,
        telephony_provider: agent.telephony_provider,
        call_direction: agent.call_direction,
      }),
    });
    load();
  }

  async function deleteAgent(id) {
    if (!confirm('Delete this agent permanently?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Agents</h1>
          <p className="mt-1 text-sm text-muted">Build, test and deploy AI voice agents.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : agents.length === 0 ? (
          <EmptyState icon={Bot} title="No agents yet" description="Build your first AI voice agent to start handling calls." ctaLabel="Create Agent" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Direction</th>
                  <th className="px-5 py-3 font-medium">Voice</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((a) => (
                  <tr key={a.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{a.business_name}</td>
                    <td className="px-5 py-4"><StatusBadge status={a.is_active ? 'active' : 'paused'} /></td>
                    <td className="px-5 py-4 capitalize text-muted">{(a.call_direction || 'inbound').replace('both', 'inbound + outbound')}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{a.voice}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{a.llm_model}</td>
                    <td className="px-5 py-4 text-muted">{a.phone_number || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => duplicateAgent(a)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-white">Duplicate</button>
                        <button onClick={() => toggleActive(a)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-white">{a.is_active ? 'Pause' : 'Activate'}</button>
                        <button onClick={() => deleteAgent(a.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
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
              <h2 className="text-base font-semibold text-white">Create Agent</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Business name">
                <input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. SmileCare Dental" className="input" />
              </Field>
              <Field label="System prompt">
                <textarea required rows={5} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} placeholder="Tum SmileCare Dental ki AI receptionist ho..." className="input resize-none" />
              </Field>
              <Field label="Call direction">
                <select value={form.call_direction} onChange={(e) => setForm({ ...form, call_direction: e.target.value })} className="input">
                  {CALL_DIRECTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Voice (Deepgram Aura-2)">
                <select value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="input">
                  {Object.entries(VOICES).map(([accent, list]) => (
                    <optgroup key={accent} label={accent}>
                      {list.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="LLM model (Groq)">
                <select value={form.llm_model} onChange={(e) => setForm({ ...form, llm_model: e.target.value })} className="input">
                  {LLM_MODELS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Phone number (optional)">
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Telephony provider">
                <select value={form.telephony_provider} onChange={(e) => setForm({ ...form, telephony_provider: e.target.value })} className="input">
                  {TELEPHONY_PROVIDERS.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
                </select>
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
                {saving ? 'Saving…' : 'Create Agent'}
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
