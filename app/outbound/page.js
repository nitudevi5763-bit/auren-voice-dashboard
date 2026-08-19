'use client';
import { Megaphone } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Outbound Campaigns</h1>
      <p className="mt-1 text-sm text-muted">Upload a contact list and let your agent start calling.</p>
      <div className="mt-8">
        <EmptyState icon={Megaphone} title="No campaigns yet"
          description="Outbound campaigns need a connected phone number and calling engine — coming after Phone Numbers is live." />
      </div>
    </div>
  );
}
