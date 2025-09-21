import React, { useState, useEffect, useRef } from "react";
import { Flame } from "lucide-react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import { Highlighter } from "@/components/magicui/highlighter";
import { DotPattern } from "@/components/magicui/dot-pattern";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "../../app/globals.css";
import { Skeleton } from "@/ui/skeleton";
import { usePathname } from "next/navigation";

const ItemPage = ({ item }) => {
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

  // Scroll to item card on mobile
  // Scroll to item card on mobile after DOM update
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
      setLoading(true); // start loader
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
      const slug = window.location.pathname.replace(/^\/items\//, "");
      const current = data.find(
        (i) => i.image?.replace(/\.[^/.]+$/, "") === slug
      );
      setSelectedItem(current);
      setLoading(false); // stop loader
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
    path
      ? supabase.storage.from("items").getPublicUrl(path).data.publicUrl
      : "";

  return (
    <>
      <Head>
        <title>
          {selectedItem
            ? `${selectedItem.name} | Blocktopia Wiki`
            : "Blocktopia Wiki"}
        </title>
        <meta
          name="description"
          content={item?.description || "Your ultimate guide to Blocktopia"}
        />

        <link rel="icon" href="/logo-v1.webp" type="image/webp" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${item?.name} | Blocktopia Wiki`} />
        <meta property="og:description" content={item?.description} />
        <meta property="og:image" content={getImageUrl(item?.image)} />
       <meta
    property="og:url"
    content={`https://blocktopia-wiki.vercel.app/items/${encodeURIComponent(
      item?.name || ""
    )}`}
  />
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          property="twitter:title"
          content={`${item?.name} | Blocktopia Wiki`}
        />
        <meta property="twitter:description" content={item?.description} />
        <meta property="twitter:image" content={getImageUrl(item?.image)} />
      </Head>
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
                            <img
                              src={getImageUrl(selectedItem.image)}
                              alt={selectedItem.name}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg backdrop-blur transition-transform hover:scale-105"
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
                                    value: selectedItem.growTime,
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
    </>
  );
};

// Small reusable section wrapper
const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">{title}</h3>
    {children}
  </div>
);

// Welcome card (default state)
const WelcomeCard = () => (
  <Card className="relative text-center shadow-2xl rounded-3xl overflow-hidden bg-background/80 backdrop-blur-sm border border-muted">
    {/* Decorative background elements */}
    <div className="absolute inset-0 bg-primary/5 opacity-50" />
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

    <CardContent className="relative z-10 p-8 sm:p-12 ">
      {/* Logo with enhanced styling */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-blue-400/5 rounded-2xl blur-md transform scale-200" />
        <img
          src="/logo-v1.webp"
          alt="Blocktopia Logo"
          className="relative h-25 w-35 mx-auto"
        />
      </div>

      {/* Main title with original typography */}
      <CardTitle className="text-3xl font-bold mb-2">
        Welcome to{" "}
        <Highlighter action="underline" color="#03A9F4">
          Blocktopia Wiki
        </Highlighter>
      </CardTitle>

      {/* Subtitle with better spacing */}
      <p className="text-sm text-muted-foreground mb-6">
        Your ultimate guide to farming, building, and trading in Blocktopia!
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer" variant="outline">
            Want to contribute?
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 relative bg-muted/40 backdrop-blur-sm p-6 sm:p-5 rounded-xl shadow-inner max-w-xl mx-auto  hover:scale-105 transition-all duration-300 border border-muted"
          align="center"
        >
          <h3 className="text-lg font-semibold">🚀 Want to contribute?</h3>

          <div className="mt-4">
            <p className="text-sm leading-relaxed mb-4">
              Help make this wiki better! Click the{" "}
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-semibold">
                ✏️ pencil icon
              </span>{" "}
              in the top-right corner of any item to add details, fix mistakes,
              or share your knowledge.
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Message me on Discord if you want credits!
          </p>
          <div className="flex items-center justify-center mt-2">
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="space-x-1 text-xs"
            >
              <a
                href="https://discord.com/users/748175690297376880"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.worldvectorlogo.com/logos/discord-6.svg"
                  alt="Discord Logo"
                  className="h-3.5 w-3.5"
                />
                <span>Discord</span>
              </a>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <hr className="my-6 mb-10 border-t border-muted/50" />

      {/* Features grid with cards */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-6">
          Explore the vibrant world of Blocktopia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/seed/seed.png",
              title: "Seeds & Farming",
              desc: "Rare splices and cultivation",
            },
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/block/bricks.png",
              title: "Blocks & Building",
              desc: "Decoration and construction",
            },
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/clothing/wrench.png",
              title: "Tools & Crafting",
              desc: "Efficient mining equipment",
            },
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/lock/worldlock.png",
              title: "Locks & Trading",
              desc: "Currency and world ownership",
            },
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/clothing/autumnwings.png",
              title: "Event Items",
              desc: "Rare collectibles and boosts",
            },
            {
              icon: "https://lokegmegfgkpztijdamy.supabase.co/storage/v1/object/public/items/block/checkpoints.png",
              title: "Game Mechanics",
              desc: "Tips and strategies",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-muted/60 backdrop-blur-sm rounded-xl p-3 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-muted"
            >
              <div className="mb-2 flex justify-center">
                {item.icon.startsWith("http") ? (
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{item.icon}</span>
                )}
              </div>
              <div className="font-semibold text-sm mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export async function getServerSideProps({ params }) {
  // take the last slug part (e.g. "rock" from /items/block/rock)
  const rawSlug = params.slug ? params.slug[params.slug.length - 1] : "";
  const name = decodeURIComponent(rawSlug);

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*");

  if (itemsError) {
    console.error(itemsError);
    return { props: { item: null, items: [] } };
  }

  // find the item where the name matches (case-insensitive)
  const currentItem = items.find(
    (i) => i.name.toLowerCase() === name.toLowerCase()
  );

  return {
    props: {
      item: currentItem || null,
      items,
    },
  };
}

export default ItemPage;

// Remove server-side fetching, and just

// fetch items on mounts
