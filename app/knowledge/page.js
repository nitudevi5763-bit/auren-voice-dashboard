'use client';
import { useState, useEffect } from 'react';
import { Plus, X, BookOpen } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const TYPES = [
  ['text', 'Text / Notes'],
  ['faq', 'FAQ'],
  ['url', 'Website URL'],
];

const CONTENT_PLACEHOLDERS = {
  text: 'Clinic timings: Mon-Sat 10am-8pm. Address: ...',
  faq: 'Q: Do you accept walk-ins?\nA: Yes, walk-ins are welcome...\n\nQ: What are your charges?\nA: ...',
  url: 'https://example.com/faq',
};

function emptyForm() {
  return { name: '', type: 'text', content: '', agent_ids: [] };
}

export default function KnowledgePage() {
  const [sources, setSources] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [srcRes, agentRes] = await Promise.all([
      fetch('/api/knowledge'),
      fetch('/api/clients'),
    ]);
    const srcData = await srcRes.json();
    const agentData = await agentRes.json();
    setSources(srcData.sources || []);
    setAgents(agentData.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleAgent(agentId) {
    setForm((f) => ({
      ...f,
      agent_ids: f.agent_ids.includes(agentId) ? f.agent_ids.filter((id) => id !== agentId) : [...f.agent_ids, agentId],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    const res = await fetch('/api/knowledge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function deleteSource(id) {
    if (!confirm('Ye knowledge source delete karna hai?')) return;
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    load();
  }

  function agentNames(source) {
    const ids = (source.agent_knowledge || []).map((l) => l.agent_id);
    const names = agents.filter((a) => ids.includes(a.id)).map((a) => a.business_name);
    return names.length ? names.join(', ') : '—';
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Knowledge</h1>
          <p className="mt-1 text-sm text-muted">Documents, FAQs, and website content your agents can reference.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Add Source
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : sources.length === 0 ? (
          <EmptyState icon={BookOpen} title="No knowledge sources yet"
            description="Add text notes, FAQs, or a website URL and link them to agents." ctaLabel="Add Source" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Used by</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{s.name}</td>
                    <td className="px-5 py-4 capitalize text-muted">{s.type}</td>
                    <td className="px-5 py-4 text-muted">{agentNames(s)}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => deleteSource(s.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
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
              <h2 className="text-base font-semibold text-white">Add Knowledge Source</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SmileCare FAQs" className="input" />
              </Field>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                  {TYPES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Content">
                <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={CONTENT_PLACEHOLDERS[form.type]} className="input resize-none" />
              </Field>
              <Field label="Link to agents">
                <div className="space-y-2 rounded-lg border border-border bg-panel2 p-3">
                  {agents.length === 0 && <p className="text-xs text-muted">Koi agent nahi mila — pehle Agents page se agent banao.</p>}
                  {agents.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm text-white">
                      <input type="checkbox" checked={form.agent_ids.includes(a.id)} onChange={() => toggleAgent(a.id)} className="accent-accent" />
                      {a.business_name}
                    </label>
                  ))}
                </div>
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Source'}
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
