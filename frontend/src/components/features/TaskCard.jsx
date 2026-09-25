import Button from '../ui/Button';

const badgeStyles = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export default function TaskCard({ task, onEdit, onDelete, ownerName }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-500">{task.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${badgeStyles[task.status] ?? badgeStyles.pending}`}
        >
          {task.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {ownerName && <span>by {ownerName}</span>}
          {ownerName && <span aria-hidden="true">&middot;</span>}
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(task)}>
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}