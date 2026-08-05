import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { FormSelect } from '../../components/FormSelect';
import type { CreatePlanRequest, Plan } from '../../types';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priceAmount: z.coerce.number().min(0, 'Price cannot be negative'),
  priceCurrency: z
    .string()
    .min(3, 'Use a 3-letter currency code')
    .max(3, 'Use a 3-letter currency code'),
  billingCycle: z.enum(['Monthly', 'Annual']),
  trialDays: z.coerce.number().int().min(0, 'Trial days cannot be negative'),
});

type PlanFormInput = z.input<typeof planSchema>;
type PlanFormOutput = z.output<typeof planSchema>;

interface PlanFormProps {
  initialValue?: Plan;
  onSubmit: (request: CreatePlanRequest) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function PlanForm({ initialValue, onSubmit, onCancel, submitLabel }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormInput, unknown, PlanFormOutput>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialValue?.name ?? '',
      description: initialValue?.description ?? '',
      priceAmount: initialValue?.priceAmount ?? 0,
      priceCurrency: initialValue?.priceCurrency ?? 'BRL',
      billingCycle: initialValue?.billingCycle ?? 'Monthly',
      trialDays: initialValue?.trialDays ?? 0,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, description: values.description || null });
  });

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <FormField label="Name" {...register('name')} error={errors.name?.message} />
      <FormField label="Description" {...register('description')} error={errors.description?.message} />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Price"
          type="number"
          step="0.01"
          {...register('priceAmount')}
          error={errors.priceAmount?.message}
        />
        <FormField label="Currency" {...register('priceCurrency')} error={errors.priceCurrency?.message} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Billing cycle"
          {...register('billingCycle')}
          error={errors.billingCycle?.message}
          options={[
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Annual', label: 'Annual' },
          ]}
        />
        <FormField
          label="Trial days"
          type="number"
          {...register('trialDays')}
          error={errors.trialDays?.message}
        />
      </div>
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
