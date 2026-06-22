import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production" && process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  ...(isProd && { output: "export" }),
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  basePath: isProd ? "/pmp-study-app" : "",
};

export default nextConfig;
