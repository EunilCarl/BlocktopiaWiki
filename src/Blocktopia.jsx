import React, { useState, useEffect } from 'react';
import { Search, Star, Plus, MessageSquare, User, Calendar, ChevronDown, ChevronUp, ExternalLink, Moon, Sun, Filter, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Separator } from './components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { ScrollArea } from './components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import Header from './Header';

const BlocktopiaWiki = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState([]);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [newThread, setNewThread] = useState({ title: '', content: '', author: '' });
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sample item database
  const items = [
    {
      id: 1,
      name: 'Diamond Seed',
      rarity: 'Legendary',
      type: 'Seed',
      description: 'An extremely rare seed that produces valuable diamonds. Takes 7 days to grow and requires perfect conditions.',
      splicing: 'Rock Seed + Crystal Seed',
      growTime: '7 days',
      image: '💎',
      value: 50000,
      properties: ['Valuable', 'Slow Growth', 'Requires Water']
    },
    {
      id: 2,
      name: 'Fire Seed',
      rarity: 'Epic',
      type: 'Seed',
      description: 'A hot seed that grows into fire blocks. Provides warmth and light to surrounding areas.',
      splicing: 'Lava Seed + Coal Seed',
      growTime: '3 days',
      image: '🔥',
      value: 15000,
      properties: ['Heat Source', 'Light Source', 'Dangerous']
    },
    {
      id: 3,
      name: 'Rainbow Tree Seed',
      rarity: 'Mythical',
      type: 'Seed',
      description: 'The rarest seed in Blocktopia. Grows into a magnificent rainbow tree that changes colors.',
      splicing: 'Diamond Seed + Magic Seed + Rainbow Essence',
      growTime: '14 days',
      image: '🌈',
      value: 100000,
      properties: ['Color Changing', 'Magical', 'Extremely Rare']
    },
    {
      id: 4,
      name: 'Golden Pickaxe',
      rarity: 'Rare',
      type: 'Tool',
      description: 'A powerful mining tool that increases mining speed by 200%. Durable and efficient.',
      splicing: 'Not applicable - Crafted item',
      growTime: 'N/A',
      image: '⛏️',
      value: 8000,
      properties: ['Mining Tool', 'Durable', 'Speed Boost']
    },
    {
      id: 5,
      name: 'Ice Crystal',
      rarity: 'Uncommon',
      type: 'Block',
      description: 'A beautiful ice crystal that never melts. Can be used for decoration or cooling systems.',
      splicing: 'Ice Seed + Crystal Dust',
      growTime: '2 days',
      image: '❄️',
      value: 2500,
      properties: ['Never Melts', 'Decorative', 'Cooling Effect']
    },
    {
      id: 6,
      name: 'Magic Wand',
      rarity: 'Epic',
      type: 'Tool',
      description: 'A mystical wand that allows players to cast spells and manipulate blocks from a distance.',
      splicing: 'Magic Seed + Crystal Staff + Stardust',
      growTime: 'N/A',
      image: '🪄',
      value: 25000,
      properties: ['Magic Tool', 'Remote Control', 'Spell Casting']
    }
  ];

  const rarityColors = {
    'Common': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    'Uncommon': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Rare': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Epic': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Legendary': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Mythical': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || item.type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const addThread = () => {
    if (newThread.title && newThread.content && newThread.author) {
      const thread = {
        id: Date.now(),
        title: newThread.title,
        content: newThread.content,
        author: newThread.author,
        date: new Date().toLocaleDateString(),
        replies: []
      };
      setThreads([thread, ...threads]);
      setNewThread({ title: '', content: '', author: '' });
      setShowThreadForm(false);
    }
  };

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <Header   items={items} 
  darkMode={darkMode} 
  setDarkMode={setDarkMode}  />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="text"
                    placeholder="Search items..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Filter by Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'seed', 'tool', 'block'].map(type => (
                      <Button
                        key={type}
                        variant={filter === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(type)}
                        className="text-xs"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Items ({filteredItems.length})</Label>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredItems.map(item => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedItem?.id === item.id
                              ? 'ring-2 ring-primary border-primary'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{item.image}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{item.name}</div>
                                <Badge variant="outline" className={`text-xs ${rarityColors[item.rarity]}`}>
                                  {item.rarity}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="item-details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="item-details">Item Details</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
              
              <TabsContent value="item-details">
                {selectedItem ? (
                  <Card className="overflow-hidden">
                    {/* Item Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                      <div className="flex items-center space-x-6">
                        <div className="text-6xl bg-white/20 rounded-2xl p-4 backdrop-blur">
                          {selectedItem.image}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-4xl font-bold mb-2">{selectedItem.name}</h2>
                          <div className="flex items-center space-x-4">
                            <Badge className={`${rarityColors[selectedItem.rarity]} border`}>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {selectedItem.rarity}
                            </Badge>
                            <Badge variant="secondary">
                              {selectedItem.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Description</h3>
                          <p className="text-muted-foreground leading-relaxed">{selectedItem.description}</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Properties</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.properties.map((prop, index) => (
                              <Badge key={index} variant="outline">
                                {prop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Card className="bg-muted/50">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                              <div className="text-2xl font-bold">{selectedItem.value.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">Gems Value</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{selectedItem.growTime}</div>
                              <div className="text-sm text-muted-foreground">Growth Time</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-center break-words">{selectedItem.splicing}</div>
                              <div className="text-sm text-muted-foreground">Splicing Recipe</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="text-center">
                    <CardContent className="p-12">
                      <div className="text-6xl mb-4">🏗️</div>
                      <CardTitle className="text-2xl mb-4">Welcome to Blocktopia Wiki</CardTitle>
                      <CardDescription className="mb-6">
                        Select an item from the sidebar to view detailed information about seeds, tools, and blocks.
                      </CardDescription>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { emoji: '🌱', label: 'Seeds' },
                          { emoji: '🛠️', label: 'Tools' },
                          { emoji: '🧱', label: 'Blocks' },
                          { emoji: '✨', label: 'Magic' }
                        ].map((item, index) => (
                          <Card key={index} className="p-4">
                            <CardContent className="p-0">
                              <div className="text-2xl mb-2">{item.emoji}</div>
                              <div className="text-sm font-medium">{item.label}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="community">
                {/* Community Threads */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="text-primary" size={24} />
                        <div>
                          <CardTitle>Community Suggestions & Feedback</CardTitle>
                          <CardDescription>Share your ideas and feedback with the community</CardDescription>
                        </div>
                      </div>
                      <Button onClick={() => setShowThreadForm(!showThreadForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Thread
                      </Button>
                    </div>
                  </CardHeader>

                  {showThreadForm && (
                    <CardContent className="border-t bg-muted/50 p-8">
                      <div className="space-y-4 ">
                        <Input
                          placeholder="Thread title..."
                          value={newThread.title}
                          onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                        />
                        <Input
                          placeholder="Your username..."
                          value={newThread.author}
                          onChange={(e) => setNewThread({...newThread, author: e.target.value})}
                        />
                        <Textarea
                          placeholder="Share your suggestions or feedback..."
                          value={newThread.content}
                          onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                        />
                        <div className="flex space-x-3">
                          <Button onClick={addThread}>Post Thread</Button>
                          <Button variant="outline" onClick={() => setShowThreadForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}

                  <CardContent className="p-0">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No threads yet. Be the first to share your suggestions!</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {threads.map(thread => (
                          <div key={thread.id} className="p-6">
                            <div 
                              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors"
                              onClick={() => toggleThread(thread.id)}
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <Avatar>
                                  <AvatarFallback>{thread.author.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{thread.title}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>{thread.author}</span>
                                    <span>{thread.date}</span>
                                  </div>
                                </div>
                              </div>
                              {expandedThreads.has(thread.id) ? 
                                <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              }
                            </div>
                            
                            {expandedThreads.has(thread.id) && (
                              <div className="mt-4 pl-14">
                                <Card className="bg-muted/30">
                                  <CardContent className="p-4">
                                    <p className="text-sm">{thread.content}</p>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
  <div className="container mx-auto px-4 py-8 text-center">
    <div className="flex items-center justify-center space-x-2 mb-4">
      <div className="text-2xl">🏗️</div>
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
      Made with ❤️ by <span className="font-semibold">Eunil</span> ·
      Community Wiki Project
    </p>
  </div>
</footer>

    </div>
  );
};

export default BlocktopiaWiki;