import type { TUser } from '../model/users.schemas';

type Props = {
  user: TUser;
  onEdit?: (user: TUser) => void;
  onDelete?: (user: TUser) => void;
};

export function UserCard({ user, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{user.name}</h3>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            user.status === 'active'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {user.status}
        </span>
      </header>
      <footer className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <button
          className="font-medium text-indigo-600"
          onClick={() => onEdit?.(user)}
          type="button"
        >
          Edit
        </button>
        <button
          className="font-medium text-rose-600"
          onClick={() => onDelete?.(user)}
          type="button"
        >
          Delete
        </button>
      </footer>
    </article>
  );
}
