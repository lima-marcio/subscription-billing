import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { FormSelect } from '../../components/FormSelect';
import type { CreateSubscriptionRequest } from '../../types';
import { getPlans } from '../plans/api';
import { getSubscribers } from '../subscribers/api';

const schema = z.object({
  subscriberId: z.string().min(1, 'Select a subscriber'),
  planId: z.string().min(1, 'Select a plan'),
});

type FormValues = z.infer<typeof schema>;

interface CreateSubscriptionFormProps {
  onSubmit: (request: CreateSubscriptionRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateSubscriptionForm({ onSubmit, onCancel }: CreateSubscriptionFormProps) {
  const { data: subscribers } = useQuery({ queryKey: ['subscribers'], queryFn: getSubscribers });
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const activePlans = plans?.filter((plan) => !plan.isArchived) ?? [];

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <FormSelect
        label="Subscriber"
        {...register('subscriberId')}
        error={errors.subscriberId?.message}
        options={[
          { value: '', label: 'Select a subscriber' },
          ...(subscribers?.map((s) => ({ value: s.id, label: `${s.name} (${s.email})` })) ?? []),
        ]}
      />
      <FormSelect
        label="Plan"
        {...register('planId')}
        error={errors.planId?.message}
        options={[
          { value: '', label: 'Select a plan' },
          ...activePlans.map((p) => ({ value: p.id, label: p.name })),
        ]}
      />
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          Create
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
