const MIN_PRICE = 100; // Minimum allowed price for a character

// ==========================================================================
// Helper Function: Generate Price History
// ==========================================================================

/**
 * Generates a plausible price history for a character.
 * @param {number} basePrice - The starting price to generate history around.
 * @param {number} volatility - A factor (0 to 1+) indicating price swing potential.
 * @param {number} days - How many days of history to generate.
 * @returns {Array<{date: string, price: number}>} - Array of history objects.
 */
function generatePriceHistory(basePrice, volatility, days) {
  const history = [];
  let currentPrice = basePrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    // Generate dates backwards from yesterday
    date.setDate(date.getDate() - (days - i));

    // Simulate a daily change percentage based on volatility
    // Random number between -1 and 1, scaled by volatility
    const changePercent = (Math.random() * 2 - 1) * volatility;

    // Calculate the new price, ensuring it doesn't drop below MIN_PRICE
    currentPrice = Math.max(MIN_PRICE, currentPrice * (1 + changePercent / 10)); // Smaller changes for history
    currentPrice = Math.round(currentPrice); // Round to whole numbers

    history.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      price: currentPrice
    });
  }
  // Ensure the last price in history roughly matches the initial basePrice for consistency start
  if (history.length > 0) {
     history[history.length - 1].price = Math.max(MIN_PRICE, Math.round(basePrice));
   }

  return history;
}


// ==========================================================================
// One Piece Character Stock Database
// ==========================================================================
// Note: Data structure based on the provided PDF. Ensure accuracy.
// Icons (⚡, 👑, etc.) might need specific font support or replacement with images/SVG.

// Raw bounty data from data.txt for parsing
const rawBountyData = `S.no,Name ,Bounty
1,Gol D. Roger,"฿5,564,800,000"
2,Edward Newgate,"฿5,046,000,000"
3,Kaidou,"฿4,611,100,000"
4,Charlotte Linlin,"฿4,388,000,000"
5,Shanks,"฿4,048,900,000"
6,Marshall D. Teach,"฿2,247,600,000"
7,Monkey D. Luffy,"฿1,500,000,000"
8,King,"฿1,390,000,000"
9,Marco,"฿1,374,000,000"
10,Queen,"฿1,320,000,000"
11,Charlotte Katakuri,"฿1,057,000,000"
12,Jack,"฿1,000,000,000"
13,Charlotte Smoothie,"฿932,000,000"
14,Charlotte Cracker,"฿860,000,000"
15,Charlotte Perospero,"฿700,000,000"
16,Sabo,"฿602,000,000"
17,Charlotte Snack,"฿600,000,000"
18,Little Oars Jr.,"฿550,000,000"
18,Portgas D. Ace,"฿550,000,000"
20,Who's-Who,"฿546,000,000"
21,Chinjao,"฿542,000,000"
22,Izou,"฿510,000,000"
23,Trafalgar D. Water Law,"฿500,000,000"
24,Black Maria,"฿480,000,000"
24,Edward Weevil,"฿480,000,000"
26,Sasaki,"฿472,000,000"
27,Eustass Kid,"฿470,000,000"
28,Belo Betty,"฿457,000,000"
29,Jinbe,"฿438,000,000"
30,Tamago,"฿429,000,000"
31,Karasu,"฿400,000,000"
31,Ulti,"฿400,000,000"
33,Pedro,"฿382,000,000"
34,Capone Bege,"฿350,000,000"
34,Scratchmen Apoo,"฿350,000,000"
36,Donquixote Doflamingo,"฿340,000,000"
37,Cavendish,"฿330,000,000"
37,Pekoms,"฿330,000,000"
37,Vinsmoke Sanji,"฿330,000,000"
40,Basil Hawkins,"฿320,000,000"
40,Gecko Moria,"฿320,000,000"
40,Roronoa Zoro,"฿320,000,000"
43,Lindbergh,"฿316,000,000"
44,Caesar Clown,"฿300,000,000"
44,Charlotte Daifuku,"฿300,000,000"
44,Charlotte Oven,"฿300,000,000"
47,Bartholomew Kuma,"฿296,000,000"
48,Morley,"฿293,000,000"
49,Page One,"฿290,000,000"
50,Fisher Tiger,"฿230,000,000"
51,X Drake,"฿222,000,000"
52,Caribou,"฿210,000,000"
52,Sai,"฿210,000,000"
52,Squard,"฿210,000,000"
55,Bartolomeo,"฿200,000,000"
55,Killer,"฿200,000,000"
55,Usopp,"฿200,000,000"
58,Bellamy,"฿195,000,000"
59,Coribou,"฿190,000,000"
60,Orlumbus,"฿148,000,000"
61,Jewelry Bonney,"฿140,000,000"
62,Nico Robin,"฿130,000,000"
63,Charlotte Mont-d'Or,"฿120,000,000"
64,Urouge,"฿108,000,000"
65,Bobbin,"฿105,500,000"
66,Brogy,"฿100,000,000"
66,Dorry,"฿100,000,000"
68,Diamante,"฿99,000,000"
68,Pica,"฿99,000,000"
68,Trebol,"฿99,000,000"
71,Vito,"฿95,000,000"
72,Franky,"฿94,000,000"
72,Rockstar,"฿94,000,000"
74,Albion,"฿92,000,000"
75,Gotti,"฿90,000,000"
76,Lip Doughty,"฿88,000,000"
77,Brook,"฿83,000,000"
78,Crocodile,"฿81,000,000"
79,Chadros Higelyges,"฿80,060,000"
80,Boa Hancock,"฿80,000,000"
81,Nico Olvia,"฿79,000,000"
82,Daz Bones,"฿75,000,000"
82,Raccoon,"฿75,000,000"
84,Gyro,"฿73,000,000"
85,Doc Q,"฿72,000,000"
86,Gambia,"฿67,000,000"
86,Suleiman,"฿67,000,000"
88,Nami,"฿66,000,000"
89,Van Augur,"฿64,000,000"
90,Lao G,"฿61,000,000"
91,Devil Dias,"฿60,000,000"
92,Senor Pink,"฿58,000,000"
93,Kelly Funk,"฿57,000,000"
94,(pirate shot by Demaro Black in chapter 598),"฿55,000,000"
95,Peachbeard,"฿52,000,000"
96,(pirate defeated by Smoker in chapter 439),"฿50,000,000"
97,Laffitte,"฿42,200,000"
98,(criminal defeated by Mr. 3),"฿42,000,000"
98,Roshio,"฿42,000,000"
100,Boa Marigold,"฿40,000,000"
100,Boa Sandersonia,"฿40,000,000"
102,Sarquiss,"฿38,000,000"
103,Bobby Funk,"฿36,000,000"
103,Mikazuki,"฿36,000,000"
103,Shoujou,"฿36,000,000"
106,Zala,"฿35,000,000"
107,Bentham,"฿32,000,000"
108,Gladius,"฿31,000,000"
109,Marianne,"฿29,000,000"
110,Demaro Black,"฿26,000,000"
111,Mont Blanc Cricket,"฿25,000,000"
112,Charlotte Lola,"฿24,000,000"
112,Foxy,"฿24,000,000"
112,Galdino,"฿24,000,000"
115,Masira,"฿23,000,000"
116,Arlong,"฿20,000,000"
116,Jesus Burgess,"฿20,000,000"
116,Rock (Yeti),"฿20,000,000"
116,Scotch (Yeti),"฿20,000,000"
120,Krieg,"฿17,000,000"
120,Lacuba,"฿17,000,000"
122,Kuro,"฿16,000,000"
123,Buggy,"฿15,000,000"
123,Dellinger,"฿15,000,000"
125,Bluejam,"฿14,300,000"
126,Drophy,"฿14,000,000"
127,Gin,"฿12,000,000"
128,Machvise,"฿11,000,000"
129,Gem,"฿10,000,000"
129,Wellington,"฿10,000,000"
131,Jango,"฿9,000,000"
131,Kuroobi,"฿9,000,000"
133,Hatchan,"฿8,000,000"
133,Higuma,"฿8,000,000"
135,Curly Dadan,"฿7,800,000"
136,Mikita,"฿7,500,000"
137,Buchi,"฿7,000,000"
137,Sham,"฿7,000,000"
139,Chew,"฿5,500,000"
140,Alvida,"฿5,000,000"
141,Porchemy,"฿3,400,000"
142,Babe,"฿3,200,000"
143,Mikio Itoo,"¥1,000,000"
144,Bepo,฿500
145,Tony Tony Chopper,฿100
999,Aladdin,Unknown
999,Avalo Pizarro,Unknown
999,Benn Beckman,Unknown
999,Catarina Devon,Unknown
999,Crocus,Unknown
999,Dracule Mihawk,Unknown
999,Inazuma,Unknown
999,Jozu,Unknown
999,Koala,Unknown
999,Kozuki Oden,Unknown
999,Lucky Roux,Unknown
999,Monkey D. Dragon,Unknown
999,Sanjuan Wolf,Unknown
999,Shiryu,Unknown
999,Silvers Rayleigh,Unknown
999,Vasco Shot,Unknown
999,Vista,Unknown
999,Yasopp,Unknown
999,Yorki,Unknown
999,Zeff,Unknown
`;

// Parse bounty data into a map for easy lookup
const bountyMap = new Map();
const bountyLines = rawBountyData.trim().split('\n').slice(1); // Skip header
bountyLines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 3) {
        const name = parts[1].trim(); // Clean up name
        const rawBounty = parts.slice(2).join(',').trim().replace(/^"|"$/g, ''); // Handle commas in bounty, remove quotes
        let bounty = 0;
        if (rawBounty.startsWith('฿')) {
            // Remove '฿' and commas, then parse as integer
            bounty = parseInt(rawBounty.substring(1).replace(/,/g, ''), 10);
        } else if (rawBounty === 'Unknown') {
            bounty = 'Unknown'; // Keep as string if unknown
        } else {
             // Handle other potential formats or default to 0
             bounty = parseInt(rawBounty.replace(/,/g, ''), 10) || 0;
        }
         // Only add valid names and bounties to the map
        if (name && (typeof bounty === 'number' || bounty === 'Unknown')) {
             // Handle duplicate names by potentially taking the first or last entry
             // For simplicity, the last entry in the data.txt for a name will overwrite previous ones
             bountyMap.set(name, bounty);
        }
    }
});

// Initial stock data
const initialStockData = [
  // === STRAW HAT PIRATES ===
  { id: 1, name: "Monkey D. Luffy", symbol: "LUFFY", price: 9850, change: 2.4, category: "Captain", faction: "Straw Hat Pirates", icon: "👑", power: "Gear 5, Conqueror's Haki, Future Pirate King", description: "Rubber-powered captain with unshakable will", volatility: 0.85, volume: 280000, glow: "luffy-glow" },
  { id: 2, name: "Roronoa Zoro", symbol: "ZORO", price: 8750, change: 5.2, category: "Swordsman", faction: "Straw Hat Pirates", icon: "⚔️", power: "Three Sword Style, King of Hell, Advanced Haki", description: "World's strongest swordsman candidate", volatility: 0.75, volume: 225000, glow: "zoro-glow" },
  { id: 3, name: "Vinsmoke Sanji", symbol: "SANJI", price: 8200, change: 1.8, category: "Cook", faction: "Straw Hat Pirates", icon: "🔥", power: "Diable Jambe, Ifrit Jambe, Germa enhancements", description: "Kicking specialist with fire techniques", volatility: 0.7, volume: 210000, glow: "sanji-glow" },
  { id: 4, name: "Nami", symbol: "NAMI", price: 6500, change: 3.1, category: "Navigator", faction: "Straw Hat Pirates", icon: "🍊", power: "Clima-Tact, Zeus integration, Weather control", description: "Brilliant navigator with weather weapons", volatility: 0.65, volume: 190000, glow: "nami-glow" },
  { id: 5, name: "Usopp", symbol: "USOPP", price: 5000, change: 15.0, category: "Sniper", faction: "Straw Hat Pirates", icon: "🎯", power: "Observation Haki, Pop Greens, Inventor", description: "Sniper king with incredible survival skills", volatility: 0.9, volume: 180000, glow: "usopp-glow" },
  { id: 6, name: "Tony Tony Chopper", symbol: "CHOPP", price: 6000, change: 4.5, category: "Doctor", faction: "Straw Hat Pirates", icon: "🦌", power: "Human-Human Fruit, Monster Point, Medical genius", description: "Adorable reindeer with transformative abilities", volatility: 0.6, volume: 175000, glow: "chopper-glow" },
  { id: 7, name: "Nico Robin", symbol: "ROBIN", price: 7000, change: 2.0, category: "Archaeologist", faction: "Straw Hat Pirates", icon: "🌸", power: "Hana-Hana Fruit, Demonio Fleur, Historian", description: "Last survivor of Ohara with bloom powers", volatility: 0.65, volume: 185000, glow: "robin-glow" },
  { id: 8, name: "Franky", symbol: "FRANK", price: 7200, change: 1.2, category: "Shipwright", faction: "Straw Hat Pirates", icon: "🤖", power: "Cyborg body, Radical Beam, General Franky", description: "Super cyborg shipwright with cola-powered weapons", volatility: 0.55, volume: 170000, glow: "franky-glow" },
  { id: 9, name: "Brook", symbol: "BROOK", price: 6800, change: 0.8, category: "Musician", faction: "Straw Hat Pirates", icon: "💀", power: "Revive-Revive Fruit, Soul King, Ice swordsman", description: "Living skeleton with musical soul powers", volatility: 0.5, volume: 165000, glow: "brook-glow" },
  { id: 10, name: "Jinbe", symbol: "JINBE", price: 7800, change: 2.5, category: "Helmsman", faction: "Straw Hat Pirates", icon: "🐳", power: "Fish-Man Karate, Water manipulation, Ex-Warlord", description: "Knight of the Sea and master helmsman", volatility: 0.6, volume: 195000, glow: "jinbe-glow" },

  // === RED HAIR PIRATES ===
  { id: 11, name: "Shanks", symbol: "SHANK", price: 9600, change: 0.7, category: "Yonko", faction: "Red Hair Pirates", icon: "🍷", power: "Supreme King Haki, Master swordsman", description: "Balance-keeper with formidable crew", volatility: 0.6, volume: 260000, glow: "shanks-glow" },
  { id: 12, name: "Benn Beckman", symbol: "BECK", price: 8900, change: 1.5, category: "First Mate", faction: "Red Hair Pirates", icon: "🚬", power: "Supreme intelligence, Haki mastery", description: "Shanks' right-hand man, feared for his tactical mind", volatility: 0.65, volume: 220000, glow: "beck-glow" },
  { id: 13, name: "Lucky Roux", symbol: "ROUX", price: 8200, change: 2.3, category: "Combatant", faction: "Red Hair Pirates", icon: "🍗", power: "Superhuman speed, Sharpshooting", description: "Jolly marksman with surprising speed", volatility: 0.7, volume: 210000, glow: "roux-glow" },

  // === BLACKBEARD PIRATES ===
  { id: 14, name: "Marshall D. Teach", symbol: "BB", price: 9400, change: 1.2, category: "Yonko", faction: "Blackbeard Pirates", icon: "⚫", power: "Dark-Dark & Tremor-Tremor Fruits", description: "Only known dual Devil Fruit user", volatility: 0.95, volume: 255000, glow: "bb-glow" },
  { id: 15, name: "Jesus Burgess", symbol: "BURG", price: 7800, change: 1.8, category: "Commander", faction: "Blackbeard Pirates", icon: "💪", power: "Wrestling, Enhanced strength", description: "Champion of Blackbeard's crew", volatility: 0.75, volume: 200000, glow: "burg-glow" },
  { id: 16, name: "Shiryu", symbol: "SHIR", price: 8500, change: 2.0, category: "Commander", faction: "Blackbeard Pirates", icon: "💧", power: "Clear-Clear Fruit, Master swordsman", description: "Former Impel Down warden turned assassin", volatility: 0.8, volume: 215000, glow: "shir-glow" },
  { id: 17, name: "Aokiji (Kuzan)", symbol: "AOKI", price: 9450, change: 0.3, category: "Former Admiral", faction: "Blackbeard Pirates", icon: "❄️", power: "Ice-Ice Fruit, Extreme endurance", description: "Former admiral who joined Blackbeard", volatility: 0.6, volume: 235000, glow: "aoki-glow" },

  // === BEAST PIRATES ===
  { id: 18, name: "Kaido", symbol: "KAIDO", price: 9500, change: -1.5, category: "Yonko", faction: "Beast Pirates", icon: "🐉", power: "Fish-Fish Fruit, Model: Azure Dragon", description: "Strongest creature in the world", volatility: 0.9, volume: 250000, glow: "kaido-glow" },
  { id: 19, name: "King", symbol: "KING", price: 8600, change: 3.2, category: "Commander", faction: "Beast Pirates", icon: " pterosaur ", power: "Ancient Zoan: Pteranodon, Lunarian traits", description: "Kaido's right-hand with fiery abilities", volatility: 0.8, volume: 230000, glow: "king-glow" },
  { id: 20, name: "Queen", symbol: "QUEEN", price: 8400, change: 1.5, category: "All-Star", faction: "Beast Pirates", icon: "🦕", power: "Ancient Zoan: Brachiosaurus, Cyborg tech", description: "Mad scientist and plague spreader", volatility: 0.85, volume: 225000, glow: "queen-glow" },
  { id: 21, name: "Jack", symbol: "JACK", price: 8000, change: 1.2, category: "All-Star", faction: "Beast Pirates", icon: "🐘", power: "Ancient Zoan: Mammoth, Extreme durability", description: "The Drought who never knows when to quit", volatility: 0.75, volume: 210000, glow: "jack-glow" },

  // === BIG MOM PIRATES ===
  { id: 22, name: "Big Mom", symbol: "BMOM", price: 9200, change: -0.8, category: "Yonko", faction: "Big Mom Pirates", icon: "🍰", power: "Soul-Soul Fruit, Homie army", description: "Ruthless matriarch with soul powers", volatility: 0.85, volume: 245000, glow: "bmom-glow" },
  { id: 23, name: "Katakuri", symbol: "KATA", price: 8800, change: 2.1, category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍡", power: "Mochi-Mochi Fruit, Future Sight Haki", description: "Perfect warrior with unbeaten record", volatility: 0.7, volume: 230000, glow: "kata-glow" },
  { id: 24, name: "Smoothie", symbol: "SMOO", price: 8300, change: 1.8, category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍹", power: "Squeeze-Squeeze Fruit, Giant form", description: "One of Big Mom's strongest daughters", volatility: 0.65, volume: 215000, glow: "smoo-glow" },

  // === MARINES ===
  { id: 26, name: "Akainu (Sakazuki)", symbol: "AKAINU", price: 9700, change: -0.2, category: "Fleet Admiral", faction: "Marines", icon: "🌋", power: "Magma-Magma Fruit, Absolute Justice", description: "Ruthless leader of the Marines", volatility: 0.7, volume: 240000, glow: "akainu-glow" },
  { id: 27, name: "Kizaru (Borsalino)", symbol: "KIZARU", price: 9550, change: 0.1, category: "Admiral", faction: "Marines", icon: "💡", power: "Glint-Glint Fruit, Light-speed attacks", description: "Unpredictable light-speed admiral", volatility: 0.65, volume: 235000, glow: "kizaru-glow" },
  { id: 28, name: "Fujitora (Issho)", symbol: "FUJI", price: 9350, change: 0.4, category: "Admiral", faction: "Marines", icon: "☄️", power: "Gravity control, Blind swordsman", description: "Kind-hearted admiral who sees with Haki", volatility: 0.55, volume: 230000, glow: "fujitora-glow" },
  { id: 29, name: "Garp", symbol: "GARP", price: 9650, change: 0.6, category: "Hero", faction: "Marines", icon: "✊", power: "Legendary strength, Haki mastery", description: "The Hero who cornered Roger", volatility: 0.5, volume: 250000, glow: "garp-glow" },
  { id: 67, name: "Magellan", symbol: "MAGE", price: 8700, change: 1.2, category: "Warden", faction: "Impel Down", icon: "☠️", power: "Venom-Venom Fruit, Poison immunity", description: "Former chief warden of Impel Down", volatility: 0.7, volume: 220000, glow: "mage-glow" },


  // ===== WARLORDS / CROSS GUILD / INDEPENDENT ===
  { id: 36, name: "Dracule Mihawk", symbol: "MIHAWK", price: 9000, change: 0.5, category: "Swordsman", faction: "Cross Guild", icon: "🦅", power: "World's Strongest Swordsman", description: "Shanks' rival and Zoro's ultimate goal", volatility: 0.55, volume: 220000, glow: "mihawk-glow" },
  { id: 37, name: "Boa Hancock", symbol: "HANCOCK", price: 7500, change: 1.1, category: "Pirate Empress", faction: "Kuja Pirates", icon: "🐍", power: "Love-Love Fruit, Conqueror's Haki", description: "Most beautiful woman with petrification powers", volatility: 0.7, volume: 200000, glow: "hancock-glow" },
  { id: 30, name: "Donquixote Doflamingo", symbol: "DOFLA", price: 9100, change: 1.0, category: "Former Warlord", faction: "Donquixote Pirates", icon: " M ", power: "String-String Fruit, Manipulation", description: "Underworld broker and fallen noble", volatility: 0.9, volume: 245000, glow: "dofla-glow" },
  { id: 65, name: "Crocodile", symbol: "CROC", price: 8500, change: 1.4, category: "Former Warlord", faction: "Cross Guild", icon: "🐊", power: "Sand-Sand Fruit, Hook weapon", description: "Former Alabasta villain turned wildcard", volatility: 0.75, volume: 215000, glow: "croc-glow" },
  { id: 69, name: "Gecko Moria", symbol: "MORIA", price: 7800, change: 0.8, category: "Former Warlord", faction: "Thriller Bark", icon: "🦇", power: "Shadow-Shadow Fruit, Zombie army", description: "Master of shadows and nightmares", volatility: 0.65, volume: 195000, glow: "moria-glow" },
  { id: 70, name: "Buggy", symbol: "BUGGY", price: 5000, change: 15.0, category: "Yonko", faction: "Cross Guild", icon: "🤡", power: "Chop-Chop Fruit, Luck manipulation", description: "Accidental emperor with clown powers", volatility: 0.95, volume: 300000, glow: "buggy-glow" },
  { id: 31, name: "Bartholomew Kuma", symbol: "KUMA", price: 8200, change: 1.5, category: "Former Warlord", faction: "Revolutionary Army", icon: "🐾", power: "Paw-Paw Fruit, Cyborg enhancements", description: "Mysterious revolutionary turned weapon", volatility: 0.75, volume: 205000, glow: "kuma-glow" },


  // === REVOLUTIONARY ARMY ===
  { id: 38, name: "Monkey D. Dragon", symbol: "DRAGON", price: 9900, change: 3.0, category: "Leader", faction: "Revolutionary Army", icon: "🌪️", power: "Unknown, presumed Wind manipulation", description: "Leader of the Revolutionary Army and Luffy's father", volatility: 0.9, volume: 300000, glow: "dragon-glow" },
  { id: 39, name: "Sabo", symbol: "SABO", price: 8800, change: 2.5, category: "Chief of Staff", faction: "Revolutionary Army", icon: "🎩", power: "Mera Mera no Mi, Advanced Haki", description: "Dragon's right-hand and wielder of Ace's flame powers", volatility: 0.85, volume: 250000, glow: "sabo-glow" },
  { id: 32, name: "Emporio Ivankov", symbol: "IVAN", price: 7500, change: 1.9, category: "Commander", faction: "Revolutionary Army", icon: "💉", power: "Horm-Horm Fruit, Gender switching", description: "Queen of Kamabakka Kingdom", volatility: 0.7, volume: 195000, glow: "ivan-glow" },
  // Kuma also listed here (ID 31)

  // === WORST GENERATION ===
  { id: 40, name: "Trafalgar D. Water Law", symbol: "LAW", price: 8700, change: 1.8, category: "Captain", faction: "Heart Pirates", icon: "💔", power: "Op-Op Fruit, Surgical Genius", description: "Former Warlord and strategic Supernova", volatility: 0.8, volume: 240000, glow: "law-glow" },
  { id: 41, name: "Eustass Kid", symbol: "KID", price: 8600, change: 2.1, category: "Captain", faction: "Kid Pirates", icon: "🔩", power: "Magnetism, Armored Assaults", description: "Aggressive Supernova with magnetic powers", volatility: 0.85, volume: 235000, glow: "kid-glow" },
  { id: 33, name: "Basil Hawkins", symbol: "HAWK", price: 7200, change: 2.2, category: "Captain", faction: "Hawkins Pirates", icon: "🃏", power: "Straw-Straw Fruit, Tarot predictions", description: "Fatalistic pirate who manipulates fate", volatility: 0.8, volume: 185000, glow: "hawk-glow" },
  { id: 34, name: "Scratchmen Apoo", symbol: "APOO", price: 7100, change: 2.5, category: "Captain", faction: "On Air Pirates", icon: "🎵", power: "Music-based attacks, Sound manipulation", description: "Musical pirate who plays both sides", volatility: 0.85, volume: 180000, glow: "apoo-glow" },

  // === WHITEBEARD PIRATES ===
  { id: 62, name: "Edward Newgate", symbol: "WB", price: 9750, change: -0.5, category: "Former Yonko", faction: "Whitebeard Pirates", icon: "🌊", power: "Tremor-Tremor Fruit, Strongest man", description: "The late father of the seas", volatility: 0.6, volume: 265000, glow: "wb-glow" },
  { id: 63, name: "Marco", symbol: "MARCO", price: 8900, change: 1.7, category: "First Division", faction: "Whitebeard Pirates", icon: "🐦", power: "Phoenix Fruit, Regeneration", description: "Whitebeard's right-hand and healer", volatility: 0.65, volume: 225000, glow: "marco-glow" },
  { id: 64, name: "Portgas D. Ace", symbol: "ACE", price: 9100, change: 0.9, category: "Former Commander", faction: "Whitebeard Pirates", icon: "♠️", power: "Flame-Flame Fruit, Haki mastery", description: "Luffy's late brother with fiery will", volatility: 0.7, volume: 240000, glow: "ace-glow" },

  // === ROGER PIRATES ===
  { id: 42, name: "Silvers Rayleigh", symbol: "RAY", price: 9500, change: 1.5, category: "First Mate", faction: "Roger Pirates", icon: "👓", power: "Advanced Haki, Swordsmanship", description: "The Dark King and mentor to Luffy", volatility: 0.7, volume: 270000, glow: "rayleigh-glow" },

   // === CP0 / WORLD GOVT ===
  { id: 35, name: "Rob Lucci", symbol: "LUCCI", price: 8900, change: 1.3, category: "Agent", faction: "CP0", icon: "🐆", power: "Cat-Cat Fruit, Model: Leopard, Rokushiki", description: "Lethal assassin and master of Rokushiki", volatility: 0.85, volume: 230000, glow: "lucci-glow" },
  { id: 76, name: "Imu", symbol: "IMU", price: 10000, change: 0.1, category: "Sovereign", faction: "World Government", icon: "👁️‍🗨️", power: "Unknown, Ultimate authority", description: "Mysterious ruler of the World Government", volatility: 0.5, volume: 300000, glow: "imu-glow" },

  // === FIVE ELDERS ===
  { id: 46, name: "Saint Jaygarcia Saturn", symbol: "SATURN", price: 9800, change: 0.5, category: "Elder", faction: "Five Elders", icon: "🕷️", power: "Mythical Zoan – Gyuki (Ox-Spider)", description: "Warrior God of Science and Defense", volatility: 0.6, volume: 260000, glow: "saturn-glow" },
  { id: "47A", name: "Saint Marcus Mars", symbol: "MARS", price: 9700, change: 0.4, category: "Elder", faction: "Five Elders", icon: "鳥", power: "Mythical Zoan – Itsumade (Serpent-Bird)", description: "Warrior God of Environment", volatility: 0.5, volume: 240000, glow: "mars-glow" },
  { id: "48A", name: "Saint Topman Warcury", symbol: "MERCURY", price: 9650, change: 0.3, category: "Elder", faction: "Five Elders", icon: "🐗", power: "Mythical Zoan – Fengxi (Boar Demon)", description: "Warrior God of Justice", volatility: 0.4, volume: 230000, glow: "warcury-glow" },
  { id: "49A", name: "Saint Ethanbaron V. Nusjuro", symbol: "VENUS", price: 9600, change: 0.6, category: "Elder", faction: "Five Elders", icon: "🐴", power: "Mythical Zoan – Bakotsu (Skeletal Horse)", description: "Warrior God of Finance", volatility: 0.7, volume: 250000, glow: "nusjuro-glow" },
  { id: "50A", name: "Saint Shepherd Ju Peter", symbol: "JUPITER", price: 9550, change: 0.2, category: "Elder", faction: "Five Elders", icon: "🐛", power: "Mythical Zoan – Sandworm", description: "Warrior God of Agriculture", volatility: 0.3, volume: 220000, glow: "jupeter-glow" },

   // === GOD KNIGHTS ===
  { id: 71, name: "Figarland Garling", symbol: "GARL", price: 9900, change: 0.5, category: "Supreme Commander", faction: "God Knights", icon: "⚜️", power: "Supreme Haki, Champion of God Valley", description: "Ruthless enforcer of Celestial Dragon law.", volatility: 0.7, volume: 300000, glow: "garling-glow" },
  { id: 72, name: "Figarland Shamrock", symbol: "SHAM", price: 9600, change: 1.8, category: "Commander", faction: "God Knights", icon: "🍀", power: "Cerberus Blade (Mythical Zoan), Advanced Haki", description: "Shanks' twin brother. Commands living sword.", volatility: 0.85, volume: 280000, glow: "shamrock-glow" },
  { id: 73, name: "Gunko", symbol: "GUNK", price: 8800, change: 2.3, category: "Elite Knight", faction: "God Knights", icon: "🏹", power: "Aro Aro no Mi (Arrow-Arrow Fruit)", description: "Creates vector arrows that manipulate motion.", volatility: 0.8, volume: 250000, glow: "gunko-glow" },
  { id: 74, name: "Rimoshifu Killingham", symbol: "KILL", price: 8700, change: 1.5, category: "Elite Knight", faction: "God Knights", icon: "🌙", power: "Ryu Ryu no Mi, Model: Kirin (Mythical Zoan)", description: "Materializes dreams/nightmares.", volatility: 0.9, volume: 240000, glow: "killingham-glow" },
  { id: 75, name: "Shepherd Sommers", symbol: "SOMM", price: 8500, change: 1.2, category: "Knight", faction: "God Knights", icon: "🌵", power: "Iba Iba no Mi (Thorn-Thorn Fruit)", description: "Generates invisible pain-inducing thorns.", volatility: 0.75, volume: 230000, glow: "sommers-glow" },

  // === OTHERS ===
  { id: 66, name: "Enel", symbol: "ENEL", price: 9300, change: 2.0, category: "God", faction: "Skypiea", icon: "⚡", power: "Rumble-Rumble Fruit, Mantra", description: "Self-proclaimed god of lightning", volatility: 0.85, volume: 245000, glow: "enel-glow" }

];

// Map over the initial stock data and add bounty information
const stockData = initialStockData.map(character => {
    const bounty = bountyMap.get(character.name);
    return {
        ...character,
        // Add bounty, defaulting to 0 or 'Unknown' if not found in data.txt
        bounty: bounty !== undefined ? bounty : 'Unknown'
    };
});


// Add generated history to each character
// Define MAX_HISTORY_DAYS here as it's used by generatePriceHistory
const MAX_HISTORY_DAYS = 30; // Max history days for generation and slicing

stockData.forEach(character => {
  // Check if history needs generation (e.g., if it wasn't hardcoded)
  if (!character.history) {
      // Ensure basePrice and volatility are valid numbers
      const basePrice = typeof character.price === 'number' ? character.price : MIN_PRICE;
      const volatility = typeof character.volatility === 'number' ? character.volatility : 0.5; // Default volatility
      character.history = generatePriceHistory(basePrice, volatility, MAX_HISTORY_DAYS); // Use MAX_HISTORY_DAYS
  }
   // Ensure the current price matches the latest history entry if generated/exists
   if (character.history && character.history.length > 0) {
        const latestHistoryPrice = character.history[character.history.length - 1].price;
        // Optionally update character price to match latest history for consistency on load
        // character.price = latestHistoryPrice;
   } else if (!character.history) {
        // Fallback if history generation failed or wasn't applied
        character.history = [{ date: new Date().toISOString().split('T')[0], price: character.price }];
   }
});


// ==========================================================================\
// Data Loading Function
// ==========================================================================\

/**
 * Simple function to load character data.
 * In a real app, this might fetch from an API.
 * @returns {Promise<Array<object>>} - A promise resolving with the stockData array.
 */
function loadCharacterData() {
  // Return the stockData array wrapped in a Promise to maintain
  // compatibility with potential future async loading.
  // Perform a deep copy to prevent direct modification of the original data
  // if other modules were to import and modify stockData directly.
  const dataCopy = JSON.parse(JSON.stringify(stockData));
  return Promise.resolve(dataCopy);
}

// ==========================================================================\
// Exports
// ==========================================================================\

export { stockData, loadCharacterData, generatePriceHistory, MIN_PRICE, MAX_HISTORY_DAYS };
