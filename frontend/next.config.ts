import type { NextConfig } from "next";

// Only enable static export + basePath when deploying via GitHub Actions
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: isGitHubPages,
  basePath: isGitHubPages ? "/pmp-study-app" : "",
  assetPrefix: isGitHubPages ? "/pmp-study-app/" : "",
};

export default nextConfig;
