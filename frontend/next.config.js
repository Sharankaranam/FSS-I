/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Playwright runs its own dev server in a separate folder so it never clashes with `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

module.exports = nextConfig;
