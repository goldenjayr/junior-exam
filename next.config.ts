import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Node server from trying to bundle the WASM package.
  serverExternalPackages: ["@electric-sql/pglite"],
  // PGlite needs SharedArrayBuffer. Browsers only expose SAB on
  // cross-origin-isolated documents (localhost is special-cased, which is
  // why SQL exams work in local dev but hang on Vercel/staging).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
