'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Mic, PhoneOff, PhoneCall, Plus, X, Bot } from 'lucide-react';
import { Room, RoomEvent } from 'livekit-client';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Select from '../../components/Select';

const VOICE_GROUPS = [
  {
    label: 'American',
    options: [
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
    ].map(([value, label]) => ({ value, label })),
  },
  {
    label: 'British',
    options: [
      ['aura-2-draco-en', 'Draco — Warm, Trustworthy, Baritone'],
      ['aura-2-pandora-en', 'Pandora — Smooth, Calm, Melodic'],
    ].map(([value, label]) => ({ value, label })),
  },
  {
    label: 'Australian',
    options: [
      ['aura-2-hyperion-en', 'Hyperion — Caring, Warm, Empathetic'],
      ['aura-2-theia-en', 'Theia — Expressive, Polite, Sincere'],
    ].map(([value, label]) => ({ value, label })),
  },
  {
    label: 'Filipino',
    options: [['aura-2-amalthea-en', 'Amalthea — Engaging, Natural, Cheerful']].map(([value, label]) => ({ value, label })),
  },
];

const LLM_OPTIONS = [
  { value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B — best quality (recommended)' },
  { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B — faster, cheaper' },
  { value: 'qwen/qwen3.6-27b', label: 'Qwen 3.6 27B — preview' },
];

const DIRECTION_OPTIONS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'both', label: 'Inbound + Outbound' },
];

const PROVIDER_OPTIONS = [
  { value: 'exotel', label: 'Exotel' },
  { value: 'vobiz', label: 'Vobiz' },
  { value: 'other', label: 'Other' },
];

function emptyForm() {
  return {
    business_name: '', system_prompt: '',
    voice: 'aura-2-thalia-en', llm_model: 'openai/gpt-oss-120b',
    phone_number: '', telephony_provider: 'exotel', call_direction: 'inbound',
  };
}

function TestCallModal({ agent, onClose }) {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  const roomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let room;

    async function connect() {
      try {
        const res = await fetch('/api/test-token', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: agent.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Token fetch fail hua');

        room = new Room();
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === 'audio') {
            const el = track.attach();
            el.autoplay = true;
            el.id = `auren-test-audio-${agent.id}`;
            document.body.appendChild(el);
          }
        });

        room.on(RoomEvent.Disconnected, () => { if (!cancelled) setStatus('ended'); });

        await room.connect(data.url, data.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (!cancelled) setStatus('connected');
      } catch (err) {
        if (!cancelled) { setError(err.message); setStatus('error'); }
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (room) room.disconnect();
      const el = document.getElementById(`auren-test-audio-${agent.id}`);
      if (el) el.remove();
    };
  }, [agent.id]);

  function endCall() {
    if (roomRef.current) roomRef.current.disconnect();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-panel p-6 text-center shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-white">Testing: {agent.business_name}</h3>
          <button onClick={endCall} className="rounded-md p-1 text-muted hover:bg-panel2 hover:text-white"><X size={18} /></button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {status === 'connecting' && (
            <>
              <Loader2 size={32} className="animate-spin text-accent" />
              <p className="text-sm text-muted">Connecting…</p>
            </>
          )}
          {status === 'connected' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/10">
                <Mic size={28} className="text-emerald-400" />
              </div>
              <p className="text-sm text-white">Mic live hai — bolo, agent sunega</p>
              <p className="text-xs text-muted">Browser mic permission allow karna zaroori hai</p>
            </>
          )}
          {status === 'ended' && <p className="text-sm text-muted">Call end ho gayi</p>}
          {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button onClick={endCall} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20">
          <PhoneOff size={16} /> End Test Call
        </button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [testingAgent, setTestingAgent] = useState(null);

  async function playVoicePreview(voiceId) {
    if (window.__aurenPreviewAudio) { window.__aurenPreviewAudio.pause(); window.__aurenPreviewAudio = null; }
    if (previewingVoice === voiceId) { setPreviewingVoice(null); return; }

    setPreviewingVoice(voiceId);
    try {
      const res = await fetch('/api/voice-preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice: voiceId }),
      });
      if (!res.ok) throw new Error('Preview failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      window.__aurenPreviewAudio = audio;
      audio.onended = () => setPreviewingVoice(null);
      audio.play();
    } catch (err) {
      setPreviewingVoice(null);
      alert('Voice preview load nahi hua. DEEPGRAM_API_KEY Vercel env vars mein check karo.');
    }
  }

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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !agent.is_active }),
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
          <h1 className="text-white">Agents</h1>
          <p className="mt-1 text-sm text-muted">Build, test and deploy AI voice agents.</p>
        </div>
        <button onClick={() => setPanelOpen(true)} className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : agents.length === 0 ? (
          <EmptyState icon={Bot} title="No agents yet" description="Build your first AI voice agent to start handling calls." ctaLabel="Create Agent" onAction={() => setPanelOpen(true)} />
        ) : (
          <div className="card-hover overflow-x-auto rounded-xl border border-border">
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
                  <tr key={a.id} className="transition hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{a.business_name}</td>
                    <td className="px-5 py-4"><StatusBadge status={a.is_active ? 'active' : 'paused'} /></td>
                    <td className="px-5 py-4 capitalize text-muted">{(a.call_direction || 'inbound').replace('both', 'inbound + outbound')}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{a.voice}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{a.llm_model}</td>
                    <td className="px-5 py-4 text-muted">{a.phone_number || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setTestingAgent(a)} className="flex items-center gap-1.5 rounded-md border border-accent/40 px-3 py-1.5 text-xs text-accent transition hover:bg-accent/10">
                          <PhoneCall size={12} /> Test Call
                        </button>
                        <button onClick={() => duplicateAgent(a)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-white">Duplicate</button>
                        <button onClick={() => toggleActive(a)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-white">{a.is_active ? 'Pause' : 'Activate'}</button>
                        <button onClick={() => deleteAgent(a.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-400/10">Delete</button>
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Create Agent</h2>
              <button onClick={() => setPanelOpen(false)} className="rounded-md p-1 text-muted hover:bg-panel2 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Business name">
                <input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. SmileCare Dental" className="input" />
              </Field>
              <Field label="System prompt">
                <textarea required rows={5} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} placeholder="Tum SmileCare Dental ki AI receptionist ho..." className="input resize-none" />
              </Field>
              <Field label="Call direction">
                <Select value={form.call_direction} onChange={(v) => setForm({ ...form, call_direction: v })} options={DIRECTION_OPTIONS} />
              </Field>
              <Field label="Voice (Deepgram Aura-2)">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={form.voice} onChange={(v) => setForm({ ...form, voice: v })} groups={VOICE_GROUPS} />
                  </div>
                  <button type="button" onClick={() => playVoicePreview(form.voice)}
                    className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-panel2 text-white transition hover:border-accent">
                    {previewingVoice === form.voice ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted">Preview button dabao voice sunne ke liye.</p>
              </Field>
              <Field label="LLM model (Groq)">
                <Select value={form.llm_model} onChange={(v) => setForm({ ...form, llm_model: v })} options={LLM_OPTIONS} />
              </Field>
              <Field label="Phone number (optional)">
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Telephony provider">
                <Select value={form.telephony_provider} onChange={(v) => setForm({ ...form, telephony_provider: v })} options={PROVIDER_OPTIONS} />
              </Field>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button disabled={saving} type="submit" className="gradient-btn w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Create Agent'}
              </button>
            </form>
          </div>
        </div>
      )}

      {testingAgent && <TestCallModal agent={testingAgent} onClose={() => setTestingAgent(null)} />}
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
