'use client';
import { PhoneCall } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Calls</h1>
      <p className="mt-1 text-sm text-muted">Every call, transcript, and recording in one place.</p>
      <div className="mt-8">
        <EmptyState icon={PhoneCall} title="No calls logged yet"
          description="Call logging goes live once a phone number is connected and routing calls to an agent." />
      </div>
    </div>
  );
}
