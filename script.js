import { loadCharacterData, MIN_PRICE } from './database.js';

// ====================================================================
// State Variables
// ====================================================================
let characters = []; // Holds the character stock data after loading
let portfolio = []; // Holds the user's owned stocks { id: number, shares: number }

let activeFilter = 'All'; // Currently selected faction filter
let currentSort = 'price-desc'; // Currently selected sort order
let simulationIntervalId = null; // To store the interval ID for market simulation

// Comparison modal state
let comparisonModal = null;
let comparisonChartInstance = null;
const comparedCharacters = []; // Stores IDs of characters being compared (up to 2)

// Theme state
let currentTheme = 'dark'; // Default theme

// ====================================================================
// Constants
// ====================================================================
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
const THEME_STORAGE_KEY = 'onePiecePowerExchangeTheme'; // Key for local storage

// ====================================================================
// DOM Element References
// ====================================================================
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

    // Quantity Modal
    quantityModal: document.getElementById('quantity-modal'),
    quantityModalContent: document.querySelector('#quantity-modal .modal-content'),
    quantityModalTitle: document.getElementById('modal-title'),
    quantityModalInfo: document.getElementById('modal-character-info'),
    quantityInput: document.getElementById('quantity-input'),
    quantityConfirmBtn: document.querySelector('#quantity-modal .btn-confirm'),
    quantityCancelBtn: document.querySelector('#quantity-modal .btn-cancel'),

    // Theme Toggle
    themeToggleBtn: document.getElementById('theme-toggle'),

    // Templates
    stockCardTemplate: document.getElementById('stock-card-template'),
    portfolioItemTemplate: document.getElementById('portfolio-item-template'),
    comparisonModalTemplate: document.getElementById('comparison-modal-template') // Added comparison template reference
};

// Reference for the character detail modal (created dynamically)
let characterDetailModal = null;
let priceChartInstance = null; // To keep track of the Chart.js instance for detail modal


// ====================================================================
// Utility Functions
// ====================================================================

/**
 * Creates a DOM element with specified tag, classes, and innerHTML.
 * @param {string} tag HTML tag name.
 * @param {string} [classes=''] - Space-separated CSS classes.
 * @param {string} [html=''] - Inner HTML content.
 * @returns {HTMLElement} The created DOM element.
 */
const createElem = (tag, classes = '', html = '') => {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    if (html) el.innerHTML = html;
    return el;
};

/**
 * Formats a number as Beli currency (e.g., B1,234).
 * @param {number} amount The amount to format.
 * @returns {string} Formatted currency string.
 */
const formatBeli = (amount) => `B ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Formats a percentage change with a sign (e.g., +1.2%, -5.0%).
 * @param {number} change The percentage change.
 * @returns {string} Formatted change string.
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
 * @param {string} text The message to display.
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


// ====================================================================
// Theme Management
// ====================================================================

/**
 * Sets the application theme.
 * @param {'light' | 'dark'} theme - The theme to apply.
 */
function setTheme(theme) {
    const body = document.body;
    if (theme === 'light') {
        body.classList.add('light-mode');
        currentTheme = 'light';
        // Update toggle button icon
        if (dom.themeToggleBtn) {
            dom.themeToggleBtn.innerHTML = '<span class="icon">🌙</span>'; // Moon icon for dark mode
        }
    } else {
        body.classList.remove('light-mode');
        currentTheme = 'dark';
         // Update toggle button icon
        if (dom.themeToggleBtn) {
             dom.themeToggleBtn.innerHTML = '<span class="icon">☀️</span>'; // Sun icon for light mode
        }
    }
    // Save preference to local storage
    try {
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch (e) {
        console.error("Failed to save theme preference:", e);
    }
    console.log(`Theme set to: ${currentTheme}`);
    // Note: Chart colors might need manual update or re-render if they don't
    // automatically adapt via CSS variables (Chart.js can be tricky with this).
    // For this example, we'll leave chart colors as is, assuming they are
    // defined in the Chart.js options and would need to be updated there
    // based on the currentTheme if full theme support is needed for charts.
    // A more advanced approach would involve destroying and recreating charts
    // or updating their options when the theme changes.
}

/**
 * Toggles the application theme between light and dark.
 */
function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

/**
 * Loads the saved theme preference from local storage and applies it.
 */
function loadThemePreference() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme);
        } else {
            // Apply default theme if no preference is saved or it's invalid
            setTheme(currentTheme); // Applies the initial 'dark' theme
        }
    } catch (e) {
        console.error("Failed to load theme preference:", e);
        // Apply default theme on error
        setTheme(currentTheme);
    }
}


// ====================================================================
// Rendering Functions
// ====================================================================

/** Renders the faction filter buttons. */
function renderFactionFilters() {
    if (!dom.factionFiltersContainer || !characters || characters.length === 0) return;

    const factions = ['All', ...new Set(characters.map(c => c.faction || 'Unknown'))];
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
            (c.faction && c.faction.toLowerCase().includes(searchTerm)) ||
            (c.category && c.category.toLowerCase().includes(searchTerm))
        );
    }

    // 2. Sort Data
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
        const compareBtn = cardClone.querySelector('.compare-btn'); // Get compare button

        if (!cardElement || !nameEl || !symbolEl || !priceEl || !changeEl || !powerEl || !buyBtn || !sellBtn || !compareBtn) {
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
        compareBtn.dataset.id = c.id; // Add ID to compare button

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
    let bestPerformer = { name: 'N/A', change: -Infinity }; // Initialize with negative infinity

    if (portfolio.length === 0) {
        dom.portfolioContainer.innerHTML = '<p class="no-data-msg">Your portfolio is empty.</p>';
        updatePortfolioStats(0, 0, 0, 'N/A', 'N/A', -Infinity); // Reset stats, use -Infinity for bestChange
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
        // Calculate change amount based on the price change percentage
        const changeAmount = character.price - (character.price / (1 + (character.change / 100 || 0)));
        const positionChangeValue = changeAmount * item.shares;
        const positionInitialValue = positionValue - positionChangeValue;


        totalPortfolioValue += positionValue;
        totalPortfolioChangeValue += positionChangeValue;
        initialPortfolioValue += positionInitialValue;

        if (positionValue > highestValuePosition.value) {
            highestValuePosition = { name: character.name.split(' ')[0], value: positionValue };
        }

        // Ensure character.change is a number before comparison
        if (typeof character.change === 'number' && character.change > bestPerformer.change) {
             bestPerformer = { name: character.name.split(' ')[0], change: character.change };
        }


        // Create Portfolio Item from Template
        const itemClone = dom.portfolioItemTemplate.content.cloneNode(true);
        const nameEl = itemClone.querySelector('.portfolio-stock-name');
        const sharesEl = itemClone.querySelector('.portfolio-stock-shares');
        const iconEl = itemClone.querySelector('.portfolio-stock-icon');
        const valueEl = itemClone.querySelector('.portfolio-stock-value');
        const changeEl = itemClone.querySelector('.portfolio-stock-change');
        const powerEl = itemClone.querySelector('.portfolio-stock-power'); // Get power element
        const hakiEl = itemClone.querySelector('.portfolio-stock-haki'); // Get haki element
        const bountyEl = itemClone.querySelector('.portfolio-stock-bounty'); // Get bounty element


        if (!nameEl || !sharesEl || !valueEl || !changeEl || !iconEl || !powerEl || !hakiEl || !bountyEl) {
            console.error("Template structure error for portfolio item.");
            return; // Skip broken item
        }

        nameEl.textContent = character.name;
        sharesEl.textContent = `${item.shares} shares`;
        iconEl.textContent = character.icon || '?'; // Display icon or fallback
        valueEl.textContent = formatBeli(positionValue);
        changeEl.textContent = formatChange(character.change);
        changeEl.className = `portfolio-stock-change ${character.change >= 0 ? 'text-positive' : 'text-negative'}`;

        // Populate additional details (assuming they exist in character data)
        powerEl.textContent = `Power: ${character.power || 'N/A'}`;
        hakiEl.textContent = `Haki: ${character.haki || 'N/A'}`; // Assuming 'haki' property
        bountyEl.textContent = `Bounty: ${character.bounty ? formatBeli(character.bounty) : 'N/A'}`; // Assuming 'bounty' property


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

/**
 * Shows the comparison modal with two characters using the template.
 */
function showComparisonModal(characterId1, characterId2) {
    const char1 = characters.find(c => c.id === characterId1);
    const char2 = characters.find(c => c.id === characterId2);

    if (!char1 || !char2) {
        showNotification("Could not load character data for comparison", "error");
        return;
    }

    // Clean up previous modal if exists
    if (comparisonModal && comparisonModal.parentNode) {
        comparisonModal.remove();
    }
    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
        comparisonChartInstance = null;
    }

    // Clone modal structure from template
    if (!dom.comparisonModalTemplate) {
        console.error("Comparison modal template not found.");
        showNotification("Comparison feature temporarily unavailable.", "error");
        return;
    }
    const modalClone = dom.comparisonModalTemplate.content.cloneNode(true);
    comparisonModal = modalClone.querySelector('.modal');
    const modalContent = comparisonModal.querySelector('.modal-content');

    // Populate modal content with character data
    if (modalContent) {
        modalContent.querySelector('#comparison-modal-title').textContent = `${char1.name} vs ${char2.name}`;

        const charLeftInfo = modalContent.querySelector('.character-left');
        charLeftInfo.querySelector('.comparison-icon').textContent = char1.icon || '?';
        charLeftInfo.querySelector('.comparison-stats div:nth-child(1) strong').textContent = formatBeli(char1.price);
        const char1ChangeEl = charLeftInfo.querySelector('.comparison-stats div:nth-child(2) strong');
        char1ChangeEl.textContent = formatChange(char1.change);
        char1ChangeEl.className = char1.change >= 0 ? 'text-positive' : 'text-negative';
        charLeftInfo.querySelector('.comparison-stats div:nth-child(3) strong').textContent = `${(char1.volatility * 10).toFixed(1)}%`;


        const charRightInfo = modalContent.querySelector('.character-right');
        charRightInfo.querySelector('.comparison-icon').textContent = char2.icon || '?';
        charRightInfo.querySelector('.comparison-stats div:nth-child(1) strong').textContent = formatBeli(char2.price);
        const char2ChangeEl = charRightInfo.querySelector('.comparison-stats div:nth-child(2) strong');
        char2ChangeEl.textContent = formatChange(char2.change);
        char2ChangeEl.className = char2.change >= 0 ? 'text-positive' : 'text-negative';
        charRightInfo.querySelector('.comparison-stats div:nth-child(3) strong').textContent = `${(char2.volatility * 10).toFixed(1)}%`;

        // Populate metrics
        modalContent.querySelector('#correlation-value').textContent = calculateCorrelation(char1, char2);
        modalContent.querySelector('.comparison-metrics .metric:nth-child(2) strong').textContent = formatBeli(Math.abs(char1.price - char2.price));

    } else {
         console.error("Comparison modal content not found within template clone.");
         showNotification("Comparison feature temporarily unavailable.", "error");
         return;
    }


    document.body.appendChild(comparisonModal);
    comparisonModal.classList.add('active');

    // Initialize comparison chart
    renderComparisonChart(char1, char2);

    // Focus trap for accessibility
    const closeBtn = comparisonModal.querySelector('.close-modal');
    if(closeBtn) {
        closeBtn.focus();
    }
}


/**
 * Calculates correlation coefficient between two characters' price histories
 */
function calculateCorrelation(char1, char2) {
    if (!char1.history?.length || !char2.history?.length) return "N/A";

    // Normalize history lengths by using the last 30 days
    const history1 = char1.history.slice(-MAX_HISTORY_DAYS).map(h => h.price);
    const history2 = char2.history.slice(-MAX_HISTORY_DAYS).map(h => h.price);

    // Ensure histories have the same length after slicing
    const minLength = Math.min(history1.length, history2.length);
    if (minLength === 0) return "N/A"; // Cannot calculate with empty history

    const h1 = history1.slice(-minLength);
    const h2 = history2.slice(-minLength);


    // Simple correlation calculation
    const avg1 = h1.reduce((sum, val) => sum + val, 0) / minLength;
    const avg2 = h2.reduce((sum, val) => sum + val, 0) / minLength;

    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < minLength; i++) {
        const diff1 = h1[i] - avg1;
        const diff2 = h2[i] - avg2;
        covariance += diff1 * diff2;
        variance1 += diff1 * diff1;
        variance2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(variance1 * variance2);
    if (denominator === 0) return "N/A"; // Avoid division by zero

    const correlation = covariance / denominator;
    return correlation.toFixed(2);
}

/**
 * Renders the comparison chart
 */
function renderComparisonChart(char1, char2) {
    const ctx = comparisonModal?.querySelector('#comparisonChart')?.getContext('2d');
    if (!ctx || !Chart) {
         console.error("Chart context or Chart.js library not available for comparison chart.");
         return;
    }

    // Prepare chart data - using the sliced history for consistency with correlation
     const history1 = char1.history?.slice(-MAX_HISTORY_DAYS) || [];
     const history2 = char2.history?.slice(-MAX_HISTORY_DAYS) || [];
     const minLength = Math.min(history1.length, history2.length);

     const labels = history1.slice(-minLength).map((_, i) => `Day ${i + 1}`);
     const data1 = history1.slice(-minLength).map(h => h.price);
     const data2 = history2.slice(-minLength).map(h => h.price);


    comparisonChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: char1.name,
                    data: data1,
                    borderColor: '#e63946', // Red (Primary color) - Consider making this theme-aware
                    backgroundColor: 'rgba(230, 57, 70, 0.1)', // Red transparent
                    tension: 0.1,
                    pointRadius: 2,
                    pointHoverRadius: 6
                },
                {
                    label: char2.name,
                    data: data2,
                    borderColor: '#457b9d', // Blue (Secondary color) - Consider making this theme-aware
                    backgroundColor: 'rgba(69, 123, 157, 0.1)', // Blue transparent
                    tension: 0.1,
                     pointRadius: 2,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container height
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${formatBeli(ctx.raw)}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => formatBeli(value),
                         color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.7)' : 'rgba(29, 53, 87, 0.7)' // Theme-aware tick color
                    },
                     grid: {
                         color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.1)' : 'rgba(29, 53, 87, 0.1)' // Theme-aware grid color
                     }
                },
                x: {
                     ticks: {
                         color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.7)' : 'rgba(29, 53, 87, 0.7)', // Theme-aware tick color
                         maxTicksLimit: 10,
                         autoSkip: true
                     },
                     grid: {
                         display: false // Hide vertical grid lines
                     }
                }
            }
        }
    });
}

/**
 * Closes the comparison modal
 */
function hideComparisonModal() {
    if (comparisonModal) {
        comparisonModal.classList.remove('active');
        // Remove from DOM after transition
        comparisonModal.addEventListener('transitionend', () => {
             // Check if the modal is indeed hidden before removing
            if (comparisonModal && !comparisonModal.classList.contains('active') && comparisonModal.parentNode) {
                 comparisonModal.remove();
                 comparisonModal = null; // Dereference
            }
        }, { once: true });

        // Failsafe removal
        setTimeout(() => {
             if (comparisonModal && !comparisonModal.classList.contains('active') && comparisonModal.parentNode) {
                comparisonModal.remove();
                comparisonModal = null; // Dereference
             }
        }, 500); // Slightly longer than CSS transition

    }
    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
        comparisonChartInstance = null; // Dereference
    }
     // Clear compared characters array when modal is closed
    comparedCharacters.length = 0;
}


// ====================================================================
// Stats Update Functions
// ====================================================================

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
    // Only show best performer change if it's a valid number
    dom.portfolioBestPerfElem.textContent = (bestName !== 'N/A' && typeof bestChange === 'number') ? `${bestName} ${formatChange(bestChange)}` : 'N/A';
     // Apply text color based on bestChange, default to text-positive if N/A or not a number
    dom.portfolioBestPerfElem.className = `stat-value ${(typeof bestChange === 'number' && bestChange >= 0) ? 'text-positive' : 'text-negative'}`;
}


// ====================================================================
// Market Simulation & Data Update
// ====================================================================

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
        // Remove oldest entry if history exceeds max days
        while (c.history.length >= MAX_HISTORY_DAYS) {
             c.history.shift();
        }
        // Add new history entry
        c.history.push({ date: today, price: c.price });
    });

    // Re-render affected parts
    renderStocks();
    renderPortfolio();
    // If comparison modal is open, re-render chart and metrics
    if (comparisonModal && comparedCharacters.length === 0) { // Only update if modal is open and comparison is active
        const char1Id = comparisonModal.querySelector('.character-left .comparison-icon')?.textContent === '?' ? null : characters.find(c => c.icon === comparisonModal.querySelector('.character-left .comparison-icon').textContent)?.id;
        const char2Id = comparisonModal.querySelector('.character-right .comparison-icon')?.textContent === '?' ? null : characters.find(c => c.icon === comparisonModal.querySelector('.character-right .comparison-icon').textContent)?.id;

        if (char1Id && char2Id) {
             const char1 = characters.find(c => c.id === char1Id);
             const char2 = characters.find(c => c.id === char2Id);
             if (char1 && char2) {
                 // Update displayed prices and changes
                 const modalContent = comparisonModal.querySelector('.modal-content');
                 if (modalContent) {
                     const charLeftInfo = modalContent.querySelector('.character-left');
                     charLeftInfo.querySelector('.comparison-stats div:nth-child(1) strong').textContent = formatBeli(char1.price);
                     const char1ChangeEl = charLeftInfo.querySelector('.comparison-stats div:nth-child(2) strong');
                     char1ChangeEl.textContent = formatChange(char1.change);
                     char1ChangeEl.className = char1.change >= 0 ? 'text-positive' : 'text-negative';

                     const charRightInfo = modalContent.querySelector('.character-right');
                     charRightInfo.querySelector('.comparison-stats div:nth-child(1) strong').textContent = formatBeli(char2.price);
                     const char2ChangeEl = charRightInfo.querySelector('.comparison-stats div:nth-child(2) strong');
                     char2ChangeEl.textContent = formatChange(char2.change);
                     char2ChangeEl.className = char2.change >= 0 ? 'text-positive' : 'text-negative';

                     // Update metrics
                     modalContent.querySelector('#correlation-value').textContent = calculateCorrelation(char1, char2);
                     modalContent.querySelector('.comparison-metrics .metric:nth-child(2) strong').textContent = formatBeli(Math.abs(char1.price - char2.price));
                 }

                 // Re-render chart with updated history
                 if (comparisonChartInstance) {
                     comparisonChartInstance.destroy(); // Destroy old instance
                     comparisonChartInstance = null; // Dereference
                 }
                 renderComparisonChart(char1, char2); // Render new instance
             }
        }
    }
}


// ====================================================================
// Portfolio Management & Local Storage
// ====================================================================

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

// ====================================================================
// Modal Management (Quantity & Character Detail)
// ====================================================================
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

    // Add glow class to modal content
    const modalContent = createElem('div', `modal-content ${character.glow || ''}`);

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
         // Use sliced history for the chart
        const historyData = character.history.slice(-MAX_HISTORY_DAYS);

        priceChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historyData.map(h => {
                    const date = new Date(h.date);
                    // Format as MM/DD, handle potential invalid dates
                    return !isNaN(date.getTime()) ? `${date.getMonth() + 1}/${date.getDate()}` : 'Invalid Date';
                }),
                datasets: [{
                    label: 'Price History',
                    data: historyData.map(h => h.price),
                    borderColor: currentTheme === 'dark' ? 'rgba(244, 162, 97, 1)' : 'rgba(230, 57, 70, 1)', // Accent color, theme-aware
                    backgroundColor: currentTheme === 'dark' ? 'rgba(244, 162, 97, 0.1)' : 'rgba(230, 57, 70, 0.1)', // Accent color transparent, theme-aware
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
                             color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.7)' : 'rgba(29, 53, 87, 0.7)' // Theme-aware tick color
                        },
                        grid: {
                            color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.1)' : 'rgba(29, 53, 87, 0.1)' // Lighter grid lines, theme-aware
                        }
                    },
                    x: {
                        ticks: {
                            color: currentTheme === 'dark' ? 'rgba(241, 250, 238, 0.7)' : 'rgba(29, 53, 87, 0.7)', // Theme-aware tick color
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
        if(!character.history || character.history.length === 0) console.warn(`No history data for ${character.name}`);
    }
}

/** Hides and cleans up the character detail modal. */
function hideCharacterDetailModal() {
    if (characterDetailModal) {
        characterDetailModal.classList.remove('active');
        // Remove from DOM after transition
        characterDetailModal.addEventListener('transitionend', () => {
            // Check if the modal is indeed hidden before removing
            if (characterDetailModal && !characterDetailModal.classList.contains('active') && characterDetailModal.parentNode) {
                characterDetailModal.remove();
                characterDetailModal = null; // Dereference
            }
        }, { once: true });

        // Failsafe removal
        setTimeout(() => {
             if (characterDetailModal && !characterDetailModal.classList.contains('active') && characterDetailModal.parentNode) {
                characterDetailModal.remove();
                characterDetailModal = null; // Dereference
             }
        }, 500); // Slightly longer than CSS transition
    }
    if (priceChartInstance) {
        priceChartInstance.destroy();
        priceChartInstance = null; // Dereference
    }
}


// ====================================================================
// Event Handlers
// ====================================================================

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

/** Handles clicks within the stocks container (buy, sell, compare, card details). */
function handleStocksContainerClick(event) {
    const target = event.target;
    const stockCard = target.closest('.stock-card');
    if (!stockCard) return; // Click wasn't inside a stock card

    const characterIdStr = stockCard.dataset.id;
    // Attempt to find character by ID (string or number)
    const character = characters.find(c => c.id == characterIdStr); // Use == for loose comparison

    if (!character) {
         console.warn("Character data not found for card click:", characterIdStr);
         showNotification("Character data unavailable.", "error");
         return;
    }

    // Handle comparison logic
    if (target.matches('.compare-btn')) {
        event.stopPropagation(); // Prevent triggering card click
        const charId = character.id; // Use the found character's ID

        if (comparedCharacters.length < 2) {
            // Prevent adding the same character twice
            if (!comparedCharacters.includes(charId)) {
                 comparedCharacters.push(charId);
                 showNotification(`Added ${character.name} to comparison (${comparedCharacters.length}/2)`, 'info');
            } else {
                 showNotification(`${character.name} is already selected for comparison.`, 'info');
            }

            if (comparedCharacters.length === 2) {
                showComparisonModal(comparedCharacters[0], comparedCharacters[1]);
                // comparedCharacters array is now cleared when the modal is hidden
            }
        } else {
             // This case should ideally not happen if the array is cleared on modal close,
             // but as a failsafe:
             showNotification("You can only compare two characters at a time. Close the comparison modal to select new ones.", "info");
        }

    } else if (target.matches('.btn-buy')) {
        event.stopPropagation(); // Prevent triggering card click
        showQuantityModal(character.id, 'buy');

    } else if (target.matches('.btn-sell')) {
        event.stopPropagation(); // Prevent triggering card click
        showQuantityModal(character.id, 'sell');

    } else {
        // Click was on the card itself (but not buttons)
        showCharacterDetailModal(character.id);
    }
}


/** Handles clicks within the quantity modal (confirm, cancel, close). */
function handleQuantityModalClick(event) {
    // Check if the click is inside the modal content to avoid closing when clicking overlay
    if (!dom.quantityModalContent || !dom.quantityModalContent.contains(event.target) && event.target !== dom.quantityModal) {
        return;
    }

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
     // Check if the click is inside the modal content to avoid closing when clicking overlay
    if (!characterDetailModal || (!characterDetailModal.querySelector('.modal-content').contains(event.target) && event.target !== characterDetailModal)) {
        return;
    }

    if (event.target.matches('.close-modal') || event.target === characterDetailModal) {
        hideCharacterDetailModal();
    }
}

/** Handles clicks within the comparison modal (close). */
function handleComparisonModalClick(event) {
     // Check if the click is inside the modal content to avoid closing when clicking overlay
    if (!comparisonModal || (!comparisonModal.querySelector('.modal-content').contains(event.target) && event.target !== comparisonModal)) {
        return;
    }

    if (event.target.matches('.close-modal') || event.target === comparisonModal) {
        hideComparisonModal();
    }
}


/** Handles keydown events for modals (e.g., Escape key). */
function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        if (characterDetailModal && characterDetailModal.classList.contains('active')) {
            hideCharacterDetailModal();
        } else if (comparisonModal && comparisonModal.classList.contains('active')) {
             hideComparisonModal();
        }
        else if (dom.quantityModal && dom.quantityModal.classList.contains('active')) {
            hideQuantityModal();
        }
    }
    // Basic focus trapping (example) - more robust trapping might need libraries
    // This example is simplified and might not cover all edge cases.
    if (event.key === 'Tab') {
        const currentActiveModal =
            (characterDetailModal && characterDetailModal.classList.contains('active')) ? characterDetailModal :
            (comparisonModal && comparisonModal.classList.contains('active')) ? comparisonModal :
            (dom.quantityModal && dom.quantityModal.classList.contains('active')) ? dom.quantityModal : null;

        if (!currentActiveModal) return;

        const focusableElements = currentActiveModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Ensure there are focusable elements
        if (focusableElements.length === 0) return;

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


// ====================================================================
// Initialization
// ====================================================================

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
                        // Ensure it's the opacity/visibility transition
                        if (dom.loadingScreen && dom.loadingScreen.classList.contains('hidden')) {
                            dom.loadingScreen.style.display = 'none'; // Remove from layout
                            document.body.style.overflow = ''; // Restore scrolling
                            initializeApp(); // << Initialize the app content
                        }
                    }, { once: true });

                    // Failsafe init if transition event doesn't fire reliably
                    setTimeout(() => {
                         if (dom.loadingScreen && dom.loadingScreen.classList.contains('hidden') && dom.loadingScreen.style.display !== 'none') {
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
    if (dom.themeToggleBtn) dom.themeToggleBtn.disabled = true; // Disable toggle during load

    // Load core data
    try {
        characters = await loadCharacterData();
        // Basic data validation
        if (!Array.isArray(characters) || characters.length === 0) {
            throw new Error("Loaded character data is empty or invalid.");
        }
        // Ensure prices/changes are numbers, history is array, handle potential string IDs
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
         if (dom.themeToggleBtn) dom.themeToggleBtn.disabled = false; // Enable toggle after load

    } catch (error) {
        console.error("Failed to load or process character data:", error);
        if (dom.stocksContainer) dom.stocksContainer.innerHTML = `<p class="error-msg">Failed to load market data. Please try refreshing.</p>`;
        if (dom.portfolioContainer) dom.portfolioContainer.innerHTML = `<p class="error-msg">Failed to load portfolio data.</p>`;
        // Optionally display a retry button here
        return; // Stop initialization on critical error
    }

    // Load theme preference before rendering
    loadThemePreference();

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
        // Listen for clicks on the modal itself and its content
        dom.quantityModal.addEventListener('click', handleQuantityModalClick);
    }
     if (dom.themeToggleBtn) {
         dom.themeToggleBtn.addEventListener('click', toggleTheme);
     }

    // Add listeners for the dynamically created modals to the body using delegation
    document.body.addEventListener('click', (event) => {
        // Handle character detail modal clicks
        if (characterDetailModal && characterDetailModal.contains(event.target)) {
            handleCharacterDetailModalClick(event);
        }
         // Handle comparison modal clicks
        if (comparisonModal && comparisonModal.contains(event.target)) {
             handleComparisonModalClick(event);
        }
    });


    // Global listener for Escape key
    document.addEventListener('keydown', handleModalKeydown);


    // Start market simulation
    if (simulationIntervalId) clearInterval(simulationIntervalId); // Clear previous interval if any
    simulationIntervalId = setInterval(simulateMarketChanges, SIMULATION_INTERVAL);

    console.log("App Initialized. Market simulation running.");
}

// ====================================================================
// Initial Load Trigger
// ====================================================================
// Use DOMContentLoaded to ensure the DOM is ready before starting
document.addEventListener('DOMContentLoaded', () => {
    // Start loading screen animation, which will call initializeApp on completion
    animateLoadingScreen();
});
