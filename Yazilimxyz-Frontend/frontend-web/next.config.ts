/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost', port: '7206', pathname: '/**' },
      { protocol: 'http',  hostname: 'localhost', port: '7206', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;