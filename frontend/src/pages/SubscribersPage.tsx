import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../components/Button';
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
        <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Subscribers
        </h1>
        {!isCreating && (
          <Button type="button" onClick={() => setIsCreating(true)}>
            New subscriber
          </Button>
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {subscribers?.map((subscriber) => (
                <tr key={subscriber.id}>
                  <Td>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{subscriber.name}</span>
                  </Td>
                  <Td className="font-mono">{subscriber.email}</Td>
                  <Td className="font-mono tabular-nums">{formatDate(subscriber.createdAt)}</Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setEditingSubscriber(subscriber)}
                      className="text-sm font-medium text-accent-700 transition-colors hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300"
                    >
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
              {subscribers?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
