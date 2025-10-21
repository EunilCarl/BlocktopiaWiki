/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./imagekitLoader.js",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lokegmegfgkpztijdamy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn.worldvectorlogo.com", // for Discord logo
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io", // allow ImageKit
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;
