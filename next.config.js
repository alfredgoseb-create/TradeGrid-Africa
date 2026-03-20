/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // CRITICAL: This matches your GitHub repository name
  basePath: '/NamLogix-Africa',
  assetPrefix: '/NamLogix-Africa',
}

module.exports = nextConfig