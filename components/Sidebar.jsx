"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Skeleton } from "@/ui/skeleton";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Check, ChevronsUpDown, Filter, Search, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import { cn } from "@/lib/utils";
import categories from "@/data/categories";
import { supabase } from "@/lib/supabaseClient";
import EditDialog from "./EditDialog";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import sortOptions from "@/data/sortOptions";
const Sidebar = ({
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
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const createdObjectUrlRef = useRef(null);
  const itemRefs = useRef({});
  const scrollRef = useRef(null);
  const [sortValue, setSortValue] = useState("default");

  const router = useRouter();
  const pathname = usePathname();
let displayedItems = [...filteredItems];


switch (sortValue) {
  case "name-asc":
    displayedItems.sort((a, b) => a.name.localeCompare(b.name));
    break;
  case "name-desc":
    displayedItems.sort((a, b) => b.name.localeCompare(a.name));
    break;
  case "rarity-asc":
    displayedItems.sort((a, b) => a.rarity - b.rarity);
    break;
  case "rarity-desc":
    displayedItems.sort((a, b) => b.rarity - a.rarity);
    break;
}
  // Get the current slug from the URL
  const currentRoute = pathname?.replace(/^\/items\//, "") || "";

  // helper: consistent slug extraction
  const getSlug = (item) =>
    item?.slug || (item?.image ? item.image.replace(/\.[^/.]+$/, "") : "");

  // effect: when pathname changes, set selectedItem + scroll
  useEffect(() => {
    if (loading || !filteredItems?.length) return;

    const slugFromPath = pathname?.replace(/^\/items\//, "") || "";
    if (!slugFromPath) return;

    const matchedItem = filteredItems.find(
      (it) => getSlug(it) === slugFromPath
    );
    if (!matchedItem) return;

    // ✅ only update if different
    if (matchedItem.id !== selectedItem?.id) {
      setSelectedItem(matchedItem);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        requestAnimationFrame(() => {
          const el = itemRefs.current[matchedItem.id];
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        });
      }
    }
  }, [pathname, filteredItems, loading]);

  // Preview for editing
  useEffect(() => {
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {}
      createdObjectUrlRef.current = null;
    }

    setFile(null);
    if (editingItem?.image) {
      setPreviewUrl(getImageUrl(editingItem.image));
    } else {
      setPreviewUrl(null);
    }
  }, [editingItem, getImageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (createdObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(createdObjectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {}
      createdObjectUrlRef.current = null;
    }

    if (!f) {
      setFile(null);
      setPreviewUrl(editingItem?.image ? getImageUrl(editingItem.image) : null);
      return;
    }

    setFile(f);
    const objUrl = URL.createObjectURL(f);
    createdObjectUrlRef.current = objUrl;
    setPreviewUrl(objUrl);
  };

  return (
    <div className="lg:col-span-1 order-2 lg:order-1" ref={scrollRef}>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

<div className="flex flex-col gap-3">
  {/* Sort Dropdown */}
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        Sort: {sortOptions.find((s) => s.value === sortValue)?.label || "Default"}
        <ChevronsUpDown className="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[220px] p-0">
      <Command>
        <CommandInput placeholder="Search sort..." className="h-9" />
        <CommandList>
          <CommandEmpty>No sort option.</CommandEmpty>
          <CommandGroup heading="Sort by">
            {sortOptions.map((s) => (
              <CommandItem
                key={s.value}
                value={s.value}
                onSelect={(val) => setSortValue(val)}
              >
                {s.label}
                <Check
                  className={cn(
                    "ml-auto",
                    sortValue === s.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>

  {/* Category Dropdown */}
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        Category: {categories.find((c) => c.value === value)?.label || "All"}
        <ChevronsUpDown className="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[220px] p-0">
      <Command>
        <CommandInput placeholder="Search category..." className="h-9" />
        <CommandList>
          <CommandEmpty>No category.</CommandEmpty>
          <CommandGroup heading="Categories">
            {categories.map((cat) => (
              <CommandItem
                key={cat.value}
                value={cat.value}
                onSelect={(val) => {
                  setValue(val);
                  setOpen(false);
                }}
              >
                {cat.label}
                <Check
                  className={cn(
                    "ml-auto",
                    value === cat.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>


          {/* Items List */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Items ({filteredItems.length})
            </Label>

            <ScrollArea className="h-[400px] mt-4">
              <div className="space-y-2">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Card key={`skeleton-${i}`}>
                        <CardContent className="flex items-center space-x-3">
                          <Skeleton className="h-12 w-10 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  : displayedItems.map((item) => {
                      const isActive = selectedItem?.id === item.id;
                      const slug = getSlug(item);

                      return (
                        <Card
                          key={item.id}
                          ref={(el) => (itemRefs.current[item.id] = el)}
                          onClick={(e) => {
                            setSelectedItem(item); // immediately update UI
                            if (typeof window !== "undefined") {
                              const slug = getSlug(item);
                              window.history.pushState(
                                null,
                                "",
                                `/items/${slug}`
                              );
                            }

                            // scroll on mobile
                            if (window.innerWidth < 1024) {
                              const el = itemRefs.current[item.id];
                              if (el)
                                el.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                            }
                          }}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            isActive
                              ? "border-primary border-2"
                              : "hover:border-primary/50"
                          )}
                        >
                          <CardContent>
                            <div className="flex items-center space-x-3">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-10 h-10 object-contain rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium flex items-center justify-between">
                                  <span
                                    className="mr-2"
                                    style={{
                                      wordBreak: "break-word",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {item.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingItem(item);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getRarityColor(
                                    item.rarity
                                  )}`}
                                >
                                  {item.rarity}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditDialog
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        file={file}
        setFile={setFile}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        getImageUrl={getImageUrl}
      />
    </div>
  );
};

export default Sidebar;
