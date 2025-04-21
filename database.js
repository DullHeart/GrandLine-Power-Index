
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
  // (Optional: could make the last generated price the actual starting price instead)
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

const stockData = [
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
  // Note: Duplicate ID 47 for Benn Beckman corrected to 12 (example)
  { id: 12, name: "Benn Beckman", symbol: "BECK", price: 8900, change: 1.5, category: "First Mate", faction: "Red Hair Pirates", icon: "🚬", power: "Supreme intelligence, Haki mastery", description: "Shanks' right-hand man, feared for his tactical mind", volatility: 0.65, volume: 220000, glow: "beck-glow" },
  // Note: Duplicate ID 48 for Lucky Roux corrected to 13 (example)
  { id: 13, name: "Lucky Roux", symbol: "ROUX", price: 8200, change: 2.3, category: "Combatant", faction: "Red Hair Pirates", icon: "🍗", power: "Superhuman speed, Sharpshooting", description: "Jolly marksman with surprising speed", volatility: 0.7, volume: 210000, glow: "roux-glow" },

  // === BLACKBEARD PIRATES ===
   // Note: ID 43 already potentially used, corrected to 14 (example)
  { id: 14, name: "Marshall D. Teach", symbol: "BB", price: 9400, change: 1.2, category: "Yonko", faction: "Blackbeard Pirates", icon: "⚫", power: "Dark-Dark & Tremor-Tremor Fruits", description: "Only known dual Devil Fruit user", volatility: 0.95, volume: 255000, glow: "bb-glow" },
  // Note: Duplicate ID 49 for Burgess corrected to 15 (example)
  { id: 15, name: "Jesus Burgess", symbol: "BURG", price: 7800, change: 1.8, category: "Commander", faction: "Blackbeard Pirates", icon: "💪", power: "Wrestling, Enhanced strength", description: "Champion of Blackbeard's crew", volatility: 0.75, volume: 200000, glow: "burg-glow" },
  // Note: Duplicate ID 50 for Shiryu corrected to 16 (example)
  { id: 16, name: "Shiryu", symbol: "SHIR", price: 8500, change: 2.0, category: "Commander", faction: "Blackbeard Pirates", icon: "💧", power: "Clear-Clear Fruit, Master swordsman", description: "Former Impel Down warden turned assassin", volatility: 0.8, volume: 215000, glow: "shir-glow" },
  // Note: Aokiji listed under Marines/BB Pirates - ID 55 corrected to 17 (example)
  { id: 17, name: "Aokiji (Kuzan)", symbol: "AOKI", price: 9450, change: 0.3, category: "Former Admiral", faction: "Blackbeard Pirates", icon: "❄️", power: "Ice-Ice Fruit, Extreme endurance", description: "Former admiral who joined Blackbeard", volatility: 0.6, volume: 235000, glow: "aoki-glow" },

  // === BEAST PIRATES ===
   // Note: ID 13 used by Roux, Kaido corrected to 18 (example)
  { id: 18, name: "Kaido", symbol: "KAIDO", price: 9500, change: -1.5, category: "Yonko", faction: "Beast Pirates", icon: "🐉", power: "Fish-Fish Fruit, Model: Azure Dragon", description: "Strongest creature in the world", volatility: 0.9, volume: 250000, glow: "kaido-glow" },
   // Note: ID 15 used by Burgess, King corrected to 19 (example)
  { id: 19, name: "King", symbol: "KING", price: 8600, change: 3.2, category: "Commander", faction: "Beast Pirates", icon: " pterosaur ", power: "Ancient Zoan: Pteranodon, Lunarian traits", description: "Kaido's right-hand with fiery abilities", volatility: 0.8, volume: 230000, glow: "king-glow" },
  // Note: Duplicate ID 51 for Queen corrected to 20 (example)
  { id: 20, name: "Queen", symbol: "QUEEN", price: 8400, change: 1.5, category: "All-Star", faction: "Beast Pirates", icon: "🦕", power: "Ancient Zoan: Brachiosaurus, Cyborg tech", description: "Mad scientist and plague spreader", volatility: 0.85, volume: 225000, glow: "queen-glow" },
  // Note: Duplicate ID 52 for Jack corrected to 21 (example)
  { id: 21, name: "Jack", symbol: "JACK", price: 8000, change: 1.2, category: "All-Star", faction: "Beast Pirates", icon: "🐘", power: "Ancient Zoan: Mammoth, Extreme durability", description: "The Drought who never knows when to quit", volatility: 0.75, volume: 210000, glow: "jack-glow" },

  // === BIG MOM PIRATES ===
  // Note: ID 14 used by Teach, Big Mom corrected to 22 (example)
  { id: 22, name: "Big Mom", symbol: "BMOM", price: 9200, change: -0.8, category: "Yonko", faction: "Big Mom Pirates", icon: "🍰", power: "Soul-Soul Fruit, Homie army", description: "Ruthless matriarch with soul powers", volatility: 0.85, volume: 245000, glow: "bmom-glow" },
  // Note: Duplicate ID 53 for Katakuri corrected to 23 (example)
  { id: 23, name: "Katakuri", symbol: "KATA", price: 8800, change: 2.1, category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍡", power: "Mochi-Mochi Fruit, Future Sight Haki", description: "Perfect warrior with unbeaten record", volatility: 0.7, volume: 230000, glow: "kata-glow" },
  // Note: Duplicate ID 54 for Smoothie corrected to 24 (example)
  { id: 24, name: "Smoothie", symbol: "SMOO", price: 8300, change: 1.8, category: "Sweet Commander", faction: "Big Mom Pirates", icon: "🍹", power: "Squeeze-Squeeze Fruit, Giant form", description: "One of Big Mom's strongest daughters", volatility: 0.65, volume: 215000, glow: "smoo-glow" },

  // === MARINES ===
  { id: 26, name: "Akainu (Sakazuki)", symbol: "AKAINU", price: 9700, change: -0.2, category: "Fleet Admiral", faction: "Marines", icon: "🌋", power: "Magma-Magma Fruit, Absolute Justice", description: "Ruthless leader of the Marines", volatility: 0.7, volume: 240000, glow: "akainu-glow" },
  { id: 27, name: "Kizaru (Borsalino)", symbol: "KIZARU", price: 9550, change: 0.1, category: "Admiral", faction: "Marines", icon: "💡", power: "Glint-Glint Fruit, Light-speed attacks", description: "Unpredictable light-speed admiral", volatility: 0.65, volume: 235000, glow: "kizaru-glow" },
  // Note: Duplicate ID 56 for Fujitora corrected to 28 (example)
  { id: 28, name: "Fujitora (Issho)", symbol: "FUJI", price: 9350, change: 0.4, category: "Admiral", faction: "Marines", icon: "☄️", power: "Gravity control, Blind swordsman", description: "Kind-hearted admiral who sees with Haki", volatility: 0.55, volume: 230000, glow: "fujitora-glow" },
   // Note: Duplicate ID 57 for Garp corrected to 29 (example)
  { id: 29, name: "Garp", symbol: "GARP", price: 9650, change: 0.6, category: "Hero", faction: "Marines", icon: "✊", power: "Legendary strength, Haki mastery", description: "The Hero who cornered Roger", volatility: 0.5, volume: 250000, glow: "garp-glow" },
  { id: 67, name: "Magellan", symbol: "MAGE", price: 8700, change: 1.2, category: "Warden", faction: "Impel Down", icon: "☠️", power: "Venom-Venom Fruit, Poison immunity", description: "Former chief warden of Impel Down", volatility: 0.7, volume: 220000, glow: "mage-glow" },


  // ===== WARLORDS / CROSS GUILD / INDEPENDENT ===
  { id: 36, name: "Dracule Mihawk", symbol: "MIHAWK", price: 9000, change: 0.5, category: "Swordsman", faction: "Cross Guild", icon: "🦅", power: "World's Strongest Swordsman", description: "Shanks' rival and Zoro's ultimate goal", volatility: 0.55, volume: 220000, glow: "mihawk-glow" },
  { id: 37, name: "Boa Hancock", symbol: "HANCOCK", price: 7500, change: 1.1, category: "Pirate Empress", faction: "Kuja Pirates", icon: "🐍", power: "Love-Love Fruit, Conqueror's Haki", description: "Most beautiful woman with petrification powers", volatility: 0.7, volume: 200000, glow: "hancock-glow" },
  // Note: ID 44 already used? Corrected Doflamingo to 30 (example)
  { id: 30, name: "Donquixote Doflamingo", symbol: "DOFLA", price: 9100, change: 1.0, category: "Former Warlord", faction: "Donquixote Pirates", icon: " M ", power: "String-String Fruit, Manipulation", description: "Underworld broker and fallen noble", volatility: 0.9, volume: 245000, glow: "dofla-glow" },
  { id: 65, name: "Crocodile", symbol: "CROC", price: 8500, change: 1.4, category: "Former Warlord", faction: "Cross Guild", icon: "🐊", power: "Sand-Sand Fruit, Hook weapon", description: "Former Alabasta villain turned wildcard", volatility: 0.75, volume: 215000, glow: "croc-glow" },
  { id: 69, name: "Gecko Moria", symbol: "MORIA", price: 7800, change: 0.8, category: "Former Warlord", faction: "Thriller Bark", icon: "🦇", power: "Shadow-Shadow Fruit, Zombie army", description: "Master of shadows and nightmares", volatility: 0.65, volume: 195000, glow: "moria-glow" },
  { id: 70, name: "Buggy", symbol: "BUGGY", price: 5000, change: 15.0, category: "Yonko", faction: "Cross Guild", icon: "🤡", power: "Chop-Chop Fruit, Luck manipulation", description: "Accidental emperor with clown powers", volatility: 0.95, volume: 300000, glow: "buggy-glow" },
  // Note: Duplicate ID 59 for Kuma corrected to 31 (example)
  { id: 31, name: "Bartholomew Kuma", symbol: "KUMA", price: 8200, change: 1.5, category: "Former Warlord", faction: "Revolutionary Army", icon: "🐾", power: "Paw-Paw Fruit, Cyborg enhancements", description: "Mysterious revolutionary turned weapon", volatility: 0.75, volume: 205000, glow: "kuma-glow" },


  // === REVOLUTIONARY ARMY ===
  { id: 38, name: "Monkey D. Dragon", symbol: "DRAGON", price: 9900, change: 3.0, category: "Leader", faction: "Revolutionary Army", icon: "🌪️", power: "Unknown, presumed Wind manipulation", description: "Leader of the Revolutionary Army and Luffy's father", volatility: 0.9, volume: 300000, glow: "dragon-glow" },
  { id: 39, name: "Sabo", symbol: "SABO", price: 8800, change: 2.5, category: "Chief of Staff", faction: "Revolutionary Army", icon: "🎩", power: "Mera Mera no Mi, Advanced Haki", description: "Dragon's right-hand and wielder of Ace's flame powers", volatility: 0.85, volume: 250000, glow: "sabo-glow" },
  // Note: Duplicate ID 58 for Ivankov corrected to 32 (example)
  { id: 32, name: "Emporio Ivankov", symbol: "IVAN", price: 7500, change: 1.9, category: "Commander", faction: "Revolutionary Army", icon: "💉", power: "Horm-Horm Fruit, Gender switching", description: "Queen of Kamabakka Kingdom", volatility: 0.7, volume: 195000, glow: "ivan-glow" },
  // Kuma also listed here (ID 31)

  // === WORST GENERATION ===
  { id: 40, name: "Trafalgar D. Water Law", symbol: "LAW", price: 8700, change: 1.8, category: "Captain", faction: "Heart Pirates", icon: "💔", power: "Op-Op Fruit, Surgical Genius", description: "Former Warlord and strategic Supernova", volatility: 0.8, volume: 240000, glow: "law-glow" },
  { id: 41, name: "Eustass Kid", symbol: "KID", price: 8600, change: 2.1, category: "Captain", faction: "Kid Pirates", icon: "🔩", power: "Magnetism, Armored Assaults", description: "Aggressive Supernova with magnetic powers", volatility: 0.85, volume: 235000, glow: "kid-glow" },
  // Note: Duplicate ID 60 for Hawkins corrected to 33 (example)
  { id: 33, name: "Basil Hawkins", symbol: "HAWK", price: 7200, change: 2.2, category: "Captain", faction: "Hawkins Pirates", icon: "🃏", power: "Straw-Straw Fruit, Tarot predictions", description: "Fatalistic pirate who manipulates fate", volatility: 0.8, volume: 185000, glow: "hawk-glow" },
  // Note: Duplicate ID 61 for Apoo corrected to 34 (example)
  { id: 34, name: "Scratchmen Apoo", symbol: "APOO", price: 7100, change: 2.5, category: "Captain", faction: "On Air Pirates", icon: "🎵", power: "Music-based attacks, Sound manipulation", description: "Musical pirate who plays both sides", volatility: 0.85, volume: 180000, glow: "apoo-glow" },

  // === WHITEBEARD PIRATES ===
  { id: 62, name: "Edward Newgate", symbol: "WB", price: 9750, change: -0.5, category: "Former Yonko", faction: "Whitebeard Pirates", icon: "🌊", power: "Tremor-Tremor Fruit, Strongest man", description: "The late father of the seas", volatility: 0.6, volume: 265000, glow: "wb-glow" },
  { id: 63, name: "Marco", symbol: "MARCO", price: 8900, change: 1.7, category: "First Division", faction: "Whitebeard Pirates", icon: "🐦", power: "Phoenix Fruit, Regeneration", description: "Whitebeard's right-hand and healer", volatility: 0.65, volume: 225000, glow: "marco-glow" },
  { id: 64, name: "Portgas D. Ace", symbol: "ACE", price: 9100, change: 0.9, category: "Former Commander", faction: "Whitebeard Pirates", icon: "♠️", power: "Flame-Flame Fruit, Haki mastery", description: "Luffy's late brother with fiery will", volatility: 0.7, volume: 240000, glow: "ace-glow" },

  // === ROGER PIRATES ===
  { id: 42, name: "Silvers Rayleigh", symbol: "RAY", price: 9500, change: 1.5, category: "First Mate", faction: "Roger Pirates", icon: "👓", power: "Advanced Haki, Swordsmanship", description: "The Dark King and mentor to Luffy", volatility: 0.7, volume: 270000, glow: "rayleigh-glow" },

   // === CP0 / WORLD GOVT ===
   // Note: ID 45 already used? Corrected Lucci to 35 (example)
  { id: 35, name: "Rob Lucci", symbol: "LUCCI", price: 8900, change: 1.3, category: "Agent", faction: "CP0", icon: "🐆", power: "Cat-Cat Fruit, Model: Leopard, Rokushiki", description: "Lethal assassin and master of Rokushiki", volatility: 0.85, volume: 230000, glow: "lucci-glow" },
  { id: 76, name: "Imu", symbol: "IMU", price: 10000, change: 0.1, category: "Sovereign", faction: "World Government", icon: "👁️‍🗨️", power: "Unknown, Ultimate authority", description: "Mysterious ruler of the World Government", volatility: 0.5, volume: 300000, glow: "imu-glow" },

  // === FIVE ELDERS === (Correcting potential duplicate IDs from PDF)
  { id: 46, name: "Saint Jaygarcia Saturn", symbol: "SATURN", price: 9800, change: 0.5, category: "Elder", faction: "Five Elders", icon: "🕷️", power: "Mythical Zoan – Gyuki (Ox-Spider)", description: "Warrior God of Science and Defense", volatility: 0.6, volume: 260000, glow: "saturn-glow" },
  // ID 47 used by Beckman/Elder Mars -> Mars becomes 47A (example)
  { id: "47A", name: "Saint Marcus Mars", symbol: "MARS", price: 9700, change: 0.4, category: "Elder", faction: "Five Elders", icon: "鳥", power: "Mythical Zoan – Itsumade (Serpent-Bird)", description: "Warrior God of Environment", volatility: 0.5, volume: 240000, glow: "mars-glow" },
  // ID 48 used by Roux/Elder Warcury -> Warcury becomes 48A (example)
  { id: "48A", name: "Saint Topman Warcury", symbol: "MERCURY", price: 9650, change: 0.3, category: "Elder", faction: "Five Elders", icon: "🐗", power: "Mythical Zoan – Fengxi (Boar Demon)", description: "Warrior God of Justice", volatility: 0.4, volume: 230000, glow: "warcury-glow" },
  // ID 49 used by Burgess/Elder Nusjuro -> Nusjuro becomes 49A (example)
  { id: "49A", name: "Saint Ethanbaron V. Nusjuro", symbol: "VENUS", price: 9600, change: 0.6, category: "Elder", faction: "Five Elders", icon: "🐴", power: "Mythical Zoan – Bakotsu (Skeletal Horse)", description: "Warrior God of Finance", volatility: 0.7, volume: 250000, glow: "nusjuro-glow" },
  // ID 50 used by Shiryu/Elder Peter -> Peter becomes 50A (example)
  { id: "50A", name: "Saint Shepherd Ju Peter", symbol: "JUPITER", price: 9550, change: 0.2, category: "Elder", faction: "Five Elders", icon: "🐛", power: "Mythical Zoan – Sandworm", description: "Warrior God of Agriculture", volatility: 0.3, volume: 220000, glow: "jupeter-glow" },

   // === GOD KNIGHTS ===
  { id: 71, name: "Figarland Garling", symbol: "GARL", price: 9900, change: 0.5, category: "Supreme Commander", faction: "God Knights", icon: "⚜️", power: "Supreme Haki, Champion of God Valley", description: "Ruthless enforcer of Celestial Dragon law.", volatility: 0.7, volume: 300000, glow: "garling-glow" },
  // Note: IDs 72-75 seem unique in the source PDF snippet
  { id: 72, name: "Figarland Shamrock", symbol: "SHAM", price: 9600, change: 1.8, category: "Commander", faction: "God Knights", icon: "🍀", power: "Cerberus Blade (Mythical Zoan), Advanced Haki", description: "Shanks' twin brother. Commands living sword.", volatility: 0.85, volume: 280000, glow: "shamrock-glow" },
  { id: 73, name: "Gunko", symbol: "GUNK", price: 8800, change: 2.3, category: "Elite Knight", faction: "God Knights", icon: "🏹", power: "Aro Aro no Mi (Arrow-Arrow Fruit)", description: "Creates vector arrows that manipulate motion.", volatility: 0.8, volume: 250000, glow: "gunko-glow" },
  { id: 74, name: "Rimoshifu Killingham", symbol: "KILL", price: 8700, change: 1.5, category: "Elite Knight", faction: "God Knights", icon: "🌙", power: "Ryu Ryu no Mi, Model: Kirin (Mythical Zoan)", description: "Materializes dreams/nightmares.", volatility: 0.9, volume: 240000, glow: "killingham-glow" },
  { id: 75, name: "Shepherd Sommers", symbol: "SOMM", price: 8500, change: 1.2, category: "Knight", faction: "God Knights", icon: "🌵", power: "Iba Iba no Mi (Thorn-Thorn Fruit)", description: "Generates invisible pain-inducing thorns.", volatility: 0.75, volume: 230000, glow: "sommers-glow" },

  // === OTHERS ===
  { id: 66, name: "Enel", symbol: "ENEL", price: 9300, change: 2.0, category: "God", faction: "Skypiea", icon: "⚡", power: "Rumble-Rumble Fruit, Mantra", description: "Self-proclaimed god of lightning", volatility: 0.85, volume: 245000, glow: "enel-glow" }

];

// Add generated history to each character
stockData.forEach(character => {
  // Check if history needs generation (e.g., if it wasn't hardcoded)
  if (!character.history) {
      // Ensure basePrice and volatility are valid numbers
      const basePrice = typeof character.price === 'number' ? character.price : MIN_PRICE;
      const volatility = typeof character.volatility === 'number' ? character.volatility : 0.5; // Default volatility
      character.history = generatePriceHistory(basePrice, volatility, 30);
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


// ==========================================================================
// Data Loading Function
// ==========================================================================

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

// ==========================================================================
// Exports
// ==========================================================================

export { stockData, loadCharacterData, generatePriceHistory, MIN_PRICE };
