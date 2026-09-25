import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { validateTaskTitle } from '../../utils/validators';

/**
 * Create/edit task form. Validates the title client-side and reports
 * API errors via the onSubmit wrapper at the page level.
 */
export default function TaskForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save task' }) {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [status, setStatus] = useState(initialValues.status ?? 'pending');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const titleError = validateTaskTitle(title);
    setFieldErrors({ title: titleError });
    if (titleError) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="task-title"
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        placeholder="What needs to be done?"
        autoComplete="off"
      />
      <Textarea
        id="task-description"
        label="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add more detail..."
      />
      <Select
        id="task-status"
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </Select>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}