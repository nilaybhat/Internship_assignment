import { useCallback, useEffect, useState } from 'react';
import { taskApi } from '../services/api';
import { getErrorMessage } from '../utils/errors';

/**
 * Task list state + CRUD actions, kept close to the pages that use them.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await taskApi.list();
        if (cancelled) return;
        setTasks(data.data);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Could not load your tasks.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const createTask = useCallback(async (payload) => {
    const { data } = await taskApi.create(payload);
    setTasks((prev) => [data.data, ...prev]);
    return data.data;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const { data } = await taskApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? data.data : t)));
    return data.data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskApi.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, createTask, updateTask, deleteTask };
}