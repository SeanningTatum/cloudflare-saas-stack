import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

await initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@opennextjs/cloudflare"],
  },
};

export default nextConfig;
