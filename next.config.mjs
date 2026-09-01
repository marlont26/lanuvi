/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The mock catalog ships SVG artwork, which the Next image optimizer refuses
    // to process; serving it as-is keeps `next/image` usable everywhere.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
