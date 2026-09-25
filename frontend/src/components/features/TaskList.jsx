import TaskCard from './TaskCard';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';

export default function TaskList({ tasks, loading, error, onEdit, onDelete, showOwner = false }) {
  if (loading) {
    return <Spinner label="Loading tasks" />;
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to get started. Everything you add shows up here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          ownerName={showOwner ? task.user?.name : undefined}
        />
      ))}
    </ul>
  );
}