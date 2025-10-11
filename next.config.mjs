/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },
};
export default nextConfig;
