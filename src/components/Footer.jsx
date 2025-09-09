import React from 'react'
import { Button } from '../components/ui/button';
import { ExternalLink, MessageSquare } from "lucide-react";


const Footer = () => {
  return (
     <footer className="border-t bg-muted/50 mt-16">
  <div className="container mx-auto px-4 py-8 text-center">
    <div className="flex items-center justify-center space-x-2 mb-4">
      <img src="/logo.png" alt="Blocktopia Logo" className="h-8 w-8" />
      <span className="text-xl font-bold">Blocktopia Wiki</span>
    </div>

    {/* Tagline */}
    <p className="text-muted-foreground mb-2">
      The Ultimate Guide to Building, Trading, and Exploring Blocktopia
    </p>

    {/* About/Description */}
    <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
      Blocktopia Wiki is a community-driven knowledge hub designed to help
      players master the game. From crafting recipes and trading tips to
      building strategies and world secrets, this is your one-stop source
      for everything Blocktopia.
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
      Made with ❤️ by <a className="font-semibold" href='https://github.com/EunilCarl'>Eunil</a> ·
      Community Wiki Project
    </p>
  </div>
</footer>
  )
}

export default Footer
