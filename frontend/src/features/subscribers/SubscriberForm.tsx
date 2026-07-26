import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
      className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <FormField label="Name" {...register('name')} error={errors.name?.message} />
      <FormField label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitLabel}
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
