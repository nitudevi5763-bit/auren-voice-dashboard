import { Puzzle } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Integrations</h1>
      <p className="mt-1 text-sm text-muted">Connect third-party services to your Auren workspace.</p>
      <div className="mt-8">
        <EmptyState icon={Puzzle} title="No integrations yet"
          description="Google Calendar, CRMs, and other integrations will appear here as they're added." />
      </div>
    </div>
  );
}
