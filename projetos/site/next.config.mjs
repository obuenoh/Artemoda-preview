/** @type {import('next').NextConfig} */
const isPreview = process.env.NEXT_PUBLIC_PREVIEW_ESTATICO === '1';

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: isPreview,
  },
  ...(isPreview && {
    output: 'export',
    basePath: '/Artemoda-preview/site',
  }),
};

export default nextConfig;
