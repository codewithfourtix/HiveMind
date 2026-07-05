// The daily prompt bank. Each post picks one prompt at creation time and stores
// it in the post config, so a single post always shows the same prompt.
//
// `samples` are used by the dev-only "Seed demo answers" menu action to populate
// a post with a realistic, clustered board for testing and demos. They include
// intentional casing / emoji / plural / typo variety so the smart-matching
// engine visibly collapses them (e.g. "Pizza", "🍕 pizza!", "pizzas" → one bar).

export type Prompt = { text: string; emoji: string; samples: string[] };

export const PROMPTS: Prompt[] = [
  {
    text: 'Name something you would take to a desert island.',
    emoji: '🏝️',
    samples: ['Knife', 'a knife', 'knife', 'Water', 'water', 'lighter', 'Lighter', 'matches', 'my phone', 'phone', 'Phone', 'rope', 'a book', 'book', 'sunscreen'],
  },
  {
    text: 'Name a food that is better cold than hot.',
    emoji: '🥶',
    samples: ['Pizza', '🍕 pizza!', 'pizza', 'PIZZA', 'pizzas', 'ice cream', 'Ice Cream', 'watermelon', 'Watermelon', 'sushi', 'noodles', 'cold noodles', 'salad', 'grapes'],
  },
  {
    text: 'Name the first animal that comes to mind.',
    emoji: '🦊',
    samples: ['Dog', 'dog', 'a dog', 'Dogs', 'Cat', 'cat', 'cats', 'Lion', 'lion', 'tiger', 'Tiger', 'elephant', 'fox', 'dogg'],
  },
  {
    text: 'Name a color that is NOT in the rainbow.',
    emoji: '🎨',
    samples: ['Black', 'black', 'BLACK', 'White', 'white', 'Brown', 'brown', 'Pink', 'pink', 'gray', 'grey', 'Grey', 'magenta', 'beige'],
  },
  {
    text: 'Name a superpower everyone secretly wants.',
    emoji: '🦸',
    samples: ['Flying', 'flying', 'fly', 'to fly', 'Invisibility', 'invisibility', 'invisible', 'Teleportation', 'teleport', 'teleportation', 'time travel', 'Time Travel', 'mind reading', 'super speed'],
  },
  {
    text: 'Name something you always lose.',
    emoji: '🔍',
    samples: ['Keys', 'keys', 'my keys', 'KEYS', 'phone', 'my phone', 'Phone', 'socks', 'a sock', 'socks', 'glasses', 'wallet', 'my wallet', 'pen'],
  },
  {
    text: 'Name a movie everyone has seen.',
    emoji: '🎬',
    samples: ['Titanic', 'titanic', 'TITANIC', 'Avatar', 'avatar', 'Inception', 'inception', 'Interstellar', 'interstellar', 'The Dark Knight', 'the dark knight', '🦇 dark knight', 'Avengers', 'the avengers', 'Frozen'],
  },
  {
    text: 'Name a country you would move to tomorrow.',
    emoji: '✈️',
    samples: ['Japan', 'japan', 'JAPAN', 'Canada', 'canada', 'Switzerland', 'switzerland', 'Italy', 'italy', 'New Zealand', 'new zealand', 'Norway', 'Australia', 'Spain'],
  },
  {
    text: 'Name a snack you cannot stop eating.',
    emoji: '🍿',
    samples: ['Chips', 'chips', 'a chip', 'Popcorn', 'popcorn', 'Chocolate', 'chocolate', '🍫 chocolate', 'cookies', 'a cookie', 'nuts', 'pretzels', 'crackers', 'chipss'],
  },
  {
    text: 'Name the most useless kitchen gadget.',
    emoji: '🍳',
    samples: ['Egg separator', 'egg separator', 'Garlic press', 'garlic press', 'avocado slicer', 'Avocado Slicer', 'banana slicer', 'melon baller', 'quesadilla maker', 'butter warmer', 'egg cuber', 'pineapple corer', 'garlic press'],
  },
  {
    text: 'Name a word that just sounds funny.',
    emoji: '😂',
    samples: ['Bamboozle', 'bamboozle', 'Discombobulate', 'discombobulate', 'flabbergasted', 'kerfuffle', 'Kerfuffle', 'moist', 'noodle', 'noodles', 'gobbledygook', 'shenanigans', 'hullabaloo', 'bamboozled'],
  },
  {
    text: 'Name something that is overrated.',
    emoji: '🙄',
    samples: ['Coffee', 'coffee', 'Crypto', 'crypto', 'the Kardashians', 'kardashians', 'Apple', 'apple products', 'gym', 'the gym', 'brunch', 'wine', 'festivals', 'coffe'],
  },
  {
    text: 'Name a fictional place you wish were real.',
    emoji: '🗺️',
    samples: ['Hogwarts', 'hogwarts', 'HOGWARTS', 'Narnia', 'narnia', 'Wakanda', 'wakanda', 'Middle Earth', 'middle earth', 'the Shire', 'Neverland', 'Atlantis', 'Gotham', 'hogwarts!'],
  },
  {
    text: 'Name the best pizza topping.',
    emoji: '🍕',
    samples: ['Pepperoni', 'pepperoni', '🍕 pepperoni', 'PEPPERONI', 'peperoni', 'Mushroom', 'mushrooms', 'Cheese', 'cheese', 'extra cheese', 'pineapple', 'Pineapple', 'sausage', 'olives'],
  },
  {
    text: 'Name an app you check first thing in the morning.',
    emoji: '📱',
    samples: ['Instagram', 'instagram', 'insta', 'IG', 'WhatsApp', 'whatsapp', 'Reddit', 'reddit', 'YouTube', 'youtube', 'TikTok', 'tiktok', 'Gmail', 'email'],
  },
  {
    text: 'Name a smell that brings back memories.',
    emoji: '👃',
    samples: ['Rain', 'rain', 'petrichor', 'Fresh bread', 'fresh bread', 'bread', 'coffee', 'Coffee', 'cut grass', 'fresh cut grass', 'sunscreen', 'campfire', 'grandmas cooking', 'rainn'],
  },
  {
    text: 'Name something you would ban forever.',
    emoji: '🚫',
    samples: ['Mondays', 'monday', 'Traffic', 'traffic', 'ads', 'Ads', 'spam calls', 'spam', 'slow walkers', 'homework', 'mosquitoes', 'mosquito', 'small talk', 'meetings'],
  },
  {
    text: 'Name a hobby you wish you had time for.',
    emoji: '🎯',
    samples: ['Reading', 'reading', 'read', 'Painting', 'painting', 'paint', 'guitar', 'playing guitar', 'cooking', 'Cooking', 'gardening', 'photography', 'writing', 'readingg'],
  },
  {
    text: 'Name the greatest board game of all time.',
    emoji: '🎲',
    samples: ['Monopoly', 'monopoly', 'MONOPOLY', 'Catan', 'catan', 'settlers of catan', 'Chess', 'chess', 'Scrabble', 'scrabble', 'Risk', 'Clue', 'Uno', 'monopol'],
  },
  {
    text: 'Name a drink that fixes a bad day.',
    emoji: '🥤',
    samples: ['Coffee', 'coffee', 'Tea', 'tea', 'a cup of tea', 'Beer', 'beer', 'wine', 'Wine', 'water', 'hot chocolate', 'coke', 'coca cola', 'teaa'],
  },
  {
    text: 'Name an animal that would rule the world.',
    emoji: '👑',
    samples: ['Cats', 'cat', 'cats', 'Dolphins', 'dolphin', 'dolphins', 'Octopus', 'octopus', 'ants', 'an ant', 'crows', 'chimps', 'dogs', 'catz'],
  },
  {
    text: 'Name a song everyone knows the words to.',
    emoji: '🎵',
    samples: ['Bohemian Rhapsody', 'bohemian rhapsody', 'Happy Birthday', 'happy birthday', 'Sweet Caroline', 'sweet caroline', 'Wonderwall', 'wonderwall', 'Africa', 'toto africa', 'Baby Shark', 'Mr Brightside', 'Dancing Queen', 'wonderwal'],
  },
  {
    text: 'Name the scariest thing in the ocean.',
    emoji: '🌊',
    samples: ['Sharks', 'shark', 'sharks', '🦈 shark', 'the deep', 'deep water', 'Jellyfish', 'jellyfish', 'anglerfish', 'squid', 'giant squid', 'whales', 'the unknown', 'sharkk'],
  },
  {
    text: 'Name a chore you secretly enjoy.',
    emoji: '🧹',
    samples: ['Vacuuming', 'vacuuming', 'vacuum', 'Dishes', 'washing dishes', 'dishes', 'laundry', 'folding laundry', 'mowing', 'mowing the lawn', 'organizing', 'ironing', 'dusting', 'vacumming'],
  },
  {
    text: 'Name a fruit that is a perfect 10.',
    emoji: '🍓',
    samples: ['Mango', 'mango', 'MANGO', 'Strawberry', 'strawberries', 'strawberry', 'Watermelon', 'watermelon', 'grapes', 'a grape', 'banana', 'pineapple', 'peach', 'mangoo'],
  },
  {
    text: 'Name something humans will laugh at in 50 years.',
    emoji: '🔮',
    samples: ['Gas cars', 'gas cars', 'Cash', 'cash', 'fax machines', 'passwords', 'Passwords', 'social media', 'fossil fuels', 'phone chargers', 'wired headphones', 'plastic', 'crypto', 'gas car'],
  },
  {
    text: 'Name the ultimate comfort movie.',
    emoji: '🛋️',
    samples: ['Harry Potter', 'harry potter', 'Home Alone', 'home alone', 'Shrek', 'shrek', 'The Notebook', 'notebook', 'Forrest Gump', 'forrest gump', 'Elf', 'Toy Story', 'Ratatouille', 'harry poter'],
  },
  {
    text: 'Name a small thing that makes your whole day better.',
    emoji: '☀️',
    samples: ['Coffee', 'coffee', 'a good coffee', 'Sunshine', 'sunshine', 'sun', 'a nap', 'naps', 'music', 'good music', 'a walk', 'petting a dog', 'a text', 'coffe'],
  },
  {
    text: 'Name an emoji you overuse.',
    emoji: '💬',
    samples: ['😂', 'the crying laughing one', '💀', 'skull', '🙏', '❤️', 'heart', '🔥', 'fire', '😭', '👍', 'thumbs up', '🥲', '😅'],
  },
];

/** Deterministic "prompt of the day" so every post created today shares a theme. */
export function getDailyPrompt(seed = new Date()): Prompt {
  const start = Date.UTC(seed.getUTCFullYear(), 0, 0);
  const now = Date.UTC(seed.getUTCFullYear(), seed.getUTCMonth(), seed.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  const idx = ((dayOfYear % PROMPTS.length) + PROMPTS.length) % PROMPTS.length;
  return PROMPTS[idx] ?? PROMPTS[0]!;
}

/** Sample answers for a given prompt text, for the dev seed action. */
export function samplesForPrompt(promptText: string): string[] {
  return PROMPTS.find((p) => p.text === promptText)?.samples ?? [];
}
