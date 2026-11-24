import { test, expect, openToday } from './fixtures';

test.describe('Tasks: add, edit, complete, delete', () => {
  test('adds a task that survives a reload', async ({ page, profile }) => {
    await openToday(page);
    await page.getByRole('button', { name: 'Add task' }).click();
    const form = page.getByRole('form', { name: 'Add task' });
    await form.getByLabel('Task title').fill('Prepare thesis slides');
    await form.getByLabel('Category').fill('Writing');
    await form.getByRole('radio', { name: 'Low' }).click();
    await form.getByLabel('Estimated minutes').fill('40');
    await form.getByRole('button', { name: 'Add task' }).click();

    const today = page.getByRole('list', { name: 'Today' });
    await expect(today.getByText('Prepare thesis slides')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('list', { name: 'Today' }).getByText('Prepare thesis slides')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Today' }).getByText('Writing')).toBeVisible();
  });

  test('refuses a task without a name', async ({ page, profile }) => {
    await openToday(page);
    await page.getByRole('button', { name: 'Add task' }).click();
    const form = page.getByRole('form', { name: 'Add task' });
    await form.getByRole('button', { name: 'Add task' }).click();
    await expect(form.getByRole('alert')).toHaveText('Give the task a name.');
  });

  test('completing a task persists and moves it to the bottom', async ({ page, profile }) => {
    await openToday(page);
    const box = page.getByRole('checkbox', { name: 'Mark "Reply to team messages and emails" as done' });
    await box.click();
    await expect(page.getByRole('checkbox', { name: 'Mark "Reply to team messages and emails" as not done' })).toBeChecked();
    await page.reload();
    const today = page.getByRole('list', { name: 'Today' });
    await expect(today.getByRole('listitem').last()).toContainText('Reply to team messages and emails');
  });

  test('edits and deletes a task', async ({ page, profile }) => {
    await openToday(page);
    const row = page.getByRole('listitem').filter({ hasText: 'Organize desktop and workspace files' });
    await row.hover();
    await row.getByRole('button', { name: /^Edit/ }).click();
    const form = page.getByRole('form', { name: 'Save changes' });
    await form.getByLabel('Task title').fill('Tidy the lab bench');
    await form.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Tidy the lab bench')).toBeVisible();

    const edited = page.getByRole('listitem').filter({ hasText: 'Tidy the lab bench' });
    await edited.hover();
    await edited.getByRole('button', { name: /^Delete/ }).click();
    await expect(page.getByText('Tidy the lab bench')).toHaveCount(0);
    await page.reload();
    await expect(page.getByText('Tidy the lab bench')).toHaveCount(0);
  });
});
