'use client';
import Link from 'next/link';

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      {Icon && <Icon size={28} className="mb-4 text-muted" />}
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onAction && (
        <button onClick={onAction} className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
