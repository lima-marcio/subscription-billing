import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
      className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
