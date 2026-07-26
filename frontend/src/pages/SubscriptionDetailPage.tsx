import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { getPlans } from '../features/plans/api';
import {
  cancelSubscription,
  getSubscription,
  reactivateSubscription,
  schedulePlanChange,
} from '../features/subscriptions/api';
import { formatDate } from '../utils/format';

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => getSubscription(id!),
    enabled: !!id,
  });

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions', id] });
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
  };

  const cancelMutation = useMutation({
    mutationFn: () => cancelSubscription(id!),
    onSuccess: invalidate,
    onError: () => setActionError('Could not cancel this subscription.'),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateSubscription(id!),
    onSuccess: invalidate,
    onError: () => setActionError('Reactivation failed - the charge attempt was declined.'),
  });

  const planChangeMutation = useMutation({
    mutationFn: () => schedulePlanChange(id!, { newPlanId: selectedPlanId }),
    onSuccess: () => {
      invalidate();
      setSelectedPlanId('');
    },
    onError: () => setActionError('Could not schedule the plan change.'),
  });

  if (isLoading || !subscription) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  const canCancel = subscription.status !== 'Cancelled' && subscription.status !== 'Expired';
  const canChangePlan = subscription.status === 'Trialing' || subscription.status === 'Active';
  const otherActivePlans = plans?.filter((p) => !p.isArchived && p.id !== subscription.planId) ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/subscriptions')}
        className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        ← Back to subscriptions
      </button>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {subscription.subscriberName}
          </h1>
          <StatusBadge status={subscription.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Subscriber email" value={subscription.subscriberEmail} />
          <Field label="Plan" value={subscription.planName} />
          <Field label="Started" value={formatDate(subscription.startedAt)} />
          <Field label="Trial ends" value={formatDate(subscription.trialEndsAt)} />
          <Field label="Current period end" value={formatDate(subscription.currentPeriodEnd)} />
          <Field label="Next charge" value={formatDate(subscription.nextChargeAt)} />
          <Field label="Cancelled at" value={formatDate(subscription.cancelledAt)} />
          <Field
            label="Pending plan change"
            value={subscription.pendingPlanName ? `-> ${subscription.pendingPlanName} (next renewal)` : '-'}
          />
        </dl>
      </div>

      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <div className="flex flex-wrap gap-3">
        {subscription.status === 'Suspended' && (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              reactivateMutation.mutate();
            }}
            disabled={reactivateMutation.isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Reactivate
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              cancelMutation.mutate();
            }}
            disabled={cancelMutation.isPending}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Cancel subscription
          </button>
        )}
      </div>

      {canChangePlan && otherActivePlans.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Schedule upgrade / downgrade
          </h2>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Takes effect at the next renewal - the current plan keeps billing until then.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Select a plan</option>
              {otherActivePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedPlanId || planChangeMutation.isPending}
              onClick={() => {
                setActionError(null);
                planChangeMutation.mutate();
              }}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Schedule change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}
