'use client';
import { BarChart3 } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Call volume, answer rates, and outcomes across all agents.</p>
      <div className="mt-8">
        <EmptyState icon={BarChart3} title="Not enough data yet"
          description="Analytics will populate once real call data starts flowing in through connected phone numbers." />
      </div>
    </div>
  );
}
