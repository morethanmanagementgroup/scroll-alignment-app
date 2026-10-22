/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // The place dataset is read from disk at runtime; make sure Vercel ships it
    // with the routes that need it.
    outputFileTracingIncludes: {
      '/api/places/search': ['./data/cities.json'],
      '/api/birth/confirm': ['./data/cities.json', './data/tz-transitions.json'],
    },
  },
}
module.exports = nextConfig
