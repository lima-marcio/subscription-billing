import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Plans</h1>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New plan
          </button>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <Th>Name</Th>
                <Th>Price</Th>
                <Th>Cycle</Th>
                <Th>Trial</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {plans?.map((plan) => (
                <tr key={plan.id}>
                  <Td>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</div>
                    {plan.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</div>
                    )}
                  </Td>
                  <Td>{formatMoney(plan.priceAmount, plan.priceCurrency)}</Td>
                  <Td>{plan.billingCycle}</Td>
                  <Td>{plan.trialDays > 0 ? `${plan.trialDays} days` : '-'}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        plan.isArchived
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      }`}
                    >
                      {plan.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(plan)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Edit
                      </button>
                      {plan.isArchived ? (
                        <button
                          type="button"
                          onClick={() => unarchiveMutation.mutate(plan.id)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => archiveMutation.mutate(plan.id)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400"
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
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
