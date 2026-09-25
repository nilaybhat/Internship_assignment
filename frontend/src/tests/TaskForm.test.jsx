import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/features/TaskForm';

describe('TaskForm', () => {
  it('renders the title, description and status fields', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
  });

  it('blocks submission with an empty title (client-side validation)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save task' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered title, description and status', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Title'), 'Ship the feature');
    await user.type(screen.getByLabelText('Description (optional)'), 'Make it great');
    await user.selectOptions(screen.getByLabelText('Status'), 'completed');
    await user.click(screen.getByRole('button', { name: 'Save task' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Ship the feature',
      description: 'Make it great',
      status: 'completed',
    });
  });
});