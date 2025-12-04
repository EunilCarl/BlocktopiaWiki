
import ItemPage from "./ItemPage";
import { supabase } from "@/lib/supabaseClient";

const IMAGEKIT_BASE_URL = "https://ik.imagekit.io/6j61dmdpg/items"

export async function generateMetadata({ params }) {
  const rawSlug = params?.slug?.join("/") ?? "";
  const decodedSlug = decodeURIComponent(rawSlug);

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .like("image", `${decodedSlug}.%`)
    .single();

    const imageUrl = item?.image
    ? `${IMAGEKIT_BASE_URL}/${item.image}?tr=w-1200,h-630,fo-auto`
    : "/logo-v1.webp";

 return {
    title: item ? `${item.name} | Blocktopia Wiki` : "Blocktopia Wiki",
    description:
      item?.description ||
      "Blocktopia Wiki: Master splicing, find every item, and learn the best farmable secrets in the ultimate Roblox-style sandbox MMORPG.",
    openGraph: {
      type: "website",
      url: `https://blocktopia-wiki.vercel.app/items/${encodeURIComponent(
        item?.name || ""
      )}`,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: item ? `${item.name} | Blocktopia Wiki` : "Blocktopia Wiki",
      description:
        item?.description ||
        "Blocktopia Wiki: Master splicing, find every item, and learn the best farmable secrets in the ultimate Roblox-style sandbox MMORPG.",
      images: [imageUrl],
    },
  };
}

export default async function ItemPageWrapper({ params }) {
  // Join path parts in case image path has folders
  const rawSlug = params.slug ? params.slug.join("/") : "";
  const decodedSlug = decodeURIComponent(rawSlug); // handle %20 etc.

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .like("image", `${decodedSlug}.%`) // match with extension
    .single();

    if (item?.image) {
    item.fullImageUrl = `${IMAGEKIT_BASE_URL}/${item.image}`;
  }
  
  return <ItemPage item={item} />;
}