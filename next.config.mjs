/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app runs fully client-side (IndexedDB). No server features required.
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
