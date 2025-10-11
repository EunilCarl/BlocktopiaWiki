import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-16">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Image
            src="/logo-v1.webp"
            alt="Blocktopia Logo"
            width={40}
            height={40}
            loading="lazy" // ✅ Footer images can load lazily
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold">Blocktopia Wiki</span>
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground mb-2">
          The Ultimate Guide to Building, Trading, and Exploring Blocktopia
        </p>

        {/* About/Description */}
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
          Blocktopia Wiki — your all-in-one guide to the creative Roblox sandbox world of Blocktopia. Explore farming, building, trading, and item stats, with helpful tips from the community
        </p>

        {/* Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://www.roblox.com/games/125532882925319/Blocktopia"
              className="flex items-center space-x-1"
            >
              <ExternalLink size={16} />
              <span>Official Game</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm">
            <a
              href="https://discord.com/invite/e76rHFMrdT"
              className="flex items-center space-x-1"
            >
              <MessageSquare size={16} className="mr-2" />
              Discord
            </a>
          </Button>
        </div>

        {/* Credits */}
        <p className="text-xs text-muted-foreground">
          Made with ❤️ by{" "}
          <a className="font-semibold" href="https://github.com/EunilCarl">
            Eunil
          </a>{" "}
          · A Community Wiki Project
        </p>
      </div>
    </footer>
  );
};

export default Footer;
