// pages/sitemap.xml.js
import { supabase } from "@/lib/supabaseClient";

function generateSiteMap(items) {
  const baseUrl = "https://blocktopia-wiki.vercel.app";

  const urls = items
    .map((item) => {
      const slug = item.image.replace(/\.[^/.]+$/, ""); // remove extension
      return `
        <url>
          <loc>${baseUrl}/items/${slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${urls}
    </urlset>`;
}

export async function getServerSideProps({ res }) {
  const { data: items, error } = await supabase.from("items").select("image");

  if (error) {
    console.error("Error fetching items for sitemap:", error.message);
  }

  const sitemap = generateSiteMap(items || []);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
