/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Deshabilitar para evitar doble montaje en desarrollo
  basePath: process.env.BASEPATH,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*' // Proxy to backend
      }
    ]
  }
}

export default nextConfig
