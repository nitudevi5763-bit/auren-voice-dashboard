import { Phone } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Phone Numbers</h1>
      <p className="mt-1 text-sm text-muted">Connect phone numbers and route them to your agents.</p>
      <div className="mt-8">
        <EmptyState icon={Phone} title="No phone numbers connected"
          description="Number provisioning is in progress (KYC pending with the telephony provider). This section will let you assign numbers to agents once a number is live." />
      </div>
    </div>
  );
}
