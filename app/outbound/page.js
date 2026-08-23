'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Megaphone, Upload } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const phoneIdx = headers.findIndex((h) => h === 'phone' || h === 'phone_number' || h === 'mobile');
  const emailIdx = headers.indexOf('email');

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      name: nameIdx >= 0 ? cols[nameIdx] : '',
      phone: phoneIdx >= 0 ? cols[phoneIdx] : '',
      email: emailIdx >= 0 ? cols[emailIdx] : '',
    };
  }).filter((c) => c.phone);
}

function emptyForm() {
  return { name: '', agent_id: '' };
}

export default function OutboundPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [csvContacts, setCsvContacts] = useState([]);
  const [fileName, setFileName] = useState('');

  async function load() {
    setLoading(true);
    const [campRes, agentRes] = await Promise.all([fetch('/api/campaigns'), fetch('/api/clients')]);
    const campData = await campRes.json();
    const agentData = await agentRes.json();
    setCampaigns(campData.campaigns || []);
    setAgents(agentData.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => setCsvContacts(parseCSV(evt.target.result));
    reader.readAsText(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (csvContacts.length === 0) { setError('Pehle ek CSV upload karo (columns: name, phone, email)'); return; }
    setSaving(true);

    const res = await fetch('/api/campaigns', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contacts: csvContacts }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setCsvContacts([]); setFileName(''); setPanelOpen(false); load();
  }

  async function deleteCampaign(id) {
    if (!confirm('Ye campaign delete karna hai? (contacts delete nahi honge)')) return;
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Outbound Campaigns</h1>
          <p className="mt-1 text-sm text-muted">Upload a contact list and organize outbound calling campaigns.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="No campaigns yet"
            description="Upload a CSV of contacts and create your first outbound campaign." ctaLabel="Create Campaign" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Contacts</th>
                  <th className="px-5 py-3 font-medium">Calls Started</th>
                  <th className="px-5 py-3 font-medium">Calls Completed</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-4 text-muted">{c.clients?.business_name || '—'}</td>
                    <td className="px-5 py-4 text-muted">{c.total_contacts ?? 0}</td>
                    <td className="px-5 py-4 text-muted">{c.calls_started ?? 0}</td>
                    <td className="px-5 py-4 text-muted">{c.calls_completed ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel2 px-2.5 py-1 text-xs font-medium text-muted capitalize">
                        {c.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => deleteCampaign(c.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
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
              <h2 className="text-base font-semibold text-white">Create Campaign</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Campaign name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SmileCare Follow-ups" className="input" />
              </Field>
              <Field label="Agent">
                <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} className="input">
                  <option value="">Select agent</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.business_name}</option>)}
                </select>
              </Field>
              <Field label="Contacts CSV">
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-panel2 px-4 py-6 text-center hover:border-accent">
                  <Upload size={20} className="text-muted" />
                  <span className="text-xs text-muted">{fileName || 'Click to upload CSV (columns: name, phone, email)'}</span>
                  <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
                </label>
                {csvContacts.length > 0 && (
                  <p className="mt-2 text-xs text-emerald-400">{csvContacts.length} contacts parsed ho gaye ✓</p>
                )}
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Create Campaign'}
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
