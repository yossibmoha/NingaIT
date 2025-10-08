/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-pagination',
    'rc-picker',
  ],
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Enable static exports for production
  output: 'standalone',
  // Optimize images
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig

