import { useEffect, useState } from 'react';
import { taskApi, userApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { getErrorMessage } from '../utils/errors';

const roleBadge = (role) =>
  role === 'ADMIN'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-slate-100 text-slate-600';

export default function AdminDashboardPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [usersRes, tasksRes] = await Promise.all([userApi.list(), taskApi.list()]);
        if (cancelled) return;
        setUsers(usersRes.data.data);
        setTasks(tasksRes.data.data);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Could not load admin data.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all of their tasks?')) return;
    setError('');
    try {
      await userApi.remove(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTasks((prev) => prev.filter((t) => t.userId !== userId));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete the user.'));
    }
  };

  if (loading) return <Spinner label="Loading admin data" />;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of all users and tasks across the system.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={users.length} accent="indigo" />
        <StatCard label="Total tasks" value={tasks.length} accent="emerald" />
        <StatCard label="Completed tasks" value={completedTasks} accent="amber" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-800">Users</h2>
        {users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Tasks</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${roleBadge(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.taskCount}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {me.id !== user.id && user.role !== 'ADMIN' && (
                          <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-800">All tasks</h2>
        {tasks.length === 0 ? (
          <EmptyState title="No tasks in the system yet" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                      <td className="px-4 py-3 text-slate-500">{task.user?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}