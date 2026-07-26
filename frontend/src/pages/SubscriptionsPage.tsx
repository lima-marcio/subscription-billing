import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Subscriptions</h1>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New subscription
          </button>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <Th>Subscriber</Th>
                <Th>Plan</Th>
                <Th>Status</Th>
                <Th>Next charge</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {subscriptions?.map((subscription) => (
                <tr
                  key={subscription.id}
                  onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Td>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription.subscriberName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {subscription.subscriberEmail}
                    </div>
                  </Td>
                  <Td>{subscription.planName}</Td>
                  <Td>
                    <StatusBadge status={subscription.status} />
                  </Td>
                  <Td>{formatDate(subscription.nextChargeAt)}</Td>
                </tr>
              ))}
              {subscriptions?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
