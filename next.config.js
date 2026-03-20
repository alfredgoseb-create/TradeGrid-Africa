/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // THIS IS THE MISSING PIECE
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: '/NamLogix-Africa',
  assetPrefix: '/NamLogix-Africa',
  trailingSlash: true,
}

module.exports = nextConfig