import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * End-to-end tests run against their own backend (8001) and frontend (3001), so they never
 * touch the dev servers or your real data:
 *  - planner.db is a fresh file per run
 *  - livewell.db is a throwaway copy (quiz scoring writes assessments)
 */
const API_PORT = 8001;
const WEB_PORT = 3001;
const tmp = path.join(__dirname, 'e2e', '.tmp');
const python = process.env.FSS_PYTHON ?? path.join(__dirname, '..', 'backend', '.venv', 'bin', 'python');

export const API_URL = `http://localhost:${API_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /mobile\.spec\.ts/,
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: [
    {
      command: [
        `mkdir -p "${tmp}"`,
        `cp ../backend/database/livewell.db "${tmp}/livewell.db"`,
        `rm -f "${tmp}/planner.db"`,
        `"${python}" -m uvicorn main:app --port ${API_PORT} --app-dir ../backend`,
      ].join(' && '),
      url: `${API_URL}/api/v1/health`,
      env: {
        FSS_PLANNER_DB: path.join(tmp, 'planner.db'),
        FSS_LIVEWELL_DB: path.join(tmp, 'livewell.db'),
      },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx next dev -p ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}`,
      env: { NEXT_DIST_DIR: '.next-e2e', NEXT_PUBLIC_API_URL: API_URL },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
