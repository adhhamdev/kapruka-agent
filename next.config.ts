import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'kapruka.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kapruka.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'partnercentral.kapruka.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion']
};

export default nextConfig;
