"use client";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Highlighter } from "@/components/magicui/highlighter";
import Image from "next/image";

const features = [
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/seed/seed.png?updatedAt=1760264042979",
    title: "Seeds & Farming",
    desc: "Rare splices and cultivation",
  },
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/block/bricks.png?updatedAt=1760264045908",
    title: "Blocks & Building",
    desc: "Decoration and construction",
  },
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/clothing/wrench.png?updatedAt=1760264062470",
    title: "Tools & Crafting",
    desc: "Efficient mining equipment",
  },
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/lock/worldlock.png?updatedAt=1760264042773",
    title: "Locks & Trading",
    desc: "Currency and world ownership",
  },
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/clothing/autumnwings.png?updatedAt=1760264042146",
    title: "Event Items",
    desc: "Rare collectibles and boosts",
  },
  {
    icon: "https://ik.imagekit.io/6j61dmdpg/items/block/checkpoint.png?updatedAt=1760264044740",
    title: "Game Mechanics",
    desc: "Tips and strategies",
  },
];

const WelcomeCard = () => (
  <Card className="relative text-center shadow-2xl rounded-3xl overflow-hidden bg-background/80 backdrop-blur-sm border border-muted">
    {/* Decorative background elements */}
    <div className="absolute inset-0 bg-primary/5 opacity-50" />
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

    <CardContent className="relative z-10 p-8 sm:p-12">
      {/* Logo */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-blue-400/5 rounded-2xl blur-md transform scale-200" />
<Image
  src="/logo-v1.webp"
  alt="Blocktopia Logo"
  width={180}
  height={180} // 1.5 ratio
  priority
  className="relative mx-auto object-contain"
/>

      </div>

      <CardTitle className="text-3xl font-bold mb-2">
        Welcome to{" "}
        <Highlighter action="underline" color="#03A9F4">
          Blocktopia Wiki
        </Highlighter>
      </CardTitle>

      <p className="text-sm text-muted-foreground mb-6">
        Your ultimate guide to farming, building, and trading in Blocktopia!
      </p>

      {/* Contribute Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer" variant="outline">
            Want to contribute?
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 relative bg-muted/40 backdrop-blur-sm p-6 sm:p-5 rounded-xl shadow-inner max-w-xl mx-auto hover:scale-105 transition-all duration-300 border border-muted"
          align="center"
        >
          <h3 className="text-lg font-semibold">🚀 Want to contribute?</h3>
          <p className="text-sm leading-relaxed mt-4 mb-4">
            Help make this wiki better! Click the{" "}
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-semibold">
              ✏️ pencil icon
            </span>{" "}
            in the top-right corner of any item to add details, fix mistakes, or
            share your knowledge.
          </p>
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
                <Image
                  height={15}
                  width={15}
                  src="https://cdn.worldvectorlogo.com/logos/discord-6.svg"
                  alt="Discord Logo"
                />
                <span>Discord</span>
              </a>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <hr className="my-6 mb-5 border-t border-muted/30" />

      {/* Features grid */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-6">
          Explore the vibrant world of Blocktopia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-xl mx-auto">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-muted/60 backdrop-blur-sm rounded-xl p-3 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-muted"
            >
              <div className=" flex justify-center">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={32} // these help with CLS
                  height={32} // but they won’t override h-8 visually
                  className="object-contain h-8 w-8"
                  priority={index < 3} // optional: speed up top icons
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
              <div className="font-semibold text-sm mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-6 mb-5 border-t border-muted/30" />
      {/* Modern New Features Card */}
      <Card className="relative bg-gradient-to-br dark:from-muted/50 dark:to-muted/40 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 max-w-sm mx-auto border dark:border-muted/40">
        {/* Header with icon */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Megaphone className="w-6 h-6 text-orange-500" />
          <CardTitle className="text-md font-bold">
            Exclusive New Features
          </CardTitle>
        </div>

        {/* Mass-guide Button */}
        <div className="relative flex justify-center">
          <Button variant="outline" asChild>
            <Link
              href="/mass-guide"
              className="flex items-center justify-center relative"
            >
              Mass Guide
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-5 bg-amber-500 text-[11px] font-bold text-white dark:bg-amber-600  px-1.5 py-0.5 shadow-md animate-pulse"
              >
                Beta
              </Badge>
            </Link>
          </Button>
        </div>
      </Card>
    </CardContent>
  </Card>
);

export default WelcomeCard;
