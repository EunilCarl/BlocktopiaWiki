
import ItemPage from "./ItemPage";
import { supabase } from "@/lib/supabaseClient";

export async function generateMetadata({ params }) {
  const rawSlug = params.slug ? params.slug.join("/") : "";
  const decodedSlug = decodeURIComponent(rawSlug);

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .like("image", `${decodedSlug}.%`)
    .single();

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
      images: item?.image
        ? [`${supabase.storage.from("items").getPublicUrl(item.image).data.publicUrl}?width=1200&height=630&resize=cover`]
        : ["/logo-v1.webp"],
    },
    twitter: {
      card: "summary_large_image",
      title: item ? `${item.name} | Blocktopia Wiki` : "Blocktopia Wiki",
      description:
        item?.description ||
        "Blocktopia Wiki: Master splicing, find every item, and learn the best farmable secrets in the ultimate Roblox-style sandbox MMORPG.",
      images: item?.image
        ? [`${supabase.storage.from("items").getPublicUrl(item.image).data.publicUrl}?width=1200&height=630&resize=cover`]
        : ["/logo-v1.webp"],
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

  return <ItemPage item={item} />;
}