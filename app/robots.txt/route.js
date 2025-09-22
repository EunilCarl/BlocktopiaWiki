// app/robots.txt/route.js
export async function GET() {
  const content = `
User-agent: *
Allow: /

Sitemap: https://blocktopia-wiki.vercel.app/sitemap.xml
`;
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
