"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Highlighter } from "@/components/magicui/highlighter";

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
        <img
          src="/logo-v1.webp"
          alt="Blocktopia Logo"
          className="relative h-25 w-35 mx-auto"
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

      {/* Features grid */}
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

export default WelcomeCard;
