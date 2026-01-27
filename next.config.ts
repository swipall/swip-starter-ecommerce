import {NextConfig} from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        // This is necessary to display images from your Swipall instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'localhost'
            },
            {
                hostname: 'mmcbv4.b-cdn.net'
            },
            {
                hostname: 'mmcb.b-cdn.net'
            },
            {
                hostname: 'swip-catalogs-443115567646.us-central1.run.app'
            }
        ],
    },
    experimental: {
        rootParams: true
    }
};

export default nextConfig;