export default function imagekitLoader({ src, width, quality }) {
  const baseTransform = `w-${width},q-${quality || 75},f-auto`;

  if (
    src.startsWith("/") &&
    !src.startsWith("/items/") && // exclude cloud asset folders
    !src.startsWith("/uploads/")
  ) {
    return src;
  }

    if (
    src.startsWith("https://cdn.worldvectorlogo.com") ||
    src.startsWith("https://lokegmegfgkpztijdamy.supabase.co")
    ) {
    return `${src}?w=${width}`; // hint width to Next.js, no compression
    }

  if (src.startsWith("https://ik.imagekit.io/")) {
    const hasTransform = src.includes("?tr=");
    return hasTransform
      ? `${src},${baseTransform}`
      : `${src}?tr=${baseTransform}`;
  }

  // 🔹 4. Default: assume relative path in ImageKit
  const cleanSrc = src.replace(/^\/+/, "");
  return `https://ik.imagekit.io/6j61dmdpg/${cleanSrc}?tr=${baseTransform}`;
}
