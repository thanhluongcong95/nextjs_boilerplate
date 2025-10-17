'use client';

import { useState } from 'react';

import { useUserMutations } from '@/app/(protected)/dashboard/hooks/useUserMutations';
import { useUsers } from '@/app/(protected)/dashboard/hooks/useUsers';
import { UserCard } from '@/app/(protected)/dashboard/ui/UserCard';
import { UserForm } from '@/app/(protected)/dashboard/ui/UserForm';
import { useDebounce } from '@/shared/hooks/useDebounce';

export default function UserListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const { filteredUsers, isLoading } = useUsers(useDebounce(searchTerm, 300));
  const { createUser, deleteUser } = useUserMutations();

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Team</h2>
          <p className="text-sm text-slate-500">
            Manage all collaborators assigned to this workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search team members"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </header>

      <UserForm mode="create" onSubmit={createUser} />

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading team…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={() => void deleteUser(user.id)}
            />
          ))}
          {filteredUsers.length === 0 ? (
            <p className="col-span-full text-sm text-slate-500">
              No results match the current filter.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
