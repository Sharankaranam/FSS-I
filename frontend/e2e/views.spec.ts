import { test, expect, openToday, goTo, applyPreset } from './fixtures';

test.describe('Inference, Method and Library views', () => {
  test('inference shows the chart and rule firings', async ({ page, profile }) => {
    await openToday(page);
    await applyPreset(page, 'Fresh morning'); // fires only some of the 12 rules
    await goTo(page, 'Inference');
    await expect(page.getByRole('heading', { level: 1, name: 'Footprint of uncertainty' })).toBeVisible();
    await expect(page.locator('.recharts-line-curve').first()).toBeVisible();

    const rules = page.getByRole('heading', { name: 'Rule firings' }).locator('xpath=ancestor::div[contains(@class,"card")]');
    await expect(rules.getByRole('listitem')).toHaveCount(7);
    await page.getByRole('button', { name: 'Show 5 inactive' }).click();
    await expect(rules.getByRole('listitem')).toHaveCount(12);
    await expect(page.getByRole('button', { name: 'Hide inactive' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('method tabs switch with clicks and arrow keys', async ({ page, profile }) => {
    await openToday(page);
    await goTo(page, 'Method');
    const sets = page.getByRole('tab', { name: 'Membership sets' });
    const rules = page.getByRole('tab', { name: 'Rule base' });
    await expect(sets).toHaveAttribute('aria-selected', 'true');

    await rules.click();
    await expect(rules).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('list', { name: 'Rules' }).getByRole('listitem')).toHaveCount(12);

    await rules.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(sets).toHaveAttribute('aria-selected', 'true');
    await expect(sets).toBeFocused();
    await expect(page.getByRole('heading', { level: 2, name: 'Fatigue' })).toBeVisible();
  });

  test('library quiz shows the medical notice and scores answers', async ({ page, profile }) => {
    await openToday(page);
    await goTo(page, 'LiveWell library');
    await page.getByRole('tab', { name: 'Screening' }).click();
    await expect(page.getByRole('note')).toContainText('not medical advice');

    const score = page.getByRole('button', { name: 'Score my answers' });
    await expect(score).toBeDisabled();
    const groups = page.getByRole('radiogroup', { name: /Answer to question/ });
    await expect(groups.first()).toBeVisible();
    const n = await groups.count();
    for (let i = 0; i < n; i++) await groups.nth(i).getByRole('radio').last().click();
    await expect(page.getByText(`${n} of ${n} answered`)).toBeVisible();

    await score.click();
    const result = page.getByRole('region', { name: 'Result' });
    await expect(result).toContainText('What it means');
    await expect(result).toContainText(/risk/i);
  });

  test('theme toggle switches to dark and remembers it', async ({ page, profile }) => {
    await openToday(page);
    await page.getByRole('complementary').getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
