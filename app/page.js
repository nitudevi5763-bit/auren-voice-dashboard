'use client';
import { useState, useEffect } from 'react';

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
  ['qwen/qwen3.6-27b', 'Qwen 3.6 27B — preview, evaluate before production'],
];

const TELEPHONY_PROVIDERS = ['exotel', 'vobiz', 'other'];

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    business_name: '', system_prompt: '',
    voice: 'aura-2-thalia-en', llm_model: 'openai/gpt-oss-120b',
    phone_number: '', telephony_provider: 'exotel',
  });

  async function loadClients() {
    setLoading(true);
    const res = await fetch('/api/clients');
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  }

  useEffect(() => { loadClients(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm({ business_name: '', system_prompt: '', voice: 'aura-2-thalia-en', llm_model: 'openai/gpt-oss-120b', phone_number: '', telephony_provider: 'exotel' });
    loadClients();
  }

  async function toggleActive(client) {
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !client.is_active }),
    });
    loadClients();
  }

  async function deleteClient(id) {
    if (!confirm('Ye agent permanently delete karna hai?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    loadClients();
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-10 md:px-14">
      <div className="flex items-center justify-between border-b border-border pb-7">
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-[4px] h-8">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="waveform-bar w-[4px] rounded-full bg-amber"
                style={{ height: '100%', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div>
            <h1 className="font-mono text-2xl tracking-tight text-white">AUREN <span className="text-muted">/ control</span></h1>
            <p className="text-base text-muted">Voice agent client registry</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        <div className="h-fit rounded-xl border border-border bg-panel p-7">
          <h2 className="font-mono text-base uppercase tracking-wide text-muted">New agent</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Business name">
              <input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                placeholder="e.g. SmileCare Dental" className="input" />
            </Field>
            <Field label="System prompt">
              <textarea required rows={5} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                placeholder="Tum SmileCare Dental ki AI receptionist ho..." className="input resize-none" />
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
              <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+91XXXXXXXXXX" className="input" />
            </Field>
            <Field label="Telephony provider">
              <select value={form.telephony_provider} onChange={(e) => setForm({ ...form, telephony_provider: e.target.value })} className="input">
                {TELEPHONY_PROVIDERS.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
              </select>
            </Field>
            {error && <p className="text-base text-red-400">{error}</p>}
            <button disabled={saving} type="submit"
              className="w-full rounded-lg bg-amber py-3.5 text-base font-semibold text-ink transition hover:brightness-110 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create agent'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-7 py-5">
            <h2 className="font-mono text-base uppercase tracking-wide text-muted">Active roster</h2>
            <span className="font-mono text-sm text-muted">{clients.length} agents</span>
          </div>
          {loading ? (
            <p className="px-7 py-12 text-center text-base text-muted">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="px-7 py-12 text-center text-base text-muted">Abhi koi agent nahi hai. Left se pehla add karo.</p>
          ) : (
            <div className="divide-y divide-border">
              {clients.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 px-7 py-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${c.is_active ? 'bg-mint' : 'bg-muted'}`} />
                      <p className="truncate text-lg font-medium text-white">{c.business_name}</p>
                    </div>
                    <p className="mt-1.5 truncate font-mono text-sm text-muted">
                      {c.llm_model} · {c.voice} {c.phone_number ? `· ${c.phone_number}` : ''} {c.telephony_provider ? `· ${c.telephony_provider}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => toggleActive(c)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">
                      {c.is_active ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => deleteClient(c.id)} className="rounded-lg border border-border px-4 py-2 text-sm text-red-400 hover:bg-red-400/10">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
