/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]'
      }
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.31.71.124:5000",
  },
  async rewrites() {
    return [
      {
        source: "/api/public/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.31.71.124:5000"
        }/api/public/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.31.71.124:5000"
        }/api/:path*`,
      },
    ];
  },
  // redirects configuration
  async redirects() {
    return [
      {
        source: "/",
        destination: "/main-menu",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/main-menu/login",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;