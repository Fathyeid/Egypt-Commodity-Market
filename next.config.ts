import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Factory lessons are built on demand from the shipped sentence corpus.
  outputFileTracingIncludes: {
    "/*": ["./data/tatoeba/*.jsonl.gz"],
    "/**": ["./data/tatoeba/*.jsonl.gz"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
