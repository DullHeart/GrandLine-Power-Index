
// Constants for history generation
const MILLISECONDS_IN_A_DAY = 86400000;
const MIN_PRICE = 100;

// Helper function to generate price history
function generatePriceHistory(basePrice, volatility, days) {
    return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        // Corrected date calculation to go back in time
        date.setDate(date.getDate() - (days - 1 - i));

        // Ensure price is within bounds during history generation
        const price = Math.max(MIN_PRICE, basePrice * (1 + (Math.random() * 2 - 1) * volatility));

        return {
            date: date.toISOString().split('T')[0],
            price: Math.round(price) // Rounded price for history
        };
    });
}

// One Piece Character Stock Database
const stockData = [
    // === STRAW HAT PIRATES (10) ===
    {
        id: 1, name: "Monkey D. Luffy", symbol: "LUFFY", price: 9850,
        change: 2.4, category: "Captain", faction: "Straw Hat Pirates", icon: "👑",
        power: "Gear 5, Conqueror's Haki, Future Pirate King",
        description: "Rubber-powered captain with unshakable will",
        volatility: 0.85, volume: 280000, glow: "luffy-glow",
        history: generatePriceHistory(9850, 0.85, 30)
    },
    {
        id: 2, name: "Roronoa Zoro", symbol: "ZORO", price: 8750,
        change: 5.2, category: "Swordsman", faction: "Straw Hat Pirates", icon: "⚔️",
        power: "Three Sword Style, King of Hell, Advanced Haki",
        description: "World's strongest swordsman candidate",
        volatility: 0.75, volume: 225000, glow: "zoro-glow",
        history: generatePriceHistory(8750, 0.75, 30)
    },
    {
        id: 3, name: "Vinsmoke Sanji", symbol: "SANJI", price: 8200,
        change: 1.8, category: "Cook", faction: "Straw Hat Pirates", icon: "🍳",
        power: "Diable Jambe, Ifrit Jambe, Germa enhancements",
        description: "Kicking specialist with fire techniques",
        volatility: 0.7, volume: 210000, glow: "sanji-glow",
        history: generatePriceHistory(8200, 0.7, 30)
    },
    {
        id: 4, name: "Nami", symbol: "NAMI", price: 6500, change: 3.1,
        category: "Navigator", faction: "Straw Hat Pirates", icon: "🌍",
        power: "Clima-Tact, Zeus integration, Weather control",
        description: "Brilliant navigator with weather weapons",
        volatility: 0.65, volume: 190000, glow: "nami-glow",
        history: generatePriceHistory(6500, 0.65, 30)
    },
    {
        id: 5, name: "Usopp", symbol: "USOPP", price: 5000, change: 15.0,
        category: "Sniper", faction: "Straw Hat Pirates", icon: "🎯",
        power: "Observation Haki, Pop Greens, Inventor",
        description: "Sniper king with incredible survival skills",
        volatility: 0.9, volume: 180000, glow: "usopp-glow",
        history: generatePriceHistory(5000, 0.9, 30)
    },
    {
        id: 6, name: "Tony Tony Chopper", symbol: "CHOPP", price: 6000, change: 4.5,
        category: "Doctor", faction: "Straw Hat Pirates", icon: "🦌",
        power: "Human-Human Fruit, Monster Point, Medical genius",
        description: "Adorable reindeer with transformative abilities",
        volatility: 0.6, volume: 175000, glow: "chopper-glow",
        history: generatePriceHistory(6000, 0.6, 30)
    },
    {
        id: 7, name: "Nico Robin", symbol: "ROBIN", price: 7000,
        change: 2.0, category: "Archaeologist", faction: "Straw Hat Pirates", icon: "📚",
        power: "Hana-Hana Fruit, Demonio Fleur, Historian",
        description: "Last survivor of Ohara with bloom powers",
        volatility: 0.65, volume: 185000, glow: "robin-glow",
        history: generatePriceHistory(7000, 0.65, 30)
    },
    {
        id: 8, name: "Franky", symbol: "FRANK", price: 7200, change: 1.2,
        category: "Shipwright", faction: "Straw Hat Pirates", icon: "🔩",
        power: "Cyborg body, Radical Beam, General Franky",
        description: "Super cyborg shipwright with cola-powered weapons",
        volatility: 0.55, volume: 170000, glow: "franky-glow",
        history: generatePriceHistory(7200, 0.55, 30)
    },
    {
        id: 9, name: "Brook", symbol: "BROOK", price: 6800, change: 0.8,
        category: "Musician", faction: "Straw Hat Pirates", icon: "💀",
        power: "Revive-Revive Fruit, Soul King, Ice swordsman",
        description: "Living skeleton with musical soul powers",
        volatility: 0.5, volume: 165000, glow: "brook-glow",
        history: generatePriceHistory(6800, 0.5, 30)
    },
    {
        id: 10, name: "Jinbe", symbol: "JINBE", price: 7800, change: 2.5,
        category: "Helmsman", faction: "Straw Hat Pirates", icon: "🌊",
        power: "Fish-Man Karate, Water manipulation, Ex-Warlord",
        description: "Knight of the Sea and master helmsman",
        volatility: 0.6, volume: 195000, glow: "jinbe-glow",
        history: generatePriceHistory(7800, 0.6, 30)
    },
    // ===== YONKO & COMMANDERS =====
    // === RED HAIR PIRATES ===

    {
        id: 11, name: "Shanks", symbol: "SHANK", price: 9600, change: 0.7,
        category: "Yonko", faction: "Red Hair Pirates", icon: "⭐",
        power: "Supreme King Haki, Master swordsman",
        description: "Balance-keeper with formidable crew",
        volatility: 0.6, volume: 260000, glow: "shanks-glow",
        history: generatePriceHistory(9600, 0.6, 30)
    },
    {
        id: 47, name: "Benn Beckman", symbol: "BECK", price: 8900, change: 1.5,
        category: "First Mate", faction: "Red Hair Pirates", icon: "🔫",
        power: "Supreme intelligence, Haki mastery",
        description: "Shanks' right-hand man, feared for his tactical mind",
        volatility: 0.65, volume: 220000, glow: "beck-glow",
        history: generatePriceHistory(8900, 0.65, 30)
    },
    {
        id: 48, name: "Lucky Roux", symbol: "ROUX", price: 8200, change: 2.3,
        category: "Combatant", faction: "Red Hair Pirates", icon: "🍗",
        power: "Superhuman speed, Sharpshooting",
        description: "Jolly marksman with surprising speed",
        volatility: 0.7, volume: 210000, glow: "roux-glow",
        history: generatePriceHistory(8200, 0.7, 30)
    },
      // === BLACKBEARD PIRATES ===
      {
        id: 43,
        name: "Marshall D. Teach",
        symbol: "BB",
        price: 9400,
        change: 1.2,
        category: "Yonko",
        faction: "Blackbeard Pirates",
        icon: "🚢",
        power: "Dark-Dark & Tremor-Tremor Fruits",
        description: "Only known dual Devil Fruit user",
        volatility: 0.95,
        volume: 255000,
        glow: "bb-glow",
        history: generatePriceHistory(9400, 0.95, 30)
      },
    {
        id: 49, name: "Jesus Burgess", symbol: "BURG", price: 7800, change: 1.8,
        category: "Commander", faction: "Blackbeard Pirates", icon: "💪",
        power: "Wrestling, Enhanced strength",
        description: "Champion of Blackbeard's crew",
        volatility: 0.75, volume: 200000, glow: "burg-glow",
        history: generatePriceHistory(7800, 0.75, 30)
    },
    {
        id: 50, name: "Shiryu", symbol: "SHIR", price: 8500, change: 2.0,
        category: "Commander", faction: "Blackbeard Pirates", icon: "🗡️",
        power: "Clear-Clear Fruit, Master swordsman",
        description: "Former Impel Down warden turned assassin",
        volatility: 0.8, volume: 215000, glow: "shir-glow",
        history: generatePriceHistory(8500, 0.8, 30)
    },
        // === BEAST PIRATES ===

    {
        id: 13, name: "Kaido", symbol: "KAIDO", price: 9500, change: -1.5,
        category: "Yonko", faction: "Beast Pirates", icon: "🐉",
        power: "Fish-Fish Fruit, Model: Azure Dragon",
        description: "Strongest creature in the world",
        volatility: 0.9, volume: 250000, glow: "kaido-glow",
        history: generatePriceHistory(9500, 0.9, 30)
    },
    {
        id: 15, name: "King", symbol: "KING", price: 8600, change: 3.2,
        category: "Commander", faction: "Beast Pirates", icon: "🔥",
        power: "Ancient Zoan: Pteranodon, Lunarian traits",
        description: "Kaido's right-hand with fiery abilities",
        volatility: 0.8, volume: 230000, glow: "king-glow",
        history: generatePriceHistory(8600, 0.8, 30)
    },
    {
        id: 51, name: "Queen", symbol: "QUEEN", price: 8400, change: 1.5,
        category: "All-Star", faction: "Beast Pirates", icon: "🦕",
        power: "Ancient Zoan: Brachiosaurus, Cyborg tech",
        description: "Mad scientist and plague spreader",
        volatility: 0.85, volume: 225000, glow: "queen-glow",
        history: generatePriceHistory(8400, 0.85, 30)
    },
    {
        id: 52, name: "Jack", symbol: "JACK", price: 8000, change: 1.2,
        category: "All-Star", faction: "Beast Pirates", icon: "🐘",
        power: "Ancient Zoan: Mammoth, Extreme durability",
        description: "The Drought who never knows when to quit",
        volatility: 0.75, volume: 210000, glow: "jack-glow",
        history: generatePriceHistory(8000, 0.75, 30)
    },

        // === BIG MOM PIRATES ===

    {
        id: 14, name: "Big Mom", symbol: "BMOM", price: 9200, change: -0.8,
        category: "Yonko", faction: "Big Mom Pirates", icon: "🍰",
        power: "Soul-Soul Fruit, Homie army",
        description: "Ruthless matriarch with soul powers",
        volatility: 0.85, volume: 245000, glow: "bmom-glow",
        history: generatePriceHistory(9200, 0.85, 30)
    },
    {
        id: 53, name: "Katakuri", symbol: "KATA", price: 8800, change: 2.1,
        category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍡",
        power: "Mochi-Mochi Fruit, Future Sight Haki",
        description: "Perfect warrior with unbeaten record",
        volatility: 0.7, volume: 230000, glow: "kata-glow",
        history: generatePriceHistory(8800, 0.7, 30)
    },
    {
        id: 54, name: "Smoothie", symbol: "SMOO", price: 8300, change: 1.8,
        category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍹",
        power: "Squeeze-Squeeze Fruit, Giant form",
        description: "One of Big Mom's strongest daughters",
        volatility: 0.65, volume: 215000, glow: "smoo-glow",
        history: generatePriceHistory(8300, 0.65, 30)
    },
    
    // === MARINES ===
    {
        id: 26, name: "Akainu", symbol: "AKAINU", price: 9700, change: -0.2,
        category: "Fleet Admiral", faction: "Marines", icon: "🌋",
        power: "Magma-Magma Fruit, Absolute Justice",
        description: "Ruthless leader of the Marines",
        volatility: 0.7, volume: 240000, glow: "akainu-glow",
        history: generatePriceHistory(9700, 0.7, 30)
    },
    {
        id: 27, name: "Kizaru", symbol: "KIZARU", price: 9550, change: 0.1,
        category: "Admiral", faction: "Marines", icon: "✨",
        power: "Glint-Glint Fruit, Light-speed attacks",
        description: "Unpredictable light-speed admiral",
        volatility: 0.65, volume: 235000, glow: "kizaru-glow",
        history: generatePriceHistory(9550, 0.65, 30)
    },
    {
        id: 55, name: "Aokiji", symbol: "AOKI", price: 9450, change: 0.3,
        category: "Former Admiral", faction: "Blackbeard Pirates", icon: "❄️",
        power: "Ice-Ice Fruit, Extreme endurance",
        description: "Former admiral who joined Blackbeard",
        volatility: 0.6, volume: 235000, glow: "aoki-glow",
        history: generatePriceHistory(9450, 0.6, 30)
    },
    {
        id: 56, name: "Fujitora", symbol: "FUJI", price: 9350, change: 0.4,
        category: "Admiral", faction: "Marines", icon: "☄️",
        power: "Gravity control, Blind swordsman",
        description: "Kind-hearted admiral who sees with Haki",
        volatility: 0.55, volume: 230000, glow: "fuji-glow",
        history: generatePriceHistory(9350, 0.55, 30)
    },
    {
        id: 57, name: "Garp", symbol: "GARP", price: 9650, change: 0.6,
        category: "Hero", faction: "Marines", icon: "👊",
        power: "Legendary strength, Haki mastery",
        description: "The Hero who cornered Roger",
        volatility: 0.5, volume: 250000, glow: "garp-glow",
        history: generatePriceHistory(9650, 0.5, 30)
    },

    // ===== WARLORDS ====
    {
        id: 36, name: "Dracule Mihawk", symbol: "MIHAWK", price: 9000,
        change: 0.5, category: "Swordsman", faction: "Independent", icon:"👁️",
        power: "World's Strongest Swordsman",
        description: "Shanks' rival and Zoro's ultimate goal",
        volatility: 0.55, volume: 220000, glow: "mihawk-glow",
        history: generatePriceHistory(9000, 0.55, 30)
    },
    {
        id: 37, name: "Boa Hancock", symbol: "HANCOCK", price: 7500,
        change: 1.1, category: "Pirate Empress", faction: "Kuja Pirates", icon: "🐍",
        power: "Love-Love Fruit, Conqueror's Haki",
        description: "Most beautiful woman with petrification powers",
        volatility: 0.7, volume: 200000, glow: "hancock-glow",
        history: generatePriceHistory(7500, 0.7, 30)
    },
    {
        id: 44,
        name: "Donquixote Doflamingo",
        symbol: "DOFLA",
        price: 9100,
        change: 1.0,
        category: "Former Warlord",
        faction: "Donquixote Pirates",
        icon: "🕷️",
        power: "String-String Fruit, Manipulation",
        description: "Underworld broker and fallen noble",
        volatility: 0.9,
        volume: 245000,
        glow: "dofla-glow",
        history: generatePriceHistory(9100, 0.9, 30)
    },
    {
        id: 65, name: "Crocodile", symbol: "CROC", price: 8500, change: 1.4,
        category: "Former Warlord", faction: "Cross Guild", icon: "🏜️",
        power: "Sand-Sand Fruit, Hook weapon",
        description: "Former Alabasta villain turned wildcard",
        volatility: 0.75, volume: 215000, glow: "croc-glow",
        history: generatePriceHistory(8500, 0.75, 30)
    },
    {
        id: 69, name: "Gecko Moria", symbol: "MORIA", price: 7800, change: 0.8,
        category: "Former Warlord", faction: "Thriller Bark", icon: "✂️",
        power: "Shadow-Shadow Fruit, Zombie army",
        description: "Master of shadows and nightmares",
        volatility: 0.65, volume: 195000, glow: "moria-glow",
        history: generatePriceHistory(7800, 0.65, 30)
    },

     // === REVOLUTIONARY ARMY ===
    {
        id: 38,
        name: "Monkey D. Dragon",
        symbol: "DRAGON",
        price: 9900,
        change: 3.0,
        category: "Leader",
        faction: "Revolutionary Army",
        icon: "🐉",
        power: "Unknown, presumed Wind manipulation",
        description: "Leader of the Revolutionary Army and Luffy's father",
        volatility: 0.9,
        volume: 300000,
        glow: "dragon-glow",
        history: generatePriceHistory(9900, 0.9, 30)
    },
    {
        id: 39,
        name: "Sabo",
        symbol: "SABO",
        price: 8800,
        change: 2.5,
        category: "Chief of Staff",
        faction: "Revolutionary Army",
        icon: "🔥",
        power: "Mera Mera no Mi, Advanced Haki",
        description: "Dragon's right-hand and wielder of Ace's flame powers",
        volatility: 0.85,
        volume: 250000,
        glow: "sabo-glow",
        history: generatePriceHistory(8800, 0.85, 30)
    },
    {
        id: 58, name: "Emporio Ivankov", symbol: "IVAN", price: 7500, change: 1.9,
        category: "Commander", faction: "Revolutionary Army", icon: "💃",
        power: "Horm-Horm Fruit, Gender switching",
        description: "Queen of Kamabakka Kingdom",
        volatility: 0.7, volume: 195000, glow: "ivan-glow",
        history: generatePriceHistory(7500, 0.7, 30)
    },
    {
        id: 59, name: "Bartholomew Kuma", symbol: "KUMA", price: 8200, change: 1.5,
        category: "Former Warlord", faction: "Revolutionary Army", icon: "🐻",
        power: "Paw-Paw Fruit, Cyborg enhancements",
        description: "Mysterious revolutionary turned weapon",
        volatility: 0.75, volume: 205000, glow: "kuma-glow",
        history: generatePriceHistory(8200, 0.75, 30)
    },

       // === WORST GENERATION ===
    {
        id: 40,
        name: "Trafalgar D. Water Law",
        symbol: "LAW",
        price: 8700,
        change: 1.8,
        category: "Captain",
        faction: "Heart Pirates",
        icon: "💉",
        power: "Op-Op Fruit, Surgical Genius",
        description: "Former Warlord and strategic Supernova",
        volatility: 0.8,
        volume: 240000,
        glow: "law-glow",
        history: generatePriceHistory(8700, 0.8, 30)
    },
    {
        id: 41,
        name: "Eustass Kid",
        symbol: "KID",
        price: 8600,
        change: 2.1,
        category: "Captain",
        faction: "Kid Pirates",
        icon: "🧲",
        power: "Magnetism, Armored Assaults",
        description: "Aggressive Supernova with magnetic powers",
        volatility: 0.85,
        volume: 235000,
        glow: "kid-glow",
        history: generatePriceHistory(8600, 0.85, 30)
    },
    {
        id: 60, name: "Basil Hawkins", symbol: "HAWK", price: 7200, change: 2.2,
        category: "Captain", faction: "Hawkins Pirates", icon: "🎴",
        power: "Straw-Straw Fruit, Tarot predictions",
        description: "Fatalistic pirate who manipulates fate",
        volatility: 0.8, volume: 185000, glow: "hawk-glow",
        history: generatePriceHistory(7200, 0.8, 30)
    },
    {
        id: 61, name: "Scratchmen Apoo", symbol: "APOO", price: 7100, change: 2.5,
        category: "Captain", faction: "On Air Pirates", icon: "🎵",
        power: "Music-based attacks, Sound manipulation",
        description: "Musical pirate who plays both sides",
        volatility: 0.85, volume: 180000, glow: "apoo-glow",
        history: generatePriceHistory(7100, 0.85, 30)
    },
    // === Whitebeard Pirates ===
    {
        id: 62, name: "Edward Newgate", symbol: "WB", price: 9750, change: -0.5,
        category: "Former Yonko", faction: "Whitebeard Pirates", icon: "👨‍🦳",
        power: "Tremor-Tremor Fruit, Strongest man",
        description: "The late father of the seas",
        volatility: 0.6, volume: 265000, glow: "wb-glow",
        history: generatePriceHistory(9750, 0.6, 30)
    },
    {
        id: 63, name: "Marco", symbol: "MARCO", price: 8900, change: 1.7,
        category: "First Division", faction: "Whitebeard Pirates", icon: "🦅",
        power: "Phoenix Fruit, Regeneration",
        description: "Whitebeard's right-hand and healer",
        volatility: 0.65, volume: 225000, glow: "marco-glow",
        history: generatePriceHistory(8900, 0.65, 30)
    },
    {
        id: 64, name: "Portgas D. Ace", symbol: "ACE", price: 9100, change: 0.9,
        category: "Former Commander", faction: "Whitebeard Pirates", icon: "🔥",
        power: "Flame-Flame Fruit, Haki mastery",
        description: "Luffy's late brother with fiery will",
        volatility: 0.7, volume: 240000, glow: "ace-glow",
        history: generatePriceHistory(9100, 0.7, 30)
    },
    // === ROGER PIRATES ===

    {
        id: 42,
        name: "Silvers Rayleigh",
        symbol: "RAY",
        price: 9500,
        change: 1.5,
        category: "First Mate",
        faction: "Roger Pirates",
        icon: "⚓",
        power: "Advanced Haki, Swordsmanship",
        description: "The Dark King and mentor to Luffy",
        volatility: 0.7,
        volume: 270000,
        glow: "rayleigh-glow",
        history: generatePriceHistory(9500, 0.7, 30)
    },

    // === CP0 ===
    {
        id: 45,
        name: "Rob Lucci",
        symbol: "LUCCI",
        price: 8900,
        change: 1.3,
        category: "Agent",
        faction: "CP0",
        icon: "🐆",
        power: "Cat-Cat Fruit, Model: Leopard, Rokushiki",
        description: "Lethal assassin and master of Rokushiki",
        volatility: 0.85,
        volume: 230000,
        glow: "lucci-glow",
        history: generatePriceHistory(8900, 0.85, 30)
    },
    // === FIVE ELDERS ===
    {
        id: 46,
        name: "Saint Jaygarcia Saturn",
        symbol: "SATURN",
        price: 9800,
        change: 0.5,
        category: "Elder",
        faction: "Five Elders",
        icon: "🪐",
        power: "Mythical Zoan – Gyuki (Ox-Spider)",
        description: "Warrior God of Science and Defense; transforms into a Gyuki, a yokai with the head of an ox and the body of a spider.",
        volatility: 0.6,
        volume: 260000,
        glow: "saturn-glow",
        history: generatePriceHistory(9800, 0.6, 30)
    },
    {
        id: 47,
        name: "Saint Marcus Mars",
        symbol: "MARS",
        price: 9700,
        change: 0.4,
        category: "Elder",
        faction: "Five Elders",
        icon: "🔥",
        power: "Mythical Zoan – Itsumade (Serpent-Bird)",
        description: "Warrior God of Environment; transforms into an Itsumade, a bird-like yokai with a serpent's body.",
        volatility: 0.5,
        volume: 240000,
        glow: "mars-glow",
        history: generatePriceHistory(9700, 0.5, 30)
    },
    {
        id: 48,
        name: "Saint Topman Warcury",
        symbol: "MERCURY",
        price: 9650,
        change: 0.3,
        category: "Elder",
        faction: "Five Elders",
        icon: "⚖️",
        power: "Mythical Zoan – Fengxi (Boar Demon)",
        description: "Warrior God of Justice; transforms into a Fengxi, a giant boar-like creature from Chinese mythology.",
        volatility: 0.4,
        volume: 230000,
        glow: "warcury-glow",
        history: generatePriceHistory(9650, 0.4, 30)
    },
    {
        id: 49,
        name: "Saint Ethanbaron V. Nusjuro",
        symbol: "VENUS",
        price: 9600,
        change: 0.6,
        category: "Elder",
        faction: "Five Elders",
        icon: "💰",
        power: "Mythical Zoan – Bakotsu (Skeletal Horse)",
        description: "Warrior God of Finance; transforms into a Bakotsu, a skeletal horse yokai, and wields a sword imbued with ice.",
        volatility: 0.7,
        volume: 250000,
        glow: "nusjuro-glow",
        history: generatePriceHistory(9600, 0.7, 30)
    },
    {
        id: 50,
        name: "Saint Shepherd Ju Peter",
        symbol: "JUPITER",
        price: 9550,
        change: 0.2,
        category: "Elder",
        faction: "Five Elders",
        icon: "🌾",
        power: "Mythical Zoan – Sandworm",
        description: "Warrior God of Agriculture; transforms into a massive sandworm capable of burrowing and emitting powerful suction attacks.",
        volatility: 0.3,
        volume: 220000,
        glow: "jupeter-glow",
        history: generatePriceHistory(9550, 0.3, 30)
    },

    

    // === GOD KNIGHTS (HOLY KNIGHTS) === 
    {
        id: 71, 
        name: "Figarland Garling", 
        symbol: "GARL", 
        price: 9900, 
        change: 0.5, 
        category: "Supreme Commander", 
        faction: "God Knights/Five Elders", 
        icon: "⚔️",
        power: "Supreme Haki, Champion of God Valley",
        description: "Former God Knights leader promoted to Elder. Ruthless enforcer of Celestial Dragon law.",
        volatility: 0.7, 
        volume: 300000, 
        glow: "garling-glow",
        history: generatePriceHistory(9900, 0.7, 30)
    },
    {
        id: 72, 
        name: "Figarland Shamrock", 
        symbol: "SHAM", 
        price: 9600, 
        change: 1.8, 
        category: "Commander", 
        faction: "God Knights", 
        icon: "🦮",
        power: "Cerberus Blade (Mythical Zoan), Advanced Haki",
        description: "Shanks' twin brother. Commands living sword that transforms into a three-headed hound.",
        volatility: 0.85, 
        volume: 280000, 
        glow: "shamrock-glow",
        history: generatePriceHistory(9600, 0.85, 30)
    },
    {
        id: 73, 
        name: "Gunko", 
        symbol: "GUNK", 
        price: 8800, 
        change: 2.3, 
        category: "Elite Knight", 
        faction: "God Knights", 
        icon: "🏹",
        power: "Aro Aro no Mi (Arrow-Arrow Fruit)",
        description: "Creates vector arrows that manipulate motion and inflict trauma. Suspected regeneration abilities.",
        volatility: 0.8, 
        volume: 250000, 
        glow: "gunko-glow",
        history: generatePriceHistory(8800, 0.8, 30)
    },
    {
        id: 74, 
        name: "Rimoshifu Killingham", 
        symbol: "KILL", 
        price: 8700, 
        change: 1.5, 
        category: "Elite Knight", 
        faction: "God Knights", 
        icon: "🦄",
        power: "Ryu Ryu no Mi, Model: Kirin (Mythical Zoan)",
        description: "Materializes dreams/nightmares. Puts targets to sleep with cloud-based hypnosis.",
        volatility: 0.9, 
        volume: 240000, 
        glow: "killingham-glow",
        history: generatePriceHistory(8700, 0.9, 30)
    },
    {
        id: 75, 
        name: "Shepherd Sommers", 
        symbol: "SOMM", 
        price: 8500, 
        change: 1.2, 
        category: "Knight", 
        faction: "God Knights", 
        icon: "🌹",
        power: "Iba Iba no Mi (Thorn-Thorn Fruit)",
        description: "Generates invisible pain-inducing thorns. Emotional damage scales with victim's attachments.",
        volatility: 0.75, 
        volume: 230000, 
        glow: "sommers-glow",
        history: generatePriceHistory(8500, 0.75, 30)
    },
    // === WORLD GOVERNMENT ===
    {
        id: 67, name: "Magellan", symbol: "MAGE", price: 8700, change: 1.2,
        category: "Warden", faction: "Impel Down", icon: "☠️",
        power: "Venom-Venom Fruit, Poison immunity",
        description: "Former chief warden of Impel Down",
        volatility: 0.7, volume: 220000, glow: "mage-glow",
        history: generatePriceHistory(8700, 0.7, 30)
    },
    {
        id: 76, name: "Imu", symbol: "IMU", price: 10000, change: 0.1,
        category: "Sovereign", faction: "World Government", icon: "👑",
        power: "Unknown, Ultimate authority",
        description: "Mysterious ruler of the World Government",
        volatility: 0.5, volume: 300000, glow: "imu-glow",
        history: generatePriceHistory(10000, 0.5, 30)
    },

     // === CROSS GUILD ===
    {
        id: 70, name: "Buggy", symbol: "BUGGY", price: 5000, change: 15.0,
        category: "Yonko", faction: "Cross Guild", icon: "🤡",
        power: "Chop-Chop Fruit, Luck manipulation",
        description: "Accidental emperor with clown powers",
        volatility: 0.95, volume: 300000, glow: "buggy-glow",
        history: generatePriceHistory(5000, 0.95, 30)
    },

    // === OTHERS ===
    {
        id: 66, name: "Enel", symbol: "ENEL", price: 9300, change: 2.0,
        category: "God", faction: "Skypiea", icon: "⚡",
        power: "Rumble-Rumble Fruit, Mantra",
        description: "Self-proclaimed god of lightning",
        volatility: 0.85, volume: 245000, glow: "enel-glow",
        history: generatePriceHistory(9300, 0.85, 30)
    }
];

// Simple function to load character data
function loadCharacterData() {
    // Return the stockData array wrapped in a Promise to maintain compatibility
    return Promise.resolve(stockData);
}

// Export data and functions for use in other modules
export { stockData, loadCharacterData, generatePriceHistory, MIN_PRICE };