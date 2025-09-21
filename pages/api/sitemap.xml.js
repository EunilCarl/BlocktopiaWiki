import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  const { data: items, error } = await supabase
    .from("items")
    .select("image");

  if (error) {
    console.error("Error fetching items for sitemap:", error.message);
    res.status(500).send("Error generating sitemap");
    return;
  }

  const baseUrl = "https://blocktopia-wiki.vercel.app";

  // turn Supabase image path into slug
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

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${urls}
    </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();
}
