import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Td, Th } from '../components/Table';
import { createSubscriber, getSubscribers, updateSubscriber } from '../features/subscribers/api';
import { SubscriberForm } from '../features/subscribers/SubscriberForm';
import type { CreateSubscriberRequest, Subscriber } from '../types';
import { formatDate } from '../utils/format';

export function SubscribersPage() {
  const queryClient = useQueryClient();
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: getSubscribers,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subscribers'] });

  const createMutation = useMutation({
    mutationFn: createSubscriber,
    onSuccess: () => {
      invalidate();
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreateSubscriberRequest }) =>
      updateSubscriber(id, request),
    onSuccess: () => {
      invalidate();
      setEditingSubscriber(null);
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Subscribers</h1>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New subscriber
          </button>
        )}
      </div>

      {isCreating && (
        <SubscriberForm
          submitLabel="Create"
          onCancel={() => setIsCreating(false)}
          onSubmit={async (request) => {
            await createMutation.mutateAsync(request);
          }}
        />
      )}

      {editingSubscriber && (
        <SubscriberForm
          initialValue={editingSubscriber}
          submitLabel="Save"
          onCancel={() => setEditingSubscriber(null)}
          onSubmit={async (request) => {
            await updateMutation.mutateAsync({ id: editingSubscriber.id, request });
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
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {subscribers?.map((subscriber) => (
                <tr key={subscriber.id}>
                  <Td>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subscriber.name}</span>
                  </Td>
                  <Td>{subscriber.email}</Td>
                  <Td>{formatDate(subscriber.createdAt)}</Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setEditingSubscriber(subscriber)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
              {subscribers?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No subscribers yet.
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
