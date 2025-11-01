/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.gstatic.com', 'encrypted-tbn0.gstatic.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
