/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://demo.cliquecart.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
};
