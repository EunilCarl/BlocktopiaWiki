import React from "react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { AuroraText } from "@/components/magicui/aurora-text";
import Image from "next/image";

const Header = ({ items }) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <a href="/">
            <Image
              src="/logo-v1.webp"
              alt="Blocktopia Logo"
              width={72}
              height={72}
              priority
              className="h-12 w-auto cursor-pointer"
            />
          </a>

          <div>
            <h1 className="text-2xl font-bold">
              <AuroraText>Blocktopia</AuroraText> Wiki
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              The Ultimate Player’s Handbook for Blocktopia
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-sm text-muted-foreground">
            {items.length} items catalogued
          </div>
          <div className="flex items-center space-x-2">
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
