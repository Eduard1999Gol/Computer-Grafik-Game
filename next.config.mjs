import process from "process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Outputs a Single-Page Application (SPA).
  distDir: "./dist", // Changes the build output directory to `./dist/`.
  reactStrictMode: false,
  trailingSlash: true, // Adds a trailing slash to the end of URLs as this page is hosted on GitLab Pages.

  eslint: {
    ignoreDuringBuilds: true, // only for builds so that we can deploy even if there are lint errors
  },

  typescript: {
    ignoreBuildErrors: true, // only for builds so that we can deploy even if there are type errors
  },

  // gitlab passes full path but next expects only the path
  basePath: process.env.CI_PAGES_URL
    ? new URL(process.env.CI_PAGES_URL).pathname === "/"
      ? ""
      : new URL(process.env.CI_PAGES_URL).pathname
    : "",

  webpack(config, { isServer }) {
    // webpack raw-loader for glsl
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag|wgsl)$/,
      use: ["raw-loader"],
    });

    // webpack file-loader for glb, hdr
    config.module.rules.push({
      test: /\.(glb|hdr)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/assets/",
            outputPath: "static/assets/",
            name: "[name].[ext]",
            esModule: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
