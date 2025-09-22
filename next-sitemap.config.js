/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://blocktopia-wiki.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [
      'https://blocktopia-wiki.vercel.app/sitemap.xml',
    ],
    transform: async (config, path) => {
      // Return exactly what you want
      return `# *
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://blocktopia-wiki.vercel.app/sitemap.xml`;
    },
  },
};
