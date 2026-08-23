'use client';
import { useState, useEffect } from 'react';
import { PhoneCall, X, Clock } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/calls');
    const data = await res.json();
    setCalls(data.calls || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Calls</h1>
      <p className="mt-1 text-sm text-muted">Every call, transcript, and recording in one place.</p>

      <div className="mt-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : calls.length === 0 ? (
          <EmptyState icon={PhoneCall} title="No calls logged yet"
            description="Run a Test Call from the Agents page, or wait for real calls once a phone number is connected." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Direction</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {calls.map((c) => (
                  <tr key={c.id} className="hover:bg-panel/50">
                    <td className="px-5 py-4 font-medium text-white">{c.clients?.business_name || '—'}</td>
                    <td className="px-5 py-4 capitalize text-muted">{c.direction || '—'}</td>
                    <td className="px-5 py-4 text-muted">
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatDuration(c.duration_seconds)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 capitalize">
                        {c.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelectedCall(c)} disabled={!c.transcript}
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-white disabled:opacity-40">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-panel p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {selectedCall.clients?.business_name || 'Call'} transcript
              </h3>
              <button onClick={() => setSelectedCall(null)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-muted">{selectedCall.transcript}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
