import { test, expect, openToday, applyPreset, readScore } from './fixtures';

test.describe('Today: check-in, score and graded shield', () => {
  test('shows a score with a real uncertainty range on first load', async ({ page, profile }) => {
    await openToday(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText("Let's size today to you");
    const card = page.getByRole('region', { name: 'Your load right now' });
    await expect(card).toContainText(/Mostly because you're/);
    // The FOU fix: word inputs must give a range, not a single point
    const range = await card.locator('dt:has-text("Range") + dd').textContent();
    const [lo, hi] = (range ?? '').split('–').map(Number);
    expect(hi - lo).toBeGreaterThan(5);
  });

  test('burnout words turn the shield on and move every deep-work task', async ({ page, profile }) => {
    await openToday(page);
    const result = await applyPreset(page, 'Burnout risk');
    expect(result.cognitive_load_score).toBeGreaterThan(65);

    await expect(page.getByText('Shield on')).toBeVisible();
    const tomorrow = page.getByRole('list', { name: 'Moved to tomorrow' });
    await expect(tomorrow.getByText('Write system architecture documentation')).toBeVisible();
    await expect(tomorrow.getByText('Refactor Karnik-Mendel matrix operations')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Today' }).getByText('Reply to team messages and emails')).toBeVisible();
  });

  test('fresh-morning words keep the full schedule', async ({ page, profile }) => {
    await openToday(page);
    await applyPreset(page, 'Fresh morning');
    expect(await readScore(page)).toBeLessThanOrEqual(35);
    await expect(page.getByText('Shield on')).toHaveCount(0);
    await expect(page.getByText(/Nothing deferred/)).toBeVisible();
  });

  test('a moderate load keeps only the shortest deep-work block', async ({ page, profile }) => {
    await openToday(page);
    // Drained + Relaxed + Restful + Routine lands in the 35–65 band
    for (const word of ['Drained', 'Relaxed', 'Restful', 'Routine']) {
      const response = page.waitForResponse((r) => r.url().includes('/evaluate_load'));
      await page.getByRole('button', { name: word, exact: true }).click();
      await response;
    }
    await expect(page.getByText('Partial shield')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Today' }).getByText('Write system architecture documentation')).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Moved to tomorrow' }).getByText('Refactor Karnik-Mendel matrix operations')
    ).toBeVisible();
  });

  test('numeric sliders replace the words and still update the score', async ({ page, profile }) => {
    await openToday(page);
    await page.getByRole('switch', { name: /Fine-tune with sliders/ }).click();
    const slider = page.getByRole('slider', { name: /Fatigue/ });
    await expect(slider).toBeVisible();
    const response = page.waitForResponse(
      (r) => r.url().includes('/evaluate_load') && (r.request().postData() ?? '').includes('"fatigue_numeric":5')
    );
    await slider.fill('5');
    await response;
  });

  test('a check-in is saved to the 7-day history', async ({ page, profile, api }) => {
    await openToday(page);
    await applyPreset(page, 'Midday crunch');
    await expect(page.getByRole('region', { name: 'Last 7 days' })).toContainText('1 check-in', { timeout: 8_000 });
    const history = await (await api.get(`/api/v1/users/${profile.id}/checkins`)).json();
    expect(history).toHaveLength(1);
    expect(history[0].fatigue_state).toBe('Drained');
  });
});
