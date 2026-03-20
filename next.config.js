/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: '/NamLogix-Africa',
  assetPrefix: '/NamLogix-Africa',
  trailingSlash: true,
}

module.exports = nextConfig