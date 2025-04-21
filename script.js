
import { loadCharacterData, MIN_PRICE } from './database.js';

// ==========================================================================
// State Variables
// ==========================================================================

let characters = []; // Holds the character stock data after loading
let portfolio = []; // Holds the user's owned stocks { id: number, shares: number }
let activeFilter = 'All'; // Currently selected faction filter
let currentSort = 'price-desc'; // Currently selected sort order
let simulationIntervalId = null; // To store the interval ID for market simulation

// ==========================================================================
// Constants
// ==========================================================================

const NEWS_ITEMS = [
  `<span class="news-item breaking">BREAKING: Luffy's stock surges 15% after Gear 5 revelation!</span>`,
  `<span class="news-item positive">Zoro defeats King, power level up by 12.3%</span>`,
  `<span class="news-item negative">Kaido stock drops 8% following defeat in Wano</span>`,
  `<span class="news-item">New Yonko rankings announced by World Government</span>`,
  `<span class="news-item positive">Blackbeard acquires new Devil Fruit ability! Stock up 9.5%</span>`,
  `<span class="news-item">Shanks makes his move! Trading volume at all-time high</span>`,
  `<span class="news-item negative">Big Mom alliance with Kaido dissolved! Stocks affected</span>`,
  `<span class="news-item">Revolutionary Army gaining momentum! Dragon's power index rises</span>`
];
const SIMULATION_INTERVAL = 10000; // Update market every 10 seconds (10000 ms)
const TOAST_DURATION = 4000; // How long notifications stay visible (ms)
const MAX_HISTORY_DAYS = 30; // Number of days for price history chart


// ==========================================================================
// DOM Element References
// ==========================================================================

const dom = {
  loadingScreen: document.getElementById('loading-screen'),
  loadingBar: document.getElementById('loading-bar'),
  loadingPercentage: document.getElementById('loading-percentage'),
  welcomeMessage: document.getElementById('welcome-message'),
  tickerContent: document.getElementById('ticker-content'),
  notificationArea: document.getElementById('notification-area'),
  factionFiltersContainer: document.getElementById('faction-filters'),
  searchInput: document.getElementById('search-input'),
  sortSelect: document.getElementById('sort-select'),
  marketIndexElem: document.getElementById('market-index'),
  marketChangeElem: document.getElementById('market-change'),
  marketPiratesElem: document.getElementById('market-pirates'),
  stocksContainer: document.getElementById('stocks-container'),
  stocksLoadingMsg: document.getElementById('stocks-loading-msg'),
  portfolioContainer: document.getElementById('portfolio-container'),
  portfolioLoadingMsg: document.getElementById('portfolio-loading-msg'),
  portfolioValueElem: document.getElementById('portfolio-value'),
  portfolioDailyChangeElem: document.getElementById('portfolio-daily-change'),
  portfolioTotalPiratesElem: document.getElementById('portfolio-total-pirates'),
  portfolioHighestPosElem: document.getElementById('portfolio-highest-pos'),
  portfolioBestPerfElem: document.getElementById('portfolio-best-perf'),
  quantityModal: document.getElementById('quantity-modal'),
  quantityModalContent: document.querySelector('#quantity-modal .modal-content'), // More specific
  quantityModalTitle: document.getElementById('modal-title'),
  quantityModalInfo: document.getElementById('modal-character-info'),
  quantityInput: document.getElementById('quantity-input'),
  quantityConfirmBtn: document.querySelector('#quantity-modal .btn-confirm'),
  quantityCancelBtn: document.querySelector('#quantity-modal .btn-cancel'),
  // Templates (referenced when needed)
  stockCardTemplate: document.getElementById('stock-card-template'),
  portfolioItemTemplate: document.getElementById('portfolio-item-template')
};

// Reference for the character detail modal (created dynamically)
let characterDetailModal = null;
let priceChartInstance = null; // To keep track of the Chart.js instance

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Creates a DOM element with specified tag, classes, and innerHTML.
 * @param {string} tag - HTML tag name.
 * @param {string} [classes=''] - Space-separated CSS classes.
 * @param {string} [html=''] - Inner HTML content.
 * @returns {HTMLElement} - The created DOM element.
 */
const createElem = (tag, classes = '', html = '') => {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  if (html) el.innerHTML = html;
  return el;
};

/**
 * Formats a number as Beli currency (e.g., B1,234).
 * @param {number} amount - The amount to format.
 * @returns {string} - Formatted currency string.
 */
const formatBeli = (amount) => `B ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Formats a percentage change with a sign (e.g., +1.2%, -5.0%).
 * @param {number} change - The percentage change.
 * @returns {string} - Formatted change string.
 */
const formatChange = (change) => {
    if (typeof change !== 'number' || isNaN(change)) {
        return '--%';
    }
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.abs(change).toFixed(1)}%`;
};

/**
 * Displays a short notification message (toast).
 * @param {string} text - The message to display.
 * @param {'info' | 'success' | 'error'} [type='info'] - Type of notification.
 */
function showNotification(text, type = 'info') {
  if (!dom.notificationArea) return;
  const toast = createElem('div', `toast ${type}`, text);
  dom.notificationArea.appendChild(toast);

  // Automatically remove the toast after a delay
  setTimeout(() => {
    if (dom.notificationArea && dom.notificationArea.contains(toast)) {
      toast.style.opacity = '0'; // Start fade out
      toast.addEventListener('transitionend', () => toast.remove());
      // Failsafe removal if transition doesn't fire
      setTimeout(() => { if (toast && toast.parentNode) toast.remove(); }, 500);
    }
  }, TOAST_DURATION);
}

/**
 * Gets the current date in YYYY-MM-DD format.
 * @returns {string} Today's date string.
 */
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// ==========================================================================
// Rendering Functions
// ==========================================================================

/** Renders the faction filter buttons. */
function renderFactionFilters() {
  if (!dom.factionFiltersContainer || !characters || characters.length === 0) return;

  const factions = ['All', ...new Set(characters.map(c => c.faction || 'Unknown'))]; // Include 'All' and handle missing factions
  dom.factionFiltersContainer.innerHTML = ''; // Clear previous filters

  factions.forEach(f => {
    const btn = createElem('button', 'faction-filter');
    btn.textContent = f;
    btn.dataset.faction = f;
    if (f === activeFilter) {
      btn.classList.add('active');
    }
    dom.factionFiltersContainer.appendChild(btn);
  });
}

/** Renders the stock cards in the main grid based on current filters and sorting. */
function renderStocks() {
    if (!dom.stocksContainer || !dom.stockCardTemplate) return;

    if (dom.stocksLoadingMsg) dom.stocksLoadingMsg.style.display = 'none';
    dom.stocksContainer.innerHTML = ''; // Clear previous stocks

    // 1. Filter Data
    let filteredCharacters = characters;
    if (activeFilter !== 'All') {
        filteredCharacters = characters.filter(c => c.faction === activeFilter);
    }
    const searchTerm = dom.searchInput ? dom.searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filteredCharacters = filteredCharacters.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.symbol.toLowerCase().includes(searchTerm) ||
            (c.faction && c.faction.toLowerCase().includes(searchTerm)) || // Check faction exists
            (c.category && c.category.toLowerCase().includes(searchTerm)) // Check category exists
        );
    }

    // 2. Sort Data
    // Use a stable sort or ensure consistent secondary sort if primary values are equal
    filteredCharacters.sort((a, b) => {
        switch (currentSort) {
            case 'price-desc': return b.price - a.price || a.name.localeCompare(b.name);
            case 'price-asc': return a.price - b.price || a.name.localeCompare(b.name);
            case 'change-desc': return b.change - a.change || a.name.localeCompare(b.name);
            case 'change-asc': return a.change - b.change || a.name.localeCompare(b.name);
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            default: return b.price - a.price || a.name.localeCompare(b.name);
        }
    });

    // 3. Render
    if (filteredCharacters.length === 0) {
        dom.stocksContainer.innerHTML = `<p class="no-data-msg">No characters match your criteria.</p>`;
        updateMarketStats([]); // Update stats with empty data
        return;
    }

    const frag = document.createDocumentFragment();
    filteredCharacters.forEach(c => {
        const cardClone = dom.stockCardTemplate.content.cloneNode(true);
        const cardElement = cardClone.querySelector('.stock-card');
        const nameEl = cardClone.querySelector('.stock-name');
        const symbolEl = cardClone.querySelector('.stock-symbol');
        const priceEl = cardClone.querySelector('.stock-price');
        const changeEl = cardClone.querySelector('.stock-change');
        const powerEl = cardClone.querySelector('.stock-power');
        const buyBtn = cardClone.querySelector('.btn-buy');
        const sellBtn = cardClone.querySelector('.btn-sell');

        if (!cardElement || !nameEl || !symbolEl || !priceEl || !changeEl || !powerEl || !buyBtn || !sellBtn) {
            console.error("Template structure error for stock card.");
            return; // Skip this card if template is broken
        }

        cardElement.classList.add(c.glow || 'default-glow');
        cardElement.dataset.id = c.id; // Add ID to the card itself for easier delegation target

        nameEl.textContent = c.name;
        symbolEl.textContent = c.symbol;
        priceEl.textContent = formatBeli(c.price);
        changeEl.textContent = formatChange(c.change);
        changeEl.className = `stock-change ${c.change >= 0 ? 'positive' : 'negative'}`; // Reset classes
        powerEl.textContent = c.power || 'Power details unavailable.'; // Fallback text

        // Add ID to buttons for event delegation
        buyBtn.dataset.id = c.id;
        sellBtn.dataset.id = c.id;

        frag.appendChild(cardClone);
    });

    dom.stocksContainer.appendChild(frag);
    updateMarketStats(filteredCharacters); // Update overall market stats
}


/** Renders the user's portfolio list and updates portfolio stats. */
function renderPortfolio() {
    if (!dom.portfolioContainer || !dom.portfolioItemTemplate) return;

    if (dom.portfolioLoadingMsg) dom.portfolioLoadingMsg.style.display = 'none';
    dom.portfolioContainer.innerHTML = ''; // Clear previous items

    let totalPortfolioValue = 0;
    let totalPortfolioChangeValue = 0; // Sum of (change amount * shares) for each holding
    let initialPortfolioValue = 0; // Portfolio value before the current change cycle
    let highestValuePosition = { name: 'N/A', value: 0 };
    let bestPerformer = { name: 'N/A', change: -Infinity };

    if (portfolio.length === 0) {
        dom.portfolioContainer.innerHTML = '<p class="no-data-msg">Your portfolio is empty.</p>';
        updatePortfolioStats(0, 0, 0, 'N/A', 'N/A', -Infinity); // Reset stats
        return;
    }

    const frag = document.createDocumentFragment();
    portfolio.forEach(item => {
        const character = characters.find(c => c.id === item.id);
        if (!character) {
            console.warn(`Character data for ID ${item.id} not found in portfolio render.`);
            return; // Skip if character data is missing
        }

        const positionValue = character.price * item.shares;
        const changeAmount = character.price - (character.price / (1 + (character.change / 100 || 0))); // Price change amount
        const positionChangeValue = changeAmount * item.shares;
        const positionInitialValue = positionValue - positionChangeValue;


        totalPortfolioValue += positionValue;
        totalPortfolioChangeValue += positionChangeValue;
        initialPortfolioValue += positionInitialValue;


        if (positionValue > highestValuePosition.value) {
            highestValuePosition = { name: character.name.split(' ')[0], value: positionValue };
        }
        if (character.change > bestPerformer.change) {
            bestPerformer = { name: character.name.split(' ')[0], change: character.change };
        }

        // --- Create Portfolio Item from Template ---
        const itemClone = dom.portfolioItemTemplate.content.cloneNode(true);
        const nameEl = itemClone.querySelector('.portfolio-stock-name');
        const sharesEl = itemClone.querySelector('.portfolio-stock-shares');
        const iconEl = itemClone.querySelector('.portfolio-stock-icon'); // Assuming an icon element exists
        const valueEl = itemClone.querySelector('.portfolio-stock-value');
        const changeEl = itemClone.querySelector('.portfolio-stock-change');
        const factionEl = itemClone.querySelector('.stock-faction'); // From template
        const volumeEl = itemClone.querySelector('.stock-volume');   // From template

        if (!nameEl || !sharesEl || !valueEl || !changeEl || !factionEl || !volumeEl || !iconEl) {
            console.error("Template structure error for portfolio item.");
            return; // Skip broken item
        }

        nameEl.textContent = character.name;
        sharesEl.textContent = `${item.shares} shares`;
        iconEl.textContent = character.icon || '?'; // Display icon or fallback
        valueEl.textContent = formatBeli(positionValue);
        changeEl.textContent = formatChange(character.change);
        changeEl.className = `portfolio-stock-change ${character.change >= 0 ? 'text-positive' : 'text-negative'}`;
        factionEl.textContent = character.faction || 'Unknown';
        volumeEl.textContent = `Vol: ${character.volume ? character.volume.toLocaleString() : '--'}`;


        frag.appendChild(itemClone);
    });

    dom.portfolioContainer.appendChild(frag);

    // Calculate average daily change percentage for the whole portfolio
    const averagePortfolioChange = initialPortfolioValue > 0
        ? (totalPortfolioChangeValue / initialPortfolioValue) * 100
        : 0;


    updatePortfolioStats(
        totalPortfolioValue,
        averagePortfolioChange,
        portfolio.length,
        highestValuePosition.name,
        bestPerformer.name,
        bestPerformer.change
    );
}


// ==========================================================================
// Stats Update Functions
// ==========================================================================

/** Updates the main market statistics display. */
function updateMarketStats(data) {
    if (!dom.marketIndexElem || !dom.marketChangeElem || !dom.marketPiratesElem) return;

    const totalMarketValue = data.reduce((sum, c) => sum + (c.price || 0), 0);
    const avgMarketChange = data.length > 0
        ? data.reduce((sum, c) => sum + (c.change || 0), 0) / data.length
        : 0;

    dom.marketIndexElem.textContent = formatBeli(totalMarketValue);
    dom.marketChangeElem.textContent = formatChange(avgMarketChange);
    dom.marketChangeElem.className = `stat ${avgMarketChange >= 0 ? 'positive' : 'negative'}`;
    dom.marketPiratesElem.textContent = `${data.length} Pirates`;
}

/** Updates the portfolio statistics display. */
function updatePortfolioStats(totalValue, avgChange, holdingCount, highestName, bestName, bestChange) {
    if (!dom.portfolioValueElem || !dom.portfolioDailyChangeElem || !dom.portfolioTotalPiratesElem || !dom.portfolioHighestPosElem || !dom.portfolioBestPerfElem) return;

    dom.portfolioValueElem.textContent = formatBeli(totalValue);
    dom.portfolioDailyChangeElem.textContent = formatChange(avgChange);
    dom.portfolioDailyChangeElem.className = `stat-value ${avgChange >= 0 ? 'text-positive' : 'text-negative'}`;
    dom.portfolioTotalPiratesElem.textContent = holdingCount;
    dom.portfolioHighestPosElem.textContent = highestName;
    dom.portfolioBestPerfElem.textContent = bestName !== 'N/A' ? `${bestName} ${formatChange(bestChange)}` : 'N/A';
    dom.portfolioBestPerfElem.className = `stat-value ${bestChange >= 0 ? 'text-positive' : 'text-negative'}`;

}

// ==========================================================================
// Market Simulation & Data Update
// ==========================================================================

/** Simulates changes in character prices and updates history. */
function simulateMarketChanges() {
    const today = getTodayDateString();

    characters.forEach(c => {
        if (typeof c.price !== 'number' || typeof c.volatility !== 'number') return;

        const oldPrice = c.price;
        // Simulate a change percentage: random number between -1 and 1, scaled by volatility
        const changePct = (Math.random() * 2 - 1) * c.volatility * 5; // Adjust multiplier for desired effect

        // Calculate new price
        let newPrice = oldPrice * (1 + changePct / 100);
        newPrice = Math.max(MIN_PRICE, Math.round(newPrice)); // Ensure min price and round

        c.price = newPrice;
        // Calculate the actual change percentage based on the final price
        c.change = oldPrice !== 0 ? parseFloat(((newPrice - oldPrice) / oldPrice * 100).toFixed(1)) : 0;

        // Update history (ensure history array exists)
        if (!Array.isArray(c.history)) {
            c.history = [];
        }
        if (c.history.length >= MAX_HISTORY_DAYS) {
            c.history.shift(); // Remove oldest entry
        }
        c.history.push({ date: today, price: c.price });
    });

    // Re-render affected parts
    renderStocks();
    renderPortfolio();
}

// ==========================================================================
// Portfolio Management & Local Storage
// ==========================================================================

/** Saves the current portfolio state to localStorage. */
function savePortfolio() {
  try {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  } catch (e) {
    console.error("Failed to save portfolio to localStorage:", e);
    showNotification("Could not save portfolio state.", "error");
  }
}

/** Loads the portfolio state from localStorage. */
function loadPortfolioFromStorage() {
  try {
    const saved = localStorage.getItem("portfolio");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic validation of the loaded structure
      if (Array.isArray(parsed) && parsed.every(item => item && typeof item.id !== 'undefined' && typeof item.shares === 'number' && item.shares > 0)) {
          portfolio = parsed;
      } else {
          console.warn("Invalid portfolio structure found in localStorage. Resetting.");
          portfolio = [];
          localStorage.removeItem("portfolio"); // Clear invalid data
      }
    } else {
      portfolio = []; // Initialize empty if nothing saved
    }
  } catch (e) {
    console.error("Failed to load or parse portfolio from localStorage:", e);
    showNotification("Could not load saved portfolio.", "error");
    portfolio = []; // Reset on error
  }
}

/** Buys shares of a character stock. */
function buyStock(characterId, quantity = 1) {
  if (isNaN(quantity) || quantity < 1) {
    showNotification('Please enter a valid positive quantity.', 'error');
    return;
  }

  const character = characters.find(c => c.id === characterId);
  if (!character) {
    showNotification('Character not found.', 'error');
    return;
  }

  const existingHolding = portfolio.find(item => item.id === characterId);

  if (existingHolding) {
    existingHolding.shares += quantity;
  } else {
    portfolio.push({ id: characterId, shares: quantity });
  }

  showNotification(`Bought ${quantity} share(s) of ${character.name}!`, 'success');
  renderPortfolio(); // Update display
  savePortfolio(); // Persist changes
}

/** Sells shares of a character stock. */
function sellStock(characterId, quantity = 1) {
  if (isNaN(quantity) || quantity < 1) {
    showNotification('Please enter a valid positive quantity.', 'error');
    return;
  }

  const character = characters.find(c => c.id === characterId);
  if (!character) {
    showNotification('Character not found.', 'error');
    return;
  }

  const existingHoldingIndex = portfolio.findIndex(item => item.id === characterId);

  if (existingHoldingIndex === -1) {
    showNotification(`You don't own any shares of ${character.name}.`, 'error');
    return;
  }

  const existingHolding = portfolio[existingHoldingIndex];

  if (existingHolding.shares < quantity) {
    showNotification(`Not enough shares of ${character.name} to sell (You have ${existingHolding.shares}).`, 'error');
    return;
  }

  existingHolding.shares -= quantity;

  if (existingHolding.shares <= 0) {
    // Remove the holding from the portfolio array if shares reach 0
    portfolio.splice(existingHoldingIndex, 1);
  }

  showNotification(`Sold ${quantity} share(s) of ${character.name}!`, 'success');
  renderPortfolio(); // Update display
  savePortfolio(); // Persist changes
}


// ==========================================================================
// Modal Management (Quantity & Character Detail)
// ==========================================================================

let currentModalAction = null; // Stores context for the quantity modal ('buy' or 'sell')
let currentModalCharacterId = null; // Stores character ID for the quantity modal

/** Shows the quantity selection modal. */
function showQuantityModal(characterId, action) {
    if (!dom.quantityModal || !dom.quantityInput || !dom.quantityModalTitle || !dom.quantityModalInfo) return;

    const character = characters.find(c => c.id === characterId);
    if (!character) {
        showNotification('Character data not available.', 'error');
        return;
    }

    currentModalAction = action;
    currentModalCharacterId = characterId;

    // Update modal content
    dom.quantityModalTitle.textContent = `${action === 'buy' ? 'Buy' : 'Sell'} ${character.name}`;
    dom.quantityModalInfo.textContent = `Current Price: ${formatBeli(character.price)}`;
    dom.quantityInput.value = '1'; // Default to 1
    dom.quantityInput.max = action === 'sell'
        ? (portfolio.find(item => item.id === characterId)?.shares || 0).toString()
        : ''; // Set max for selling based on holdings

    if (dom.quantityConfirmBtn) dom.quantityConfirmBtn.textContent = action === 'buy' ? 'Confirm Buy' : 'Confirm Sell';


    // Show modal
    dom.quantityModal.classList.add('active');
    // Focus on the input field for accessibility
    requestAnimationFrame(() => {
        dom.quantityInput.focus();
        dom.quantityInput.select();
     });
}

/** Hides the quantity modal. */
function hideQuantityModal() {
    if (!dom.quantityModal) return;
    dom.quantityModal.classList.remove('active');
    currentModalAction = null;
    currentModalCharacterId = null;
}

/** Handles the confirmation action from the quantity modal. */
function handleQuantityConfirm() {
    if (!currentModalAction || typeof currentModalCharacterId === 'undefined' || !dom.quantityInput) return;

    const quantity = parseInt(dom.quantityInput.value, 10);

     if (isNaN(quantity) || quantity < 1) {
        showNotification('Please enter a valid positive quantity.', 'error');
        return; // Keep modal open
    }

    if (currentModalAction === 'buy') {
        buyStock(currentModalCharacterId, quantity);
    } else if (currentModalAction === 'sell') {
        sellStock(currentModalCharacterId, quantity);
    }

    hideQuantityModal();
}

/** Shows the character detail modal with price history chart. */
function showCharacterDetailModal(characterId) {
    const character = characters.find(c => c.id === characterId);
    if (!character) {
        showNotification('Character details not available.', 'error');
        return;
    }

    // Clean up existing modal if any
    if (characterDetailModal && characterDetailModal.parentNode) {
       characterDetailModal.remove();
    }
    if (priceChartInstance) {
        priceChartInstance.destroy();
        priceChartInstance = null;
    }


    // Create Modal Structure (using template literals for simplicity)
    characterDetailModal = createElem('div', 'modal character-modal'); // Add base modal class
    characterDetailModal.setAttribute('role', 'dialog');
    characterDetailModal.setAttribute('aria-modal', 'true');
    characterDetailModal.setAttribute('aria-labelledby', 'character-modal-title');


    const modalContent = createElem('div', `modal-content ${character.glow || ''}`); // Add glow class here

    modalContent.innerHTML = `
        <button class="close-modal" aria-label="Close">&times;</button>
        <div class="modal-header">
            <h2 id="character-modal-title">${character.name} (${character.symbol})</h2>
            <div class="modal-faction">${character.faction || 'Unknown Faction'}</div>
        </div>
        <div class="modal-body">
            <div class="modal-icon">${character.icon || '?'}</div>
            <div class="modal-stats">
                <div>Current Price: <strong>${formatBeli(character.price)}</strong></div>
                <div>24h Change: <strong class="${character.change >= 0 ? 'text-positive' : 'text-negative'}">${formatChange(character.change)}</strong></div>
                <div>Volatility: <strong>${(character.volatility * 10).toFixed(1)}%</strong></div>
                <div>Daily Volume: <strong>${character.volume ? character.volume.toLocaleString() : '--'}</strong></div>
            </div>
            <div class="modal-power">${character.power || 'Power details unavailable.'}</div>
            <p class="modal-description">${character.description || 'No description available.'}</p>
            <div class="modal-chart">
                <canvas id="priceChartCanvas"></canvas>
            </div>
        </div>
    `;
    characterDetailModal.appendChild(modalContent);
    document.body.appendChild(characterDetailModal);


    // Show modal and set focus
    characterDetailModal.classList.add('active');
    const closeButton = characterDetailModal.querySelector('.close-modal');
    if(closeButton) {
        closeButton.focus(); // Focus the close button initially
    }


    // Initialize Chart.js
    const ctx = modalContent.querySelector('#priceChartCanvas')?.getContext('2d');
    if (ctx && Chart && character.history && character.history.length > 0) {
        priceChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: character.history.map(h => {
                    const date = new Date(h.date);
                    // Format as MM/DD, handle potential invalid dates
                    return !isNaN(date) ? `${date.getMonth() + 1}/${date.getDate()}` : 'Invalid Date';
                 }),
                datasets: [{
                    label: 'Price History',
                    data: character.history.map(h => h.price),
                    borderColor: 'rgba(244, 162, 97, 1)', // Accent color
                    backgroundColor: 'rgba(244, 162, 97, 0.1)', // Accent color transparent
                    borderWidth: 2,
                    tension: 0.1, // Slight curve
                    fill: true,
                    pointRadius: 1, // Smaller points
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => formatBeli(context.raw) // Format tooltip value
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                             callback: value => formatBeli(value), // Format Y-axis labels
                             color: 'rgba(241, 250, 238, 0.7)' // Text light
                        },
                         grid: {
                            color: 'rgba(241, 250, 238, 0.1)' // Lighter grid lines
                         }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(241, 250, 238, 0.7)', // Text light
                            maxTicksLimit: 10, // Limit labels for readability
                            autoSkip: true
                        },
                        grid: {
                             display: false // Hide vertical grid lines
                        }
                    }
                }
            }
        });
    } else {
         // Handle case where chart can't be rendered
         const chartContainer = modalContent.querySelector('.modal-chart');
         if(chartContainer) {
            chartContainer.innerHTML = '<p>Price history data unavailable.</p>';
         }
         if(!Chart) console.warn("Chart.js library not loaded.");
    }
}


/** Hides and cleans up the character detail modal. */
function hideCharacterDetailModal() {
    if (characterDetailModal) {
        characterDetailModal.classList.remove('active');
        // Remove from DOM after transition (optional, depends on CSS)
        characterDetailModal.addEventListener('transitionend', () => {
             if (characterDetailModal && characterDetailModal.parentNode && !characterDetailModal.classList.contains('active')) {
                 characterDetailModal.remove();
                 characterDetailModal = null;
                 if (priceChartInstance) {
                     priceChartInstance.destroy();
                     priceChartInstance = null;
                 }
             }
        }, { once: true });
         // Failsafe removal
        setTimeout(() => {
            if (characterDetailModal && characterDetailModal.parentNode && !characterDetailModal.classList.contains('active')) {
                 characterDetailModal.remove();
                 characterDetailModal = null;
                 if (priceChartInstance) {
                     priceChartInstance.destroy();
                     priceChartInstance = null;
                 }
             }
        }, 500); // Slightly longer than CSS transition
    }
}


// ==========================================================================
// Event Handlers
// ==========================================================================

/** Handles clicks on faction filter buttons. */
function handleFactionFilterClick(event) {
    const target = event.target;
    if (!target.matches('.faction-filter')) return; // Ignore clicks not on a filter button

    const selectedFaction = target.dataset.faction;
    if (selectedFaction === activeFilter) return; // No change

    // Update active state visually
    dom.factionFiltersContainer.querySelectorAll('.faction-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.faction === selectedFaction);
    });

    activeFilter = selectedFaction;
    renderStocks(); // Re-render stocks with the new filter
}

/** Handles changes in the sort dropdown. */
function handleSortChange(event) {
    currentSort = event.target.value;
    renderStocks(); // Re-render stocks with the new sort order
}

/** Handles input in the search field. */
function handleSearchInput() {
    // Could add debouncing here if performance becomes an issue with very fast typing
    renderStocks(); // Re-render stocks based on the search term
}

/** Handles clicks within the stocks container (buy, sell, card details). */
function handleStocksContainerClick(event) {
    const target = event.target;
    const stockCard = target.closest('.stock-card');

    if (!stockCard) return; // Click wasn't inside a stock card

    const characterIdStr = stockCard.dataset.id;
     // Attempt to parse ID, handle potential non-numeric IDs gracefully
     const characterId = parseInt(characterIdStr, 10); // Use radix 10
     const isNumericId = !isNaN(characterId);


    if (target.matches('.btn-buy')) {
        event.stopPropagation(); // Prevent triggering card click
        if (isNumericId) {
            showQuantityModal(characterId, 'buy');
        } else {
            console.warn("Buy action attempted on non-numeric ID:", characterIdStr);
            showNotification("Cannot process buy action.", "error");
        }

    } else if (target.matches('.btn-sell')) {
        event.stopPropagation(); // Prevent triggering card click
        if (isNumericId) {
            showQuantityModal(characterId, 'sell');
         } else {
            console.warn("Sell action attempted on non-numeric ID:", characterIdStr);
            showNotification("Cannot process sell action.", "error");
         }
    } else {
        // Click was on the card itself (but not buttons)
        if (isNumericId) {
             showCharacterDetailModal(characterId);
         } else {
             // Handle clicks on cards with non-numeric IDs if needed, maybe show simpler info
             console.warn("Card click on non-numeric ID:", characterIdStr);
             const character = characters.find(c => c.id === characterIdStr); // Find by string ID
             if (character) {
                 showNotification(`Details for ${character.name}. (Actions may be limited)`, 'info');
             } else {
                showNotification("Character details unavailable.", "error");
             }
         }
    }
}

/** Handles clicks within the quantity modal (confirm, cancel, close). */
function handleQuantityModalClick(event) {
    if (event.target.matches('.btn-confirm')) {
        handleQuantityConfirm();
    } else if (event.target.matches('.btn-cancel') || event.target.matches('.close-modal')) {
        hideQuantityModal();
    } else if (event.target === dom.quantityModal) {
        // Click on the overlay background
        hideQuantityModal();
    }
}

/** Handles clicks within the character detail modal (close). */
function handleCharacterDetailModalClick(event) {
    if (event.target.matches('.close-modal') || event.target === characterDetailModal) {
        hideCharacterDetailModal();
    }
}

/** Handles keydown events for modals (e.g., Escape key). */
function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        if (characterDetailModal && characterDetailModal.classList.contains('active')) {
            hideCharacterDetailModal();
        } else if (dom.quantityModal && dom.quantityModal.classList.contains('active')) {
            hideQuantityModal();
        }
    }
    // Basic focus trapping (example) - more robust trapping might need libraries
    if (event.key === 'Tab') {
         const currentModal = characterDetailModal?.classList.contains('active') ? characterDetailModal :
                              dom.quantityModal?.classList.contains('active') ? dom.quantityModal : null;
        if (!currentModal) return;

        const focusableElements = currentModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else { // Tab
             if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }
}

// ==========================================================================
// Initialization
// ==========================================================================

/** Sets up news ticker animation. */
function initNews() {
  if (!dom.tickerContent) return;
  // Duplicate news items for seamless scrolling
  const newsHTML = NEWS_ITEMS.join('');
  dom.tickerContent.innerHTML = newsHTML + newsHTML;
}

/** Animates the loading screen and initializes the app upon completion. */
function animateLoadingScreen() {
    if (!dom.loadingScreen || !dom.loadingBar || !dom.loadingPercentage || !dom.welcomeMessage) {
        console.warn("Loading screen elements not found. Initializing directly.");
        initializeApp();
        return;
    }

    let progress = 0;
    dom.loadingBar.style.width = '0%';
    dom.loadingPercentage.textContent = '0%';
    document.body.style.overflow = 'hidden'; // Prevent scrolling during load

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 8 + 2; // Random progress increment
        progress = Math.min(progress, 100); // Cap at 100

        dom.loadingBar.style.width = `${progress}%`;
        dom.loadingPercentage.textContent = `${Math.round(progress)}%`;

        if (progress >= 100) {
            clearInterval(loadingInterval);

            // Show welcome message
            dom.welcomeMessage.classList.add('show');

            // After welcome message shows briefly, hide it and start screen exit
            setTimeout(() => {
                dom.welcomeMessage.classList.remove('show');
                dom.welcomeMessage.classList.add('hide');

                // Start the screen splitting animation slightly after message hides
                setTimeout(() => {
                    dom.loadingScreen.classList.add('hidden');

                    // Initialize the main app after the screen transition completes
                     // Use transitionend event for more robust timing if possible
                     dom.loadingScreen.addEventListener('transitionend', () => {
                         if (dom.loadingScreen.classList.contains('hidden')) { // Ensure it's the opacity/visibility transition
                             dom.loadingScreen.style.display = 'none'; // Remove from layout
                             document.body.style.overflow = ''; // Restore scrolling
                             initializeApp(); // << Initialize the app content
                         }
                     }, { once: true });
                      // Failsafe init if transition event doesn't fire reliably
                     setTimeout(() => {
                         if (dom.loadingScreen.classList.contains('hidden') && dom.loadingScreen.style.display !== 'none') {
                              console.warn("Loading screen transitionend event fallback triggered.");
                              dom.loadingScreen.style.display = 'none';
                              document.body.style.overflow = '';
                              initializeApp();
                         }
                     }, 2000); // Should be slightly longer than CSS transition

                }, 500); // Delay before starting screen split

            }, 1500); // Duration welcome message is shown
        }
    }, 150); // Interval for loading progress update
}


/** Initializes the application: loads data, sets up listeners, starts simulation. */
async function initializeApp() {
  console.log("Initializing One Piece Power Exchange...");

  // Initial loading messages (optional, as loading screen handles this)
  if (dom.stocksLoadingMsg) dom.stocksLoadingMsg.style.display = 'block';
  if (dom.portfolioLoadingMsg) dom.portfolioLoadingMsg.style.display = 'block';
  if (dom.searchInput) dom.searchInput.disabled = true;
  if (dom.sortSelect) dom.sortSelect.disabled = true;

  // Load core data
  try {
    characters = await loadCharacterData();
    // Basic data validation
    if (!Array.isArray(characters) || characters.length === 0) {
        throw new Error("Loaded character data is empty or invalid.");
    }
    // Ensure prices/changes are numbers, history is array
    characters = characters.map(c => ({
        ...c,
        price: Number(c.price) || 0,
        change: Number(c.change) || 0,
        volatility: Number(c.volatility) || 0.5,
        volume: Number(c.volume) || 0,
        history: Array.isArray(c.history) ? c.history : [],
        id: c.id // Keep original ID (can be string or number based on corrections)
    }));

    console.log("Character data loaded and validated.");
    if (dom.searchInput) dom.searchInput.disabled = false;
    if (dom.sortSelect) dom.sortSelect.disabled = false;

  } catch (error) {
    console.error("Failed to load or process character data:", error);
    if (dom.stocksContainer) dom.stocksContainer.innerHTML = `<p class="error-msg">Failed to load market data. Please try refreshing.</p>`;
    if (dom.portfolioContainer) dom.portfolioContainer.innerHTML = `<p class="error-msg">Failed to load portfolio data.</p>`;
    // Optionally display a retry button here
    return; // Stop initialization on critical error
  }

  // Initialize UI components and state
  initNews();
  loadPortfolioFromStorage(); // Load portfolio AFTER characters are loaded
  renderFactionFilters();
  renderStocks(); // Initial render based on default filters/sort
  renderPortfolio();

  // Setup Event Listeners using delegation where possible
  if (dom.factionFiltersContainer) {
      dom.factionFiltersContainer.addEventListener('click', handleFactionFilterClick);
  }
  if (dom.sortSelect) {
      dom.sortSelect.addEventListener('change', handleSortChange);
      currentSort = dom.sortSelect.value; // Ensure state matches initial dropdown value
  }
   if (dom.searchInput) {
       // Use 'input' for real-time filtering
       dom.searchInput.addEventListener('input', handleSearchInput);
   }
   if (dom.stocksContainer) {
       dom.stocksContainer.addEventListener('click', handleStocksContainerClick);
   }
   if (dom.quantityModal) {
       dom.quantityModal.addEventListener('click', handleQuantityModalClick);
   }
   // Add listener for the dynamically created character detail modal to the body
   document.body.addEventListener('click', (event) => {
        if (characterDetailModal && characterDetailModal.contains(event.target)) {
             handleCharacterDetailModalClick(event);
        }
   });
   // Global listener for Escape key
   document.addEventListener('keydown', handleModalKeydown);


  // Start market simulation
  if (simulationIntervalId) clearInterval(simulationIntervalId); // Clear previous interval if any
  simulationIntervalId = setInterval(simulateMarketChanges, SIMULATION_INTERVAL);

  console.log("App Initialized. Market simulation running.");
}

// ==========================================================================
// Initial Load Trigger
// ==========================================================================

// Use DOMContentLoaded to ensure the DOM is ready before starting
document.addEventListener('DOMContentLoaded', () => {
    // Start loading screen animation, which will call initializeApp on completion
    animateLoadingScreen();
});
