import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import type { CreateSubscriberRequest, Subscriber } from '../../types';

const subscriberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

interface SubscriberFormProps {
  initialValue?: Subscriber;
  onSubmit: (request: CreateSubscriberRequest) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function SubscriberForm({ initialValue, onSubmit, onCancel, submitLabel }: SubscriberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      name: initialValue?.name ?? '',
      email: initialValue?.email ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <FormField label="Name" {...register('name')} error={errors.name?.message} />
      <FormField label="Email" type="email" {...register('email')} error={errors.email?.message} />
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
