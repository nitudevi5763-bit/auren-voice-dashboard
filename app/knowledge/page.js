'use client';
import { BookOpen } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white">Knowledge</h1>
      <p className="mt-1 text-sm text-muted">Documents, FAQs, and website content your agents can reference.</p>
      <div className="mt-8">
        <EmptyState icon={BookOpen} title="No knowledge sources yet"
          description="Upload documents or FAQs here once the knowledge base is connected to the agent engine." />
      </div>
    </div>
  );
}
