import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use webpack for PWA support (next-pwa requires webpack)
  turbopack: {},
};

export default withPWA(nextConfig);
