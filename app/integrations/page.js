'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Puzzle } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const STATUS_OPTIONS = [
  ['connected', 'Connected'],
  ['pending', 'Pending'],
  ['not_connected', 'Not Connected'],
];

const STATUS_STYLE = {
  connected: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  pending: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  not_connected: 'border-border bg-panel2 text-muted',
};

function emptyForm() {
  return { name: '', status: 'not_connected', notes: '' };
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const res = await fetch('/api/integrations');
    const data = await res.json();
    setIntegrations(data.integrations || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);

    const res = await fetch('/api/integrations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function updateStatus(id, status) {
    await fetch(`/api/integrations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    load();
  }

  async function deleteIntegration(id) {
    if (!confirm('Ye integration delete karna hai?')) return;
    await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Integrations</h1>
          <p className="mt-1 text-sm text-muted">Platform-level services your Auren workspace depends on.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Add Integration
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : integrations.length === 0 ? (
          <EmptyState icon={Puzzle} title="No integrations yet"
            description="Track LiveKit, Deepgram, Groq, Vobiz, and other backend services here." ctaLabel="Add Integration" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {integrations.map((it) => (
                  <tr key={it.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{it.name}</td>
                    <td className="px-5 py-4">
                      <select
                        value={it.status}
                        onChange={(e) => updateStatus(it.id, e.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[it.status] || STATUS_STYLE.not_connected}`}
                      >
                        {STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-muted">{it.notes || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => deleteIntegration(it.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
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
              <h2 className="text-base font-semibold text-white">Add Integration</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vobiz" className="input" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                  {STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Notes">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="KYC pending, waiting on number purchase..." className="input resize-none" />
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Integration'}
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
