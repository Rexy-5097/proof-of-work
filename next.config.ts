import type { NextConfig } from "next";

const buildSha =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_SHA: buildSha,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
