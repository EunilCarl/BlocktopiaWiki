/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://blocktopia-wiki.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://blocktopia-wiki.vercel.app/sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    // This removes the default Host line
    includeNonIndexSitemaps: false,
  },
};
