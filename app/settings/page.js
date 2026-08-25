'use client';
import { useState, useEffect } from 'react';
import { Save, Phone, Clock, IndianRupee, Loader2 } from 'lucide-react';

function formatMinutes(mins) {
  return mins.toFixed(1);
}

function formatCost(cost, currency) {
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${cost.toFixed(2)}`;
}

export default function SettingsPage() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rateInput, setRateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/billing');
    const data = await res.json();
    setBilling(data);
    setRateInput(data.settings?.cost_per_minute ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveRate() {
    setSaving(true); setSaved(false);
    await fetch('/api/billing', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: billing.settings.id, cost_per_minute: parseFloat(rateInput) || 0 }),
    });
    setSaving(false); setSaved(true);
    load();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      <p className="mt-1 text-sm text-muted">Workspace, billing, and account preferences.</p>

      <div className="mt-8 rounded-xl border border-border bg-panel p-6">
        <p className="text-sm text-white">Workspace</p>
        <p className="mt-1 text-sm text-muted">Auren</p>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-white">Usage & Billing</h2>
        <p className="mt-1 text-sm text-muted">Estimated cost based on total call minutes and your set rate.</p>

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading…</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-panel p-5">
                <div className="flex items-center gap-2 text-muted"><Phone size={15} /><span className="text-xs font-medium uppercase tracking-wide">Total Calls</span></div>
                <p className="mt-3 text-2xl font-semibold text-white">{billing.totalCalls}</p>
              </div>
              <div className="rounded-xl border border-border bg-panel p-5">
                <div className="flex items-center gap-2 text-muted"><Clock size={15} /><span className="text-xs font-medium uppercase tracking-wide">Total Minutes</span></div>
                <p className="mt-3 text-2xl font-semibold text-white">{formatMinutes(billing.totalMinutes)}</p>
              </div>
              <div className="rounded-xl border border-border bg-panel p-5">
                <div className="flex items-center gap-2 text-muted"><IndianRupee size={15} /><span className="text-xs font-medium uppercase tracking-wide">Estimated Cost</span></div>
                <p className="mt-3 text-2xl font-semibold text-white">{formatCost(billing.totalCost, billing.settings.currency)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-panel p-5">
              <p className="text-sm font-medium text-white">Rate per minute ({billing.settings.currency})</p>
              <p className="mt-1 text-xs text-muted">Deepgram STT + TTS + Groq LLM ka blended estimate — jab tum actual bills dekh lo to yahan update kar dena.</p>
              <div className="mt-3 flex max-w-xs items-center gap-2">
                <input
                  type="number" step="0.01" value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="input flex-1"
                />
                <button onClick={saveRate} disabled={saving}
                  className="gradient-btn flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {billing.byAgent.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Agent</th>
                      <th className="px-5 py-3 font-medium">Calls</th>
                      <th className="px-5 py-3 font-medium">Minutes</th>
                      <th className="px-5 py-3 font-medium">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billing.byAgent.map((a) => (
                      <tr key={a.name} className="hover:bg-panel/50">
                        <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                        <td className="px-5 py-4 text-muted">{a.calls}</td>
                        <td className="px-5 py-4 text-muted">{formatMinutes(a.minutes)}</td>
                        <td className="px-5 py-4 text-muted">{formatCost(a.cost, billing.settings.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
