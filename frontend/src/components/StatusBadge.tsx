import type { SubscriptionStatus } from '../types';

const statusStyles: Record<SubscriptionStatus, string> = {
  Trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  PastDue: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
  );
}
