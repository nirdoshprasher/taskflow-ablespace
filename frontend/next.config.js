/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.dicebear.com'],
  },
  // Disable static page generation — all pages are client-only (auth-gated)
  output: undefined,
};

module.exports = nextConfig;
