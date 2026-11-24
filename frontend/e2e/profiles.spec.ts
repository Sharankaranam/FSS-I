import { test, expect, openToday } from './fixtures';

test('creates, switches and renames profiles with separate task lists', async ({ page, profile, api }) => {
  await openToday(page);
  // Give the first profile a task the new one won't have
  await api.post(`/api/v1/users/${profile.id}/tasks`, { data: { title: 'Only in profile A', load_type: 'Low' } });
  await page.reload();
  await expect(page.getByText('Only in profile A')).toBeVisible();

  const menuButton = page.getByRole('complementary').getByRole('button', { name: /E2E/ });
  await menuButton.click();
  await page.getByRole('menuitem', { name: 'New profile' }).click();
  await page.getByLabel('New profile name').fill('Sam');
  await page.getByRole('button', { name: 'Create profile' }).click();

  await expect(page.getByRole('complementary').getByRole('button', { name: /Sam/ })).toBeVisible();
  await expect(page.getByText('Only in profile A')).toHaveCount(0);
  await expect(page.getByText('Write system architecture documentation')).toBeVisible();

  await page.getByRole('complementary').getByRole('button', { name: /Sam/ }).click();
  await page.getByRole('menuitem', { name: 'Rename profile' }).click();
  await page.getByLabel('Profile name').fill('Sam R');
  await page.getByRole('button', { name: 'Save name' }).click();
  await expect(page.getByRole('complementary').getByRole('button', { name: /Sam R/ })).toBeVisible();

  // Clean up the extra profile this test created
  const all = await (await api.get('/api/v1/profiles')).json();
  for (const p of all.filter((x: { name: string }) => x.name === 'Sam R')) await api.delete(`/api/v1/profiles/${p.id}`);
});
