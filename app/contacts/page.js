import { Users } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Contacts</h1>
      <p className="mt-1 text-sm text-muted">Leads and customers your agents have talked to.</p>
      <div className="mt-8">
        <EmptyState icon={Users} title="No contacts yet"
          description="Contacts will populate here once campaigns or inbound calls start bringing in leads." />
      </div>
    </div>
  );
}
