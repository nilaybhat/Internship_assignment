import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import TaskList from '../components/features/TaskList';
import TaskForm from '../components/features/TaskForm';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import { getErrorMessage } from '../utils/errors';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();

  const [modal, setModal] = useState({ open: false, mode: 'create', task: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const openCreate = () => {
    setActionError('');
    setModal({ open: true, mode: 'create', task: null });
  };

  const openEdit = (task) => {
    setActionError('');
    setModal({ open: true, mode: 'edit', task });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleSubmit = async (payload) => {
    setActionError('');
    try {
      if (modal.mode === 'edit') {
        await updateTask(modal.task.id, payload);
      } else {
        await createTask(payload);
      }
      closeModal();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save the task.'));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionError('');
    try {
      await deleteTask(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete the task.'));
      setConfirmDelete(null);
    }
  };

  const doneCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} &middot; {doneCount} completed
          </p>
        </div>
        <Button onClick={openCreate}>+ Create task</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={openEdit}
            onDelete={(task) => setConfirmDelete(task)}
          />
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-800">Quick tips</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
            <li>Click <strong>Create task</strong> to add a new item.</li>
            <li>Use <strong>Edit</strong> to change the title, details or status.</li>
            <li>Mark tasks <strong>completed</strong> to track your progress.</li>
          </ul>
        </aside>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={modal.open}
        title={modal.mode === 'edit' ? 'Edit task' : 'Create task'}
        onClose={closeModal}
      >
        {actionError && (
          <div className="mb-4">
            <Alert>{actionError}</Alert>
          </div>
        )}
        <TaskForm
          key={`${modal.mode}-${modal.task?.id ?? 'new'}`}
          initialValues={modal.task ?? {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create task'}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(confirmDelete)}
        title="Delete task"
        onClose={() => setConfirmDelete(null)}
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{confirmDelete?.title}</strong>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}