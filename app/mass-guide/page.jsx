// app/massguide/page.jsx
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function MassGuidePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items from Supabase
  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("items").select("*");
      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }
    fetchItems();
  }, []);

  const getImageUrl = (path) =>
    path ? `https://ik.imagekit.io/6j61dmdpg/items/${path}?tr=f-auto,q-70` : "";

  const splicableItems = items.filter(
    (item) =>
      item.splicing &&
      item.splicing !== "N/A" &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.splicing.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">
          ❌ Failed to load items: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center tracking-tight">
        Mass Guide
      </h1>

      {/* Search Bar */}
      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or recipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      {splicableItems.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No items found matching "{search}".
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {splicableItems.map((item) => (
            <Link key={item.id} href={`/mass-guide/${item.id}`}>
              <Card className="group cursor-pointer transition hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-blue-900/40">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    width={40}
                    height={40}
                    quality={70}
                    className="rounded-md border dark:border-gray-700 object-contain bg-white"
                    loading="lazy"
                  />
                  <CardTitle className="text-lg font-semibold group-hover:text-blue-500 transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Recipe:</p>
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {item.splicing}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
