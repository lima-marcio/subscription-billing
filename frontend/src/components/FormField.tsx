import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      <input
        {...inputProps}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
