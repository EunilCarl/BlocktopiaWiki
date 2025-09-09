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
import Header from './components/Header';
import Footer from './components/Footer';
import items from './data/items';


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

const rarityColors = {
  Basic: "bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700", 

  Uncommon: "bg-lime-200 text-lime-800 border-lime-300 dark:bg-lime-800 dark:text-lime-200 dark:border-lime-700", 

  Farmable: "bg-sky-200 text-sky-800 border-sky-300 dark:bg-sky-800 dark:text-sky-200 dark:border-sky-700", 

  Rare: "bg-indigo-200 text-indigo-800 border-indigo-300 dark:bg-indigo-800 dark:text-indigo-200 dark:border-indigo-700", 

  Epic: "bg-fuchsia-200 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-800 dark:text-fuchsia-200 dark:border-fuchsia-700", 

  Legendary: "bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-800 dark:text-amber-200 dark:border-amber-700", 

  Currency: "bg-cyan-200 text-cyan-800 border-cyan-300 dark:bg-cyan-800 dark:text-cyan-200 dark:border-cyan-700" 
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
          <div className="lg:col-span-1 order-2 lg:order-1">
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
                    {['all', 'seed', 'tool', 'block', 'lock', 'furniture', 'clothing', 'consumable', 'event', ].map(type => (
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
                              ? 'border-primary border-2'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <CardContent >
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
          <div className="lg:col-span-3 order-1 lg:order-2">
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
                      <img src="/logo.png" alt="Blocktopia Logo" className="h-15 w-15 mb-4 mx-auto" />
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
      <Footer></Footer>

    </div>
  );
};

export default BlocktopiaWiki;