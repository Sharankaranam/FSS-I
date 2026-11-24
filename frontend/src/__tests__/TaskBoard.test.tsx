import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskBoard } from '../components/TaskBoard';
import { task } from './fixtures';

const tasks = [
  task({ title: 'Architecture doc', load_type: 'High', estimated_mins: 90 }),
  task({ title: 'Reply to email', load_type: 'Low', estimated_mins: 20 }),
];

function setup(score: number | null) {
  const handlers = {
    onAdd: vi.fn().mockResolvedValue(undefined),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };
  render(<TaskBoard tasks={tasks} cognitiveLoadScore={score} {...handlers} />);
  return handlers;
}

const column = (name: string) => screen.getByText(name, { selector: 'span' }).closest('div')!.parentElement!;

describe('TaskBoard', () => {
  it('moves deep work to tomorrow and shows the shield when load is critical', () => {
    setup(80);
    expect(screen.getByText('Shield on')).toBeInTheDocument();
    expect(within(column('Moved to tomorrow')).getByText('Architecture doc')).toBeInTheDocument();
    expect(within(column('Today')).getByText('Reply to email')).toBeInTheDocument();
  });

  it('keeps the full plan when load is low', () => {
    setup(20);
    expect(screen.queryByText('Shield on')).not.toBeInTheDocument();
    expect(within(column('Today')).getByText('Architecture doc')).toBeInTheDocument();
    expect(screen.getByText('No tasks deferred.')).toBeInTheDocument();
  });

  it('adds a task through the form', async () => {
    const user = userEvent.setup();
    const { onAdd } = setup(20);
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.type(screen.getByLabelText('Task title'), 'Prepare slides');
    await user.click(screen.getByRole('button', { name: 'High' }));
    await user.clear(screen.getByLabelText('Estimated minutes'));
    await user.type(screen.getByLabelText('Estimated minutes'), '50');
    const form = screen.getByLabelText('Task title').closest('form')!;
    await user.click(within(form).getByRole('button', { name: 'Add task' }));
    expect(onAdd).toHaveBeenCalledWith({
      title: 'Prepare slides',
      category: 'General',
      load_type: 'High',
      estimated_mins: 50,
    });
  });

  it('refuses an empty title', async () => {
    const user = userEvent.setup();
    const { onAdd } = setup(20);
    await user.click(screen.getByRole('button', { name: /add task/i }));
    const form = screen.getByLabelText('Task title').closest('form')!;
    await user.click(within(form).getByRole('button', { name: 'Add task' }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('Give the task a name.')).toBeInTheDocument();
  });

  it('toggles and deletes tasks', async () => {
    const user = userEvent.setup();
    const { onUpdate, onDelete } = setup(20);
    await user.click(screen.getByRole('checkbox', { name: /mark "reply to email" as done/i }));
    expect(onUpdate).toHaveBeenCalledWith(tasks[1].id, { done: true });
    await user.click(screen.getByRole('button', { name: 'Delete "Reply to email"' }));
    expect(onDelete).toHaveBeenCalledWith(tasks[1].id);
  });
});
