'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Users } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['interested', 'Interested'],
  ['qualified', 'Qualified'],
  ['booked', 'Booked'],
  ['not_interested', 'Not Interested'],
  ['do_not_call', 'Do Not Call'],
];

const STATUS_COLORS = {
  new: 'bg-zinc-500/10 text-muted border-border',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  interested: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  booked: 'bg-accent/10 text-accent border-accent/20',
  not_interested: 'bg-red-500/10 text-red-400 border-red-500/20',
  do_not_call: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function emptyForm() {
  return { name: '', phone: '', email: '', source: 'manual', status: 'new', agent_id: '', notes: '' };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filterAgent, setFilterAgent] = useState('all');
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [contactRes, agentRes] = await Promise.all([
      fetch('/api/contacts'),
      fetch('/api/clients'),
    ]);
    const contactData = await contactRes.json();
    const agentData = await agentRes.json();
    setContacts(contactData.contacts || []);
    setAgents(agentData.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    const res = await fetch('/api/contacts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, agent_id: form.agent_id || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Kuch galat ho gaya'); return; }
    setForm(emptyForm()); setPanelOpen(false); load();
  }

  async function updateStatus(id, status) {
    await fetch(`/api/contacts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    load();
  }

  async function deleteContact(id) {
    if (!confirm('Ye contact delete karna hai?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    load();
  }

  const filteredContacts = filterAgent === 'all' ? contacts : contacts.filter((c) => c.agent_id === filterAgent);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Contacts</h1>
          <p className="mt-1 text-sm text-muted">Leads and customers your agents have talked to.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs font-medium text-muted">Filter by agent:</span>
          <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="input w-auto py-1.5 text-xs">
            <option value="all">All agents</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.business_name}</option>)}
          </select>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : filteredContacts.length === 0 ? (
          <EmptyState icon={Users} title={contacts.length === 0 ? 'No contacts yet' : 'No contacts for this agent'}
            description="Add a contact manually, or they'll appear here once campaigns or inbound calls start bringing in leads." ctaLabel="Add Contact" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Calls</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{c.name || '—'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{c.phone}</td>
                    <td className="px-5 py-4 text-muted">{c.clients?.business_name || '—'}</td>
                    <td className="px-5 py-4 capitalize text-muted">{c.source}</td>
                    <td className="px-5 py-4">
                      <select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize outline-none ${STATUS_COLORS[c.status] || STATUS_COLORS.new}`}>
                        {STATUSES.map(([id, label]) => <option key={id} value={id} className="bg-panel2 text-white">{label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-muted">{c.total_calls || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => deleteContact(c.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10">Delete</button>
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
              <h2 className="text-base font-semibold text-white">Add Contact</h2>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Belongs to agent">
                <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} className="input">
                  <option value="">— Select agent —</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.business_name}</option>)}
                </select>
              </Field>
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rohan Sharma" className="input" />
              </Field>
              <Field label="Phone">
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Email (optional)">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className="input" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                  {STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </Field>
              <Field label="Notes (optional)">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input resize-none" />
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Contact'}
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
