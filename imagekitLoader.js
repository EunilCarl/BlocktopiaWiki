// imagekitLoader.js
export default function imagekitLoader({ src, width, quality }) {
  const baseTransform = `w-${width},q-${quality || 75},f-auto`;

  if (
    src.startsWith("/") &&
    !src.startsWith("/items/") && // exclude ImageKit paths
    !src.startsWith("/uploads/") // exclude other cloud folders
  ) {
    return src;
  }

  if (src.startsWith("https://ik.imagekit.io/")) {
    const hasTransform = src.includes("?tr=");
    return hasTransform
      ? `${src},${baseTransform}`
      : `${src}?tr=${baseTransform}`;
  }

  const cleanSrc = src.replace(/^\/+/, ""); // remove leading slashes
  return `https://ik.imagekit.io/6j61dmdpg/${cleanSrc}?tr=${baseTransform}`;
}
