/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone mode for Docker & Render, standard serverless for Vercel
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
