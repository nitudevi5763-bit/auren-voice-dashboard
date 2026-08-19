import { Wrench } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Tools</h1>
      <p className="mt-1 text-sm text-muted">Calendar, CRM, and webhook actions your agents can trigger.</p>
      <div className="mt-8">
        <EmptyState icon={Wrench} title="No tools connected"
          description="Attach calendar bookings, CRM sync, or custom webhooks to agents from here once available." />
      </div>
    </div>
  );
}
