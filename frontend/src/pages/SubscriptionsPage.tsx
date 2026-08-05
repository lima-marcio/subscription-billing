import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Td, Th } from '../components/Table';
import { CreateSubscriptionForm } from '../features/subscriptions/CreateSubscriptionForm';
import { createSubscription, getSubscriptions } from '../features/subscriptions/api';
import { formatDate } from '../utils/format';

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setIsCreating(false);
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Subscriptions
        </h1>
        {!isCreating && (
          <Button type="button" onClick={() => setIsCreating(true)}>
            New subscription
          </Button>
        )}
      </div>

      {isCreating && (
        <CreateSubscriptionForm
          onCancel={() => setIsCreating(false)}
          onSubmit={async (request) => {
            await createMutation.mutateAsync(request);
          }}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <Th>Subscriber</Th>
                <Th>Plan</Th>
                <Th>Status</Th>
                <Th>Next charge</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {subscriptions?.map((subscription) => (
                <tr
                  key={subscription.id}
                  onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                  className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <Td>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {subscription.subscriberName}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {subscription.subscriberEmail}
                    </div>
                  </Td>
                  <Td>{subscription.planName}</Td>
                  <Td>
                    <StatusBadge status={subscription.status} />
                  </Td>
                  <Td className="font-mono tabular-nums">{formatDate(subscription.nextChargeAt)}</Td>
                </tr>
              ))}
              {subscriptions?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
