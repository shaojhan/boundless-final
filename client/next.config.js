/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    silenceDeprecations: ['import'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'http', hostname: 'localhost', port: '3005' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // comment for render twice issue
  // avoid cors with proxy
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3005/:path*', // Proxy to Backend
  //     },
  //   ]
  // },
}

module.exports = nextConfig
