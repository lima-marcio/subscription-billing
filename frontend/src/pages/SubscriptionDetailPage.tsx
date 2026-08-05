import { ArrowLeft } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
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
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>;
  }

  const canCancel = subscription.status !== 'Cancelled' && subscription.status !== 'Expired';
  const canChangePlan = subscription.status === 'Trialing' || subscription.status === 'Active';
  const otherActivePlans = plans?.filter((p) => !p.isArchived && p.id !== subscription.planId) ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/subscriptions')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-accent-700 transition-colors hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300"
      >
        <ArrowLeft size={16} />
        Back to subscriptions
      </button>

      <Card className="mb-6 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {subscription.subscriberName}
          </h1>
          <StatusBadge status={subscription.status} />
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field label="Subscriber email" value={subscription.subscriberEmail} mono />
          <Field label="Plan" value={subscription.planName} />
          <Field label="Started" value={formatDate(subscription.startedAt)} mono />
          <Field label="Trial ends" value={formatDate(subscription.trialEndsAt)} mono />
          <Field label="Current period end" value={formatDate(subscription.currentPeriodEnd)} mono />
          <Field label="Next charge" value={formatDate(subscription.nextChargeAt)} mono />
          <Field label="Cancelled at" value={formatDate(subscription.cancelledAt)} mono />
          <Field
            label="Pending plan change"
            value={subscription.pendingPlanName ? `-> ${subscription.pendingPlanName} (next renewal)` : '-'}
          />
        </dl>
      </Card>

      {actionError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{actionError}</p>}

      <div className="flex flex-wrap gap-3">
        {subscription.status === 'Suspended' && (
          <Button
            onClick={() => {
              setActionError(null);
              reactivateMutation.mutate();
            }}
            disabled={reactivateMutation.isPending}
          >
            Reactivate
          </Button>
        )}
        {canCancel && (
          <Button
            variant="danger"
            onClick={() => {
              setActionError(null);
              cancelMutation.mutate();
            }}
            disabled={cancelMutation.isPending}
          >
            Cancel subscription
          </Button>
        )}
      </div>

      {canChangePlan && otherActivePlans.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Schedule upgrade / downgrade
          </h2>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            Takes effect at the next renewal - the current plan keeps billing until then.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Select a plan</option>
              {otherActivePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <Button
              disabled={!selectedPlanId || planChangeMutation.isPending}
              onClick={() => {
                setActionError(null);
                planChangeMutation.mutate();
              }}
            >
              Schedule change
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className={`text-zinc-900 dark:text-zinc-100 ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}
