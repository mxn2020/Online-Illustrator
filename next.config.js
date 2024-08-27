/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Static Export
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
