/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'img.youtube.com', 'ui-avatars.com'],
  },
  env: {
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
  },
}

module.exports = nextConfig