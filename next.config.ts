/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the 'experimental' block for Next.js 14
  experimental: {
    ppr: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

module.exports = nextConfig;
