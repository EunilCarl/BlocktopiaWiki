// app/massguide/page.jsx
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MassGuidePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const favoritesKey = "mass-guide-favorites"; 

  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem(favoritesKey);
      return storedFavorites ? new Set(JSON.parse(storedFavorites)) : new Set();
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
      return new Set();
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(
        favoritesKey,
        JSON.stringify(Array.from(favorites))
      );
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const getImageUrl = (path) => (path ? `/items/${path}` : "");

  const toggleFavorite = (itemId, itemName) => {
    // Determine if we are adding or removing before updating state
    const isCurrentlyFavorite = favorites.has(itemId);

    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (isCurrentlyFavorite) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });

    if (isCurrentlyFavorite) {
      toast(`${itemName} removed from favorites.`); // Show removal toast
    } else {
      toast.success(`${itemName} added to favorites!`); // Show success toast
    }
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.splicing &&
        item.splicing !== "N/A" &&
        (item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.splicing.toLowerCase().includes(search.toLowerCase()))
    )
    .filter((item) => {
      if (filter === "favorites") {
        return favorites.has(item.id);
      }
      return true; // 'all' filter shows everything
    })
    //  ADDED: Sorting logic (favorites first, then alphabetically)
    .sort((a, b) => {
      const aIsFav = favorites.has(a.id);
      const bIsFav = favorites.has(b.id);
      if (aIsFav && !bIsFav) return -1; // a (fav) comes before b (not fav)
      if (!aIsFav && bIsFav) return 1; // b (fav) comes before a (not fav)
      return a.name.localeCompare(b.name); // Otherwise, sort alphabetically
    });

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

      <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or recipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border-gray-300 dark:border-gray-700"
          />
        </div>

        {/* Filter Dropdown */}
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {filter === "favorites"
            ? "You haven't favorited any items yet."
            : `No items found matching "${search}".`}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            // Wrap Link content in a div to handle relative positioning for the star
            <div key={item.id} className="relative">
              <Link href={`/mass-guide/${item.id}`}>
                <Card className="group cursor-pointer transition h-full hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-blue-900/40">
                  <CardHeader className="flex flex-row items-center gap-3 pr-12">
                    {" "}
                    {/* Added padding for star */}
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      width={40}
                      height={40}
                      quality={70}
                      className="rounded-md border dark:border-gray-700 object-contain bg-white flex-shrink-0"
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

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-gray-400 hover:text-yellow-500 h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  e.preventDefault(); // Prevent link navigation
                  toggleFavorite(item.id, item.name);
                }}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors cursor-pointer",
                    favorites.has(item.id)
                      ? "text-yellow-500 fill-yellow-500" // Filled yellow
                      : "text-gray-400 fill-none" // Outline black/gray
                  )}
                />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}