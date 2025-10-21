// For OpenNext Cloudflare, dev platform setup is handled automatically
// No additional setup needed in next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@opennextjs/cloudflare"],
  },
};

export default nextConfig;
