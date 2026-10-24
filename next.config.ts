import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully self-hosted with a local SQLite database.
  output: "standalone",
  // @libsql/client ships a native binding — keep it external from the server bundle.
  serverExternalPackages: ["@libsql/client"],
  images: {
    unoptimized: true,
  },
  // Type checking is a separate `pnpm typecheck` step (the build sandbox here
  // cannot spawn the tsc worker process).
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/products", destination: "/zh/products", permanent: false },
      { source: "/products/:slug", destination: "/zh/products/:slug", permanent: false },
      { source: "/cart", destination: "/zh/cart", permanent: false },
      { source: "/checkout", destination: "/zh/checkout", permanent: false },
      { source: "/account", destination: "/zh/account", permanent: false },
    ];
  },
};

export default nextConfig;
