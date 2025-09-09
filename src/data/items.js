const items = [
  {
    id: 1,
    name: 'Dirt Seed',
    rarity: 'Common',
    type: 'Seed',
    description: 'The most basic seed in Growtopia. Often used for farming or splicing.',
    splicing: 'Default item, no splice required',
    growTime: '5 seconds',
    image: '🟫',
    value: 1,
    properties: ['Basic Block', 'Splicable', 'Farming Starter']
  },
  {
    id: 2,
    name: 'Lava Seed',
    rarity: 'Uncommon',
    type: 'Seed',
    description: 'A hot seed that grows into lava blocks. Can damage players who touch it.',
    splicing: 'Dirt Seed + Rock Seed',
    growTime: '1 hour',
    image: '🌋',
    value: 20,
    properties: ['Hazardous', 'Decoration', 'Splicable']
  },
  {
    id: 3,
    name: 'Diamond Lock',
    rarity: 'Currency',
    type: 'Lock',
    description: 'The highest form of world lock currency. Equivalent to 100 World Locks.',
    splicing: '100 World Locks',
    growTime: 'N/A',
    image: '💎',
    value: 10000,
    properties: ['Currency', 'Trade Standard', 'World Ownership']
  },
  {
    id: 4,
    name: 'World Lock',
    rarity: 'Currency',
    type: 'Lock',
    description: 'Used to lock a world and prevent others from breaking or placing blocks.',
    splicing: '2000 gems (store purchase)',
    growTime: 'N/A',
    image: '🔒',
    value: 100,
    properties: ['World Ownership', 'Currency', 'Trade Standard']
  },
  {
    id: 5,
    name: 'Chandeliers',
    rarity: 'Farmable',
    type: 'Block',
    description: 'Bright decorative block, highly farmable for gems.',
    splicing: 'Glass Pane + Fancy Block',
    growTime: '1 hour 30 minutes',
    image: '💡',
    value: 2,
    properties: ['Decorative', 'Bright Light', 'Farmable']
  },
  {
    id: 6,
    name: 'Pepper Tree Seed',
    rarity: 'Uncommon',
    type: 'Seed',
    description: 'Grows into a pepper tree, used in farming for pepper blocks.',
    splicing: 'Lava Seed + Grass Seed',
    growTime: '2 hours',
    image: '🌶️',
    value: 5,
    properties: ['Farmable', 'Splicable', 'Consumable Ingredient']
  }
];

export default items;
