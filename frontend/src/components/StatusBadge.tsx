import type { SubscriptionStatus } from '../types';

const statusStyles: Record<SubscriptionStatus, { dot: string; text: string }> = {
  Trialing: { dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  Active: { dot: 'bg-accent-500', text: 'text-accent-700 dark:text-accent-400' },
  PastDue: { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  Suspended: { dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400' },
  Cancelled: { dot: 'bg-zinc-400', text: 'text-zinc-600 dark:text-zinc-400' },
  Expired: { dot: 'bg-zinc-400', text: 'text-zinc-600 dark:text-zinc-400' },
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium dark:border-zinc-800 ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
