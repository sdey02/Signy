/** @type {import('next').NextConfig} */

const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    serverExternalPackages: ['canvas', 'pdfjs-dist'],
    transpilePackages: [
        '@react-pdf-viewer/core',
        '@react-pdf-viewer/default-layout',
        '@react-pdf-viewer/full-screen',
        '@react-pdf-viewer/zoom',
    ],
    experimental: {
        // Empty Turbopack config to avoid errors
    },
    async headers() {
        return [
            {
                // Add CORS headers for all API routes
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                ]
            }
        ]
    },
    webpack: (config, { isServer }) => {
        // Handle canvas module in server environment
        if (isServer) {
            // Add canvas to external modules
            config.externals = [...config.externals, 'canvas', 'pdfjs-dist'];
        }
        
        // Add rules for PDF files
        config.module.rules.push({
            test: /\.(pdf)$/i,
            type: 'asset/resource',
        });
        
        return config;
    },
}

module.exports = nextConfig