import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Td, Th } from '../components/Table';
import { archivePlan, createPlan, getPlans, unarchivePlan, updatePlan } from '../features/plans/api';
import { PlanForm } from '../features/plans/PlanForm';
import type { CreatePlanRequest, Plan } from '../types';
import { formatMoney } from '../utils/format';

export function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plans, isLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['plans'] });

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      invalidate();
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreatePlanRequest }) => updatePlan(id, request),
    onSuccess: () => {
      invalidate();
      setEditingPlan(null);
    },
  });

  const archiveMutation = useMutation({ mutationFn: archivePlan, onSuccess: invalidate });
  const unarchiveMutation = useMutation({ mutationFn: unarchivePlan, onSuccess: invalidate });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Plans</h1>
        {!isCreating && (
          <Button type="button" onClick={() => setIsCreating(true)}>
            New plan
          </Button>
        )}
      </div>

      {isCreating && (
        <PlanForm
          submitLabel="Create"
          onCancel={() => setIsCreating(false)}
          onSubmit={async (request) => {
            await createMutation.mutateAsync(request);
          }}
        />
      )}

      {editingPlan && (
        <PlanForm
          initialValue={editingPlan}
          submitLabel="Save"
          onCancel={() => setEditingPlan(null)}
          onSubmit={async (request) => {
            await updateMutation.mutateAsync({ id: editingPlan.id, request });
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
                <Th>Price</Th>
                <Th>Cycle</Th>
                <Th>Trial</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {plans?.map((plan) => (
                <tr key={plan.id}>
                  <Td>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{plan.name}</div>
                    {plan.description && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{plan.description}</div>
                    )}
                  </Td>
                  <Td className="font-mono tabular-nums">{formatMoney(plan.priceAmount, plan.priceCurrency)}</Td>
                  <Td>{plan.billingCycle}</Td>
                  <Td>{plan.trialDays > 0 ? `${plan.trialDays} days` : '-'}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium dark:border-zinc-800 ${
                        plan.isArchived
                          ? 'text-zinc-600 dark:text-zinc-400'
                          : 'text-accent-700 dark:text-accent-400'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${plan.isArchived ? 'bg-zinc-400' : 'bg-accent-500'}`} />
                      {plan.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(plan)}
                        className="text-sm font-medium text-accent-700 transition-colors hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300"
                      >
                        Edit
                      </button>
                      {plan.isArchived ? (
                        <button
                          type="button"
                          onClick={() => unarchiveMutation.mutate(plan.id)}
                          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => archiveMutation.mutate(plan.id)}
                          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
              {plans?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No plans yet.
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
