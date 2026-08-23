'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Wrench, Calendar, Link2, Webhook as WebhookIcon } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const TYPES = [
  ['calendar', 'Calendar (Google Calendar)'],
  ['crm', 'CRM'],
  ['webhook', 'Webhook'],
];

const TYPE_ICON = { calendar: Calendar, crm: Link2, webhook: WebhookIcon };

function emptyForm() {
  return { name: '', type: 'calendar', config: {}, agent_ids: [] };
}

export default function ToolsPage() {
  const [tools, setTools] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [toolRes, agentRes] = await Promise.all([
      fetch('/api/tools'),
      fetch('/api/clients'),
    ]);
    const toolData = await toolRes.json();
    const agentData = await agentRes.json();
    setTools(toolData.tools || []);
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

  function updateConfig(key, value) {
    setForm((f) => ({ ...f, config: { ...f.config, [key]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);

    const res = await fetch('/api/tools', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function deleteTool(id) {
    if (!confirm('Ye tool delete karna hai?')) return;
    await fetch(`/api/tools/${id}`, { method: 'DELETE' });
    load();
  }

  function agentNames(tool) {
    const ids = (tool.agent_tools || []).map((l) => l.agent_id);
    const names = agents.filter((a) => ids.includes(a.id)).map((a) => a.business_name);
    return names.length ? names.join(', ') : '—';
  }

  function renderConfigFields() {
    if (form.type === 'calendar') {
      return (
        <>
          <Field label="Google Calendar ID">
            <input value={form.config.calendar_id || ''} onChange={(e) => updateConfig('calendar_id', e.target.value)}
              placeholder="clinic@gmail.com ya calendar ID" className="input" />
          </Field>
          <Field label="Timezone">
            <input value={form.config.timezone || ''} onChange={(e) => updateConfig('timezone', e.target.value)}
              placeholder="Asia/Kolkata" className="input" />
          </Field>
        </>
      );
    }
    if (form.type === 'crm') {
      return (
        <>
          <Field label="CRM Webhook URL">
            <input value={form.config.webhook_url || ''} onChange={(e) => updateConfig('webhook_url', e.target.value)}
              placeholder="https://yourcrm.com/api/leads" className="input" />
          </Field>
          <Field label="API Key">
            <input value={form.config.api_key || ''} onChange={(e) => updateConfig('api_key', e.target.value)}
              placeholder="crm api key" className="input" />
          </Field>
        </>
      );
    }
    return (
      <>
        <Field label="Webhook URL">
          <input value={form.config.url || ''} onChange={(e) => updateConfig('url', e.target.value)}
            placeholder="https://example.com/webhook" className="input" />
        </Field>
        <Field label="Method">
          <select value={form.config.method || 'POST'} onChange={(e) => updateConfig('method', e.target.value)} className="input">
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
          </select>
        </Field>
      </>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Tools</h1>
          <p className="mt-1 text-sm text-muted">Calendar, CRM, and webhook connections your agents can use.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Add Tool
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : tools.length === 0 ? (
          <EmptyState icon={Wrench} title="No tools yet"
            description="Add a calendar, CRM, or webhook connection and link it to agents." ctaLabel="Add Tool" onAction={() => setPanelOpen(true)} />
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
                {tools.map((t) => {
                  const Icon = TYPE_ICON[t.type] || Wrench;
                  return (
                    <tr key={t.id} className="hover:bg-panel/50">
                      <td className="px-5 py-4 font-medium text-white">
                        <div className="flex items-center gap-2"><Icon size={14} className="text-muted" /> {t.name}</div>
                      </td>
                      <td className="px-5 py-4 uppercase text-muted">{t.type}</td>
                      <td className="px-5 py-4 text-muted">{agentNames(t)}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => deleteTool(t.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Add Tool</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SmileCare Google Calendar" className="input" />
              </Field>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, config: {} })} className="input">
                  {TYPES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>

              {renderConfigFields()}

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
                {saving ? 'Saving…' : 'Add Tool'}
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
