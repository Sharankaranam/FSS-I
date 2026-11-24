import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_URL = 'http://localhost:8001';

type Profile = { id: string; name: string };

/** Each test gets its own profile (with the 5 starter tasks), so tests can run in parallel. */
export const test = base.extend<{ profile: Profile; api: APIRequestContext }>({
  api: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: API_URL });
    await use(ctx);
    await ctx.dispose();
  },
  profile: async ({ api, page }, use, testInfo) => {
    // Neutral name so it never collides with on-screen text the tests look for
    const res = await api.post('/api/v1/profiles', { data: { name: `E2E user ${testInfo.workerIndex}-${Date.now() % 100000}` } });
    expect(res.ok()).toBeTruthy();
    const profile = (await res.json()) as Profile;
    await page.addInitScript(
      ([id]) => {
        if (!localStorage.getItem('fss-profile')) localStorage.setItem('fss-profile', id);
        if (!localStorage.getItem('fss-theme')) localStorage.setItem('fss-theme', 'light');
      },
      [profile.id]
    );
    await use(profile);
    await api.delete(`/api/v1/profiles/${profile.id}`);
  },
});

export { expect };

/** The big score number in the "Your load right now" card. */
export function scoreValue(page: Page) {
  return page.getByRole('region', { name: 'Your load right now' }).locator('.font-display').first();
}

export async function readScore(page: Page) {
  return parseFloat((await scoreValue(page).textContent()) ?? 'NaN');
}

/** Opens the app and waits until the engine has produced a score. */
export async function openToday(page: Page) {
  await page.goto('/');
  await expect(scoreValue(page)).toHaveText(/\d+\.\d/);
}

/** Pick a preset and wait for the engine's answer to be rendered. */
export async function applyPreset(page: Page, name: 'Fresh morning' | 'Midday crunch' | 'Burnout risk') {
  const response = page.waitForResponse((r) => r.url().includes('/api/v1/evaluate_load') && r.ok());
  await page.getByRole('button', { name, exact: true }).click();
  const data = await (await response).json();
  await expect(scoreValue(page)).toHaveText(data.cognitive_load_score.toFixed(1));
  return data as { cognitive_load_score: number; y_left: number; y_right: number };
}

/** Clicks a section in the desktop sidebar. */
export async function goTo(page: Page, section: 'Today' | 'Inference' | 'Method' | 'LiveWell library') {
  await page.getByRole('complementary').getByRole('button', { name: section, exact: true }).click();
}
