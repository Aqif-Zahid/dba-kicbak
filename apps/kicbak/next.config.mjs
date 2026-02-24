/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  rewrites: async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    return [
      // Proxy API routes to the shared backend
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
      // Existing rewrite
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODEMAILER_HOST: process.env.NODEMAILER_HOST,
    NODEMAILER_PORT: process.env.NODEMAILER_PORT,
    NODEMAILER_SECURE: process.env.NODEMAILER_SECURE,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
  },
};

export default nextConfig;
