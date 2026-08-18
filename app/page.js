'use client';
import { useState, useEffect } from 'react';

const VOICE_SUGGESTIONS = [
  'aura-2-thalia-en', 'aura-2-luna-en', 'aura-2-stella-en',
  'aura-2-athena-en', 'aura-2-orion-en', 'aura-2-arcas-en',
];
const LLM_SUGGESTIONS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const TELEPHONY_PROVIDERS = ['exotel', 'vobiz', 'other'];

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    business_name: '', system_prompt: '',
    voice: 'aura-2-thalia-en', llm_model: 'llama-3.3-70b-versatile',
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
    setForm({ business_name: '', system_prompt: '', voice: 'aura-2-thalia-en', llm_model: 'llama-3.3-70b-versatile', phone_number: '', telephony_provider: 'exotel' });
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
    <main className="min-h-screen bg-ink px-6 py-10 md:px-12">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-[3px] h-6">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="waveform-bar w-[3px] rounded-full bg-amber"
                style={{ height: '100%', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div>
            <h1 className="font-mono text-lg tracking-tight text-white">AUREN <span className="text-muted">/ control</span></h1>
            <p className="text-sm text-muted">Voice agent client registry</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <div className="h-fit rounded-lg border border-border bg-panel p-6">
          <h2 className="font-mono text-sm uppercase tracking-wide text-muted">New agent</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Business name">
              <input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                placeholder="e.g. SmileCare Dental" className="input" />
            </Field>
            <Field label="System prompt">
              <textarea required rows={5} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                placeholder="Tum SmileCare Dental ki AI receptionist ho..." className="input resize-none" />
            </Field>
            <Field label="Voice (Deepgram)">
              <input list="voices" value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="input" />
              <datalist id="voices">{VOICE_SUGGESTIONS.map((v) => <option key={v} value={v} />)}</datalist>
            </Field>
            <Field label="LLM model (Groq)">
              <input list="llms" value={form.llm_model} onChange={(e) => setForm({ ...form, llm_model: e.target.value })} className="input" />
              <datalist id="llms">{LLM_SUGGESTIONS.map((m) => <option key={m} value={m} />)}</datalist>
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button disabled={saving} type="submit"
              className="w-full rounded-md bg-amber py-2.5 text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create agent'}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-mono text-sm uppercase tracking-wide text-muted">Active roster</h2>
            <span className="font-mono text-xs text-muted">{clients.length} agents</span>
          </div>
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-muted">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted">Abhi koi agent nahi hai. Left se pehla add karo.</p>
          ) : (
            <div className="divide-y divide-border">
              {clients.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${c.is_active ? 'bg-mint' : 'bg-muted'}`} />
                      <p className="truncate font-medium text-white">{c.business_name}</p>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted">
                      {c.llm_model} · {c.voice} {c.phone_number ? `· ${c.phone_number}` : ''} {c.telephony_provider ? `· ${c.telephony_provider}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => toggleActive(c)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-white">
                      {c.is_active ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => deleteClient(c.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">
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
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
