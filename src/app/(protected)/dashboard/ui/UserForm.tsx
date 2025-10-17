'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';

import type {
  TCreateUserPayload,
  TUpdateUserPayload,
  TUser,
} from '../model/users.schemas';
import { createUserPayloadSchema, updateUserPayloadSchema } from '../model/users.schemas';

type CreateProps = {
  mode: 'create';
  defaultValues?: undefined;
  onSubmit: (payload: TCreateUserPayload) => Promise<unknown> | unknown;
  onCancel?: () => void;
};

type EditProps = {
  mode: 'edit';
  defaultValues: TUser;
  onSubmit: (payload: TUpdateUserPayload) => Promise<unknown> | unknown;
  onCancel?: () => void;
};

type Props = CreateProps | EditProps;

export function UserForm({ mode, defaultValues, onSubmit, onCancel }: Props) {
  const [formValues, setFormValues] = useState<{
    name: string;
    email: string;
    status: 'active' | 'inactive';
  }>({
    name: defaultValues?.name ?? '',
    email: defaultValues?.email ?? '',
    status: defaultValues?.status ?? 'active',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const result = createUserPayloadSchema.safeParse(formValues);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? 'Invalid data');
          return;
        }

        await onSubmit(result.data);
        setFormValues({ name: '', email: '', status: 'active' });
      } else {
        const result = updateUserPayloadSchema.safeParse(formValues);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? 'Invalid data');
          return;
        }

        await onSubmit(result.data);
      }
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to submit form'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        label="Full name"
        value={formValues.name}
        onChange={event =>
          setFormValues(values => ({ ...values, name: event.target.value }))
        }
        required
      />
      <Input
        id="email"
        type="email"
        label="Email"
        value={formValues.email}
        onChange={event =>
          setFormValues(values => ({ ...values, email: event.target.value }))
        }
        required
      />
      <label className="flex flex-col gap-1 text-sm text-slate-600">
        Status
        <select
          value={formValues.status}
          onChange={event =>
            setFormValues(values => ({
              ...values,
              status: event.target.value as 'active' | 'inactive',
            }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      {error ? (
        <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
