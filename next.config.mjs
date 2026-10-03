/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.articles.media",
                port: "",
            },
            {
                protocol: "https",
                hostname: "articles-website.s3.amazonaws.com",
                port: "",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
