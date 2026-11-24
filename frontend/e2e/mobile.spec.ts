import { test, expect, openToday, applyPreset } from './fixtures';

test('phone layout: top bar navigation, check-in and plan all work', async ({ page, profile }) => {
  await openToday(page);
  await expect(page.getByRole('complementary')).toBeHidden(); // desktop sidebar hidden
  const result = await applyPreset(page, 'Burnout risk');
  await expect(page.getByRole('banner')).toContainText(String(Math.round(result.cognitive_load_score)));
  await expect(page.getByText('Shield on')).toBeVisible();

  await page.getByRole('banner').getByRole('button', { name: 'Inference', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Footprint of uncertainty' })).toBeVisible();

  // No horizontal scrolling on a phone
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
