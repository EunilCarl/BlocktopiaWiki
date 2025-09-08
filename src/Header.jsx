import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Switch } from './components/ui/switch'

const Header = ({ items, darkMode, setDarkMode }) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">🏗️</div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Blocktopia Wiki
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
            <Sun className="h-4 w-4" />
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
