import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login as loginApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const response = await loginApi(values);
      login(response.token);
      navigate('/plans', { replace: true });
    } catch {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent-600 text-sm font-semibold text-white">
            SB
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Admin sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Username" autoFocus {...register('username')} error={errors.username?.message} />
          <FormField
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />

          {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
