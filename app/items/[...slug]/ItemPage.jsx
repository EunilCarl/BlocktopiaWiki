"use client";

import React, { useState, useEffect, useRef } from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import rarityColors from "@/data/rarityColors";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import CommunityThreads from "@/components/CommunityThreads";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import WelcomeCard from "@/components/WelcomeCard";
import Script from "next/script";
import Image from "next/image";
export default function ItemPage({ item }) {
  const slugify = (str = "") =>
    str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/[^\w-]+/g, ""); // remove special chars

  const pathname = usePathname();
  const currentUrl = `https://blocktopia-wiki.vercel.app${pathname}`;
  const [selectedItem, setSelectedItem] = useState(item);
  const [searchQuery, setSearchQuery] = useState("");
  const [value, setValue] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  const Section = ({ title, children }) => (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
  useEffect(() => {
    if (!selectedItem || window.innerWidth >= 1024) return;

    const scrollToCard = () => {
      if (cardRef.current) {
        const yOffset = -130;
        const y =
          cardRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };

    // Wait for DOM to paint the selected card
    requestAnimationFrame(() => {
      scrollToCard();
    });

    // In case animations or motion div delays rendering, also do a slight timeout
    const timer = setTimeout(() => {
      scrollToCard();
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedItem]);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("id");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setItems(data);

      // Get slug from URL: /items/lock/worldlock → lock/worldlock
      const slug = decodeURIComponent(
        window.location.pathname.replace(/^\/items\//, "")
      );

      // Match with image column (remove extension before comparing)
      const current = data.find((i) => {
        const imagePath = i.image?.replace(/\.[^/.]+$/, ""); // strip extension
        return imagePath === slug;
      });

      setSelectedItem(current);
      setLoading(false);
    };

    fetchItems();
  }, []);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Rarity color utility
  const getRarityColor = (rarity) => {
    const thresholds = Object.keys(rarityColors)
      .map(Number)
      .sort((a, b) => a - b);
    return rarityColors[
      thresholds.find((t) => rarity <= t) ?? thresholds.at(-1)
    ];
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const name = item.name?.toLowerCase() || "";
    const desc = item.description?.toLowerCase() || "";
    const type = item.type?.toLowerCase() || "";

    const matchesSearch =
      !searchQuery ||
      name.includes(searchQuery.toLowerCase()) ||
      desc.includes(searchQuery.toLowerCase());

    const matchesFilter = value === "all" ? true : type === value.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Get image URL from Supabase
const getImageUrl = (path) =>
  path ? `https://ik.imagekit.io/6j61dmdpg/items/${path}` : "";
  // Get OG image URL with proper size for social previews
  const getOgImage = (path) => {
    if (!path) return "/logo-v1.webp";
    const { data } = supabase.storage.from("items").getPublicUrl(path);
    return `${data.publicUrl}?width=1200&height=630&resize=cover`;
  };
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Header items={items} darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <Sidebar
              {...{
                searchQuery,
                setSearchQuery,
                value,
                setValue,
                open,
                setOpen,
                filteredItems,
                selectedItem,
                setSelectedItem,
                loading,
                getImageUrl,
                getRarityColor,
              }}
            />

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Tabs defaultValue="item-details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger className="cursor-pointer" value="item-details">
                    Item Details
                  </TabsTrigger>
                  <TabsTrigger className="cursor-pointer" value="community">
                    Community
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="item-details">
                  {loading ? (
                    <Skeleton />
                  ) : selectedItem ? (
                    <motion.div
                      ref={cardRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="overflow-hidden shadow-lg border border-border rounded-2xl">
                        {/* Item Header */}
                        <div className="relative flex items-center overflow-hidden rounded-t-2xl bg-background p-6 sm:p-10">
                          <DotPattern
                            width={15}
                            height={20}
                            cx={1}
                            cy={1}
                            cr={1}
                            className={cn(
                              "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
                            )}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                            <Image
                              src={getImageUrl(selectedItem.image)}
                              alt={selectedItem.name}
                              width={128}
                              height={128}
                              quality={85}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg backdrop-blur transition-transform hover:scale-105"
                              priority
                            />

                            <div className="flex-1">
                              <h2 className="text-2xl sm:text-4xl font-bold mb-2">
                                {selectedItem.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <Badge
                                  className={`${getRarityColor(
                                    selectedItem.rarity
                                  )} border transition-all hover:scale-105`}
                                >
                                  <Flame className="h-3 w-3 mr-1" />
                                  Rarity {selectedItem.rarity}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="transition-all hover:scale-105"
                                >
                                  {selectedItem.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-8 space-y-6">
                          {/* Description */}
                          <Section title="Description">
                            <p className="text-muted-foreground leading-relaxed">
                              {selectedItem.description ||
                                "No description available."}
                            </p>
                          </Section>

                          {/* Block Properties */}
                          <Section title="Block Properties">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {[
                                {
                                  label: "Punches Needed",
                                  value: selectedItem.punch,
                                },
                                {
                                  label: "Punches with Pickaxe",
                                  value: selectedItem.punchpick,
                                },
                                {
                                  label: "Tradeable",
                                  value: selectedItem.istradeable
                                    ? "Yes"
                                    : "No",
                                },
                              ].map(({ label, value }, i) => (
                                <Card
                                  key={i}
                                  className="bg-muted/50 border rounded-lg p-4"
                                >
                                  <p className="text-sm text-muted-foreground">
                                    {label}
                                  </p>
                                  <p className="font-medium">
                                    {value || "N/A"}
                                  </p>
                                </Card>
                              ))}
                            </div>
                          </Section>

                          {/* Properties badges */}
                          <Section title="Properties">
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.properties?.map((prop, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="transition-all hover:scale-105"
                                >
                                  {prop}
                                </Badge>
                              ))}
                            </div>
                          </Section>

                          {/* Value / Growth / Splicing */}
                          <Card className="bg-muted/50">
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                {[
                                  {
                                    label: "Gems Value",
                                    value: selectedItem.value
                                      ? selectedItem.value.toLocaleString()
                                      : "N/A",
                                  },
                                  {
                                    label: "Growth Time",
                                    value: selectedItem.growtime,
                                  },
                                  {
                                    label: "Splicing Recipe",
                                    value: selectedItem.splicing,
                                  },
                                ].map(({ label, value }, i) => (
                                  <div key={i}>
                                    <div className="text-2xl font-bold">
                                      {value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {label}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <WelcomeCard />
                  )}
                </TabsContent>

                <TabsContent value="community">
                  <CommunityThreads />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <Script id="ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: selectedItem?.name || "Blocktopia Item",
          description:
            selectedItem?.description ||
            "Learn about this item in Blocktopia Wiki.",
          image: getImageUrl(selectedItem?.image),
          url: currentUrl,
        })}
      </Script>
    </>
  );
}
