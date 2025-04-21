import { stockData, loadCharacterData, generatePriceHistory, MIN_PRICE } from './database.js';

// Constants
const MILLISECONDS_IN_A_DAY = 86400000; // Milliseconds in a day

// Global variables
let characters = []; // This will be populated by loadCharacterData later
let portfolio = []; // User's portfolio

// --- DOM Element References
const stocksContainer = document.getElementById('stocks-container');
const portfolioContainer = document.getElementById('portfolio-container');
const portfolioValueElem = document.getElementById('portfolio-value');
const notificationArea = document.getElementById('notification-area');
const tickerContent = document.getElementById('ticker-content');
const marketIndexElem = document.getElementById('market-index');
const marketChangeElem = document.getElementById('market-change');
const marketPiratesElem = document.getElementById('market-pirates');
const portfolioDailyChangeElem = document.getElementById('portfolio-daily-change');
const portfolioTotalPiratesElem = document.getElementById('portfolio-total-pirates');
const portfolioHighestPosElem = document.getElementById('portfolio-highest-pos');
const portfolioBestPerfElem = document.getElementById('portfolio-best-perf');
const stocksLoadingMsg = document.getElementById('stocks-loading-msg');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// Call this periodically to update prices
function updateMarket() {
    const today = new Date().toISOString().split('T')[0]; // Corrected date format
    stockData.forEach(character => {
        if (
            typeof character.price !== 'number' ||
            typeof character.volatility !== 'number' ||
            !Array.isArray(character.history)
        ) return;

        // Corrected change calculation
        const change = (Math.random() * 2 - 1) * character.volatility;
        // Corrected price update with multiplication operator
        const oldPrice = character.price;
        let newPrice = oldPrice * (1 + change / 100);

        // Ensure the new price does not fall below the minimum price
        newPrice = Math.max(MIN_PRICE, newPrice);
        character.price = Math.round(newPrice);


        // Update character.change based on the actual percentage change
        if (oldPrice !== 0) { // Avoid division by zero
             character.change = parseFloat(((character.price - oldPrice) / oldPrice * 100).toFixed(1));
        } else {
             character.change = 0;
        }


        // Shift history and add new entry
        if (character.history.length >= 30) {
             character.history.shift(); // keep 30-day history
        }
        character.history.push({
            date: today,
            price: character.price
        });
    });
     renderStocks(); // Re-render stocks after market update
     renderPortfolio(); // Re-render portfolio after market update
}

// --- Utility Functions
const createElem = (tag, classes = '', html = '') => {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    if (html) el.innerHTML = html;
    return el;
};

function showNotification(text, type = 'info') {
    const toast = createElem('div', `toast ${type}`, text);
    notificationArea.appendChild(toast);
    setTimeout(() => {
        if (notificationArea.contains(toast)) {
            notificationArea.removeChild(toast);
        }
    }, 4000);
}

const formatBeli = (amount) => `฿${amount.toLocaleString()}`;
const formatChange = (change) => `${change >= 0 ? '+' : ''}${Math.abs(change).toFixed(1)}%`;
const formatChangeText = (change) => `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;


// Character Detail Modal:
function showCharacterDetail(characterId) {
    const char = characters.find(c => c.id === characterId);
    if (!char) return;

    const modal = document.createElement('div');
    modal.className = 'character-modal';

    modal.innerHTML = `
        <div class="modal-content ${char.glow}">
            <span class="close-modal">&times;</span>
            <div class="modal-header">
                <h2>${char.name} (${char.symbol})</h2>
                <div class="modal-faction">${char.faction}</div>
            </div>
            <div class="modal-body">
                 <div class="modal-icon">${char.icon}</div>
                <div class="modal-stats">
                    <div>Current Price: ${formatBeli(char.price)}</div>
                    <div>24h Change: <span class="${char.change >= 0 ? 'positive' : 'negative'}">${formatChange(char.change)}</span></div>
                    <div>Volatility: ${(char.volatility * 100).toFixed(1)}%</div>
                    <div>Daily Volume: ${char.volume.toLocaleString()}</div>
                </div>
                <div class="modal-power">${char.power}</div>
                <p class="modal-description">${char.description}</p>
                <div class="modal-chart">
                    <canvas id="priceChart"></canvas>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize the chart
    const ctx = modal.querySelector('#priceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: char.history.map(h => {
                 const date = new Date(h.date);
                 return `${date.getMonth() + 1}/${date.getDate()}`; // Format as MM/DD
            }),
            datasets: [{
                label: 'Price History (30 Days)',
                data: char.history.map(h => h.price),
                borderColor: 'rgba(244, 162, 97, 1)',
                backgroundColor: 'rgba(244, 162, 97, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '฿' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '฿' + value.toLocaleString();
                        }
                    }
                },
                 x: {
                    // Ensure all labels are displayed
                    distribution: 'series',
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 15 // Adjust as needed for readability
                    }
                }
            }
        }
    });

    // Close modal handlers
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add click handler to stock cards (put this in your initialization)
function initStockCardClicks() {
    stocksContainer.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.btn-buy');
        const sellButton = e.target.closest('.btn-sell');
        const card = e.target.closest('.stock-card');
        
        if (buyButton) {
            e.stopPropagation();
            showQuantityModal(parseInt(buyButton.dataset.id), 'buy');
        } else if (sellButton) {
            e.stopPropagation();
            showQuantityModal(parseInt(sellButton.dataset.id), 'sell');
        } else if (card) {
            const charId = parseInt(card.querySelector('.btn-buy').dataset.id);
            showCharacterDetail(charId);
        }
    });
}


// Loading screen animation functions
function animateLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');
    const welcomeMessage = document.getElementById('welcome-message');

    let progress = 0;

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 8 + 2; // Progress between 2-10% each step
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            // Show welcome message
            welcomeMessage.classList.add('show');

            // After showing welcome message, start the exit animation
            setTimeout(() => {
                welcomeMessage.classList.remove('show');
                welcomeMessage.classList.add('hide');

                // Start the exit animation
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    // Initialize the app after transition completes
                    setTimeout(() => {
                         loadingScreen.style.display = 'none';
                         document.body.style.overflow = ''; // Restore scrolling
                         initializeApp(); // Directly initialize the app
                    }, 800);
                }, 1000);
            }, 2000);

        }
        loadingBar.style.width = `${progress}%`;
        loadingPercentage.textContent = `${Math.round(progress)}%`;
    }, 100);
}

// Render Functions
function renderStocks(data = characters) {
    stocksContainer.textContent = ''; // Clear previous content
     if(stocksLoadingMsg) stocksLoadingMsg.style.display = 'none'; // Hide loading message


    if (!Array.isArray(data) || data.length === 0) {
        stocksContainer.innerHTML = `
            <p style="text-align: center; opacity: 0.7;">No stock data available.</p>
            <div style="text-align: center; margin-top: 1rem;">
                 <button class="btn" onclick="initializeApp()">Retry</button>
            </div>
        `;
        marketIndexElem.innerHTML = `฿0`;
        marketChangeElem.textContent = '--%';
        marketChangeElem.className = 'stat';
        marketPiratesElem.innerHTML = `0 Pirates`;

        return;
    }

    const frag = document.createDocumentFragment();

    data.sort((a, b) => b.price - a.price).forEach(c => {
        if (!c || typeof c !== 'object' || !('price' in c) || !('change' in c)) return;

        const changeClass = c.change >= 0 ? 'positive' : 'negative';
        const glowClass = c.glow ? c.glow : '';

        const card = createElem('div', `stock-card ${glowClass}`);
        card.innerHTML = `
            <div class="stock-header">
                <span class="stock-name">${c.name}</span>
                <span class="stock-symbol">${c.symbol}</span>
            </div>
            <div class="stock-price">${formatBeli(c.price)}</div>
            <div class="stock-change ${changeClass}">${formatChange(c.change)}</div>
            <div class="stock-power">${c.power}</div>
            <div class="stock-actions">
                <button class="btn btn-buy" data-id="${c.id}"><span class="icon">🛒</span> Buy</button>
                <button class="btn btn-sell" data-id="${c.id}"><span class="icon">💰</span> Sell</button>
            </div>
        `;

        card.querySelector('.btn-buy').addEventListener('click', (e) => {
            e.stopPropagation();
            buyStock(c.id);
        });

        card.querySelector('.btn-sell').addEventListener('click', (e) => {
            e.stopPropagation();
            sellStock(c.id);
        });

        frag.appendChild(card);
    });

    stocksContainer.appendChild(frag);

    // Update Market Stats
    const totalMarketValue = data.reduce((sum, c) => sum + c.price, 0);
    const avgMarketChange = data.reduce((sum, c) => sum + c.change, 0) / data.length;

    marketIndexElem.innerHTML = `฿${totalMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0})}`;
    marketChangeElem.textContent = formatChange(avgMarketChange);
    marketChangeElem.className = `stat ${avgMarketChange >= 0 ? 'positive' : 'negative'}`;
    marketPiratesElem.innerHTML = `${data.length} Pirates`;

    initStockCardClicks(); // Re-initialize clicks after rendering stocks
}

// LocalStorage Portfolio Save/Load
function savePortfolio() {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

function loadPortfolioFromStorage() {
    const saved = localStorage.getItem("portfolio");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                 // Ensure loaded portfolio items have required structure
                 portfolio = parsed.filter(item => item && typeof item.id === 'number' && typeof item.shares === 'number' && item.shares > 0);
            }
        } catch (e) {
            console.warn("Failed to parse saved portfolio, using default.", e);
            portfolio = []; // Reset portfolio if loading fails
        }
    } else {
         portfolio = []; // Initialize empty if nothing saved
    }
}

// renderFactionFilters
function renderFactionFilters() {
    const factions = [...new Set(characters.map(c => c.faction))]; // Use characters array instead of stockData
    const filterContainer = document.getElementById('faction-filters');

    if (!filterContainer) return;

    const filterHTML = factions.map(f =>
        `<button class="faction-filter" data-faction="${f}">${f}</button>`
    ).join('');

    filterContainer.innerHTML = `<button class="faction-filter active" data-faction="All">All</button>` + filterHTML; // 'All' is active by default

    document.querySelectorAll('.faction-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.faction-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const faction = btn.dataset.faction;
            const filtered = faction === 'All' ? characters : 
                characters.filter(c => c.faction === faction);
            renderStocks(filtered);
        });
    });
}


// Portfolio Rendering
function renderPortfolio() {
    portfolioContainer.innerHTML = ''; // Clear previous content
     const portfolioLoadingMsg = document.getElementById('portfolio-loading-msg');
     if(portfolioLoadingMsg) portfolioLoadingMsg.style.display = 'none'; // Hide loading message


    let totalPortfolioValue = 0;
    let totalChangeValue = 0;
    let highestValuePosition = { name: 'N/A', value: 0 };
    let bestPerformer = { name: 'N/A', change: -Infinity }; // Corrected initialization

    if (portfolio.length === 0) {
        portfolioContainer.innerHTML = '<p style="opacity: 0.7; text-align: center;">Your portfolio is empty.</p>';
         portfolioValueElem.textContent = formatBeli(0);
         portfolioDailyChangeElem.textContent = '--%';
         portfolioDailyChangeElem.className = 'stat-value';
         portfolioTotalPiratesElem.textContent = 0;
         portfolioHighestPosElem.textContent = 'N/A';
         portfolioBestPerfElem.textContent = 'N/A';
         portfolioBestPerfElem.className = 'stat-value';
        return;
    }

    const frag = document.createDocumentFragment();
    portfolio.forEach(item => {
        const character = characters.find(c => c.id === item.id);
        if (!character) return; // Skip if character data is missing

        const positionValue = character.price * item.shares;
        totalPortfolioValue += positionValue;

        // Corrected totalChangeValue calculation
        totalChangeValue += (character.change / 100) * (character.price / (1 + (character.change / 100))) * item.shares;


        if (positionValue > highestValuePosition.value) {
            highestValuePosition = { name: character.name.split(' ')[0], value: positionValue };
        }

        if (character.change > bestPerformer.change) {
            bestPerformer = { name: character.name.split(' ')[0], change: character.change };
        }

        const changeClass = character.change >= 0 ? 'text-positive' : 'text-negative';

        const row = createElem('div', 'portfolio-item');
        row.innerHTML = `
            <div class="portfolio-stock">
                <div class="portfolio-stock-icon">${character.icon}</div>
                <div class="portfolio-stock-info">
                    <div class="portfolio-stock-name">${character.name}</div>
                    <div class="portfolio-stock-shares">${item.shares} shares</div>
                </div>
            </div>
            <div class="stock-meta">
                 <span class="stock-faction">${character.faction}</span>
                 <span class="stock-volume">Volume: ${character.volume.toLocaleString()}</span>
            </div>
            <div class="portfolio-stock-details">
                <div class="portfolio-stock-value">${formatBeli(positionValue)}</div>
                <div class="portfolio-stock-change ${changeClass}">${formatChangeText(character.change)}</div>
            </div>
        `;
        frag.appendChild(row);
    });

     portfolioContainer.appendChild(frag);


    portfolioValueElem.textContent = formatBeli(totalPortfolioValue);

    // Calculate average daily change based on total change value
    const averagePortfolioChange = totalPortfolioValue > 0 ?
        (totalChangeValue / (totalPortfolioValue - totalChangeValue)) * 100 : 0;


    portfolioDailyChangeElem.textContent = formatChangeText(averagePortfolioChange);
    portfolioDailyChangeElem.className = `stat-value ${averagePortfolioChange >= 0 ? 'text-positive' : 'text-negative'}`;
    portfolioTotalPiratesElem.textContent = portfolio.length;
    portfolioHighestPosElem.textContent = highestValuePosition.name;
    portfolioBestPerfElem.textContent = bestPerformer.name !== 'N/A' ?
        `${bestPerformer.name} ${formatChangeText(bestPerformer.change)}` : 'N/A';
    portfolioBestPerfElem.className = `stat-value ${bestPerformer.change >= 0 ? 'text-positive' : 'text-negative'}`;
}

// --- News Ticker
function initNews() {
    // Using the exact news list provided by the user
    const staticNews = [
        `<span class="news-item breaking">BREAKING: Luffy's stock surges 15% after Gear 5 revelation!</span>`,
        `<span class="news-item positive">Zoro defeats King, power level up by 12.3%</span>`,
        `<span class="news-item negative">Kaido stock drops 8% following defeat in Wano</span>`,
        `<span class="news-item">New Yonko rankings announced by World Government</span>`,
        `<span class="news-item positive">Blackbeard acquires new Devil Fruit ability! Stock up 9.5%</span>`,
        `<span class="news-item">Shanks makes his move! Trading volume at all-time high</span>`,
        `<span class="news-item negative">Big Mom alliance with Kaido dissolved! Stocks affected</span>`,
        `<span class="news-item">Revolutionary Army gaining momentum! Dragon's power index rises</span>`
    ];

    // Duplicate news content for continuous scroll
    tickerContent.innerHTML = staticNews.join('') + staticNews.join('');
}


// --- Actions

function showQuantityModal(characterId, action) {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const modal = document.createElement('div');
    modal.className = 'quantity-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${action === 'buy' ? 'Buy' : 'Sell'} ${character.name}</h3>
            <p>Current Price: ${formatBeli(character.price)}</p>
            <input type="number" id="quantity-input" min="1" value="1">
            <div class="modal-actions">
                <button class="btn btn-cancel">Cancel</button>
                <button class="btn btn-confirm">${action === 'buy' ? 'Buy' : 'Sell'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-confirm').addEventListener('click', () => {
        const quantity = parseInt(modal.querySelector('#quantity-input').value) || 1;
        if (action === 'buy') {
            buyStock(characterId, quantity);
        } else {
            sellStock(characterId, quantity);
        }
        modal.remove();
    });
}


function buyStock(characterId, quantity = 1) {
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }

    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const existingHolding = portfolio.find(item => item.id === characterId);
    if (existingHolding) {
        existingHolding.shares += quantity;
    } else {
        portfolio.push({ id: characterId, shares: quantity });
    }

    showNotification(`Bought ${quantity} share(s) of ${character.name}!`, 'success');
    renderPortfolio();
    savePortfolio();
}


function sellStock(characterId, quantity = 1) {
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }

    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const existingHolding = portfolio.find(item => item.id === characterId);
    if (!existingHolding || existingHolding.shares < quantity) {
        showNotification(`Not enough shares of ${character.name} to sell!`, 'error');
        return;
    }

    existingHolding.shares -= quantity;
    if (existingHolding.shares <= 0) {
        portfolio = portfolio.filter(item => item.id !== characterId);
    }

    showNotification(`Sold ${quantity} share(s) of ${character.name}!`, 'success');
    renderPortfolio();
    savePortfolio();
}


// Add search and sort functionality:
function applySearchAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    let filtered = characters;
    
    // Apply search
    if (searchTerm) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.symbol.toLowerCase().includes(searchTerm) ||
            c.faction.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sort
    switch(sortValue) {
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'change-desc':
            filtered.sort((a, b) => b.change - a.change);
            break;
        case 'change-asc':
            filtered.sort((a, b) => a.change - b.change);
            break;
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            filtered.sort((a, b) => b.price - a.price);
    }
    
    renderStocks(filtered);
}

// Event listeners for search and sort
searchInput.addEventListener('input', applySearchAndSort);
sortSelect.addEventListener('change', applySearchAndSort);

// Simulation
function simulateMarketChanges() {
    const today = new Date().toISOString().split('T')[0]; // Corrected date format

    characters.forEach(c => {
        if (typeof c.price !== 'number' || typeof c.volatility !== 'number') return;

        const changePct = (Math.random() * 2 - 1) * c.volatility * 100; // ±volatility%
        c.change = parseFloat(changePct.toFixed(1));

        // Calculate the new price based on the change percentage
        const oldPrice = c.price;
        let newPrice = oldPrice * (1 + changePct / 100);

        // Ensure the new price does not fall below the minimum price
        newPrice = Math.max(MIN_PRICE, newPrice);
        c.price = Math.round(newPrice);


        // Update history
        if (Array.isArray(c.history)) {
            if (c.history.length >= 30) {
                c.history.shift(); // keep 30-day history
            }
            c.history.push({ date: today, price: c.price });
        }
    });

    renderStocks();
    renderPortfolio();
}

// --- Initialization
async function initializeApp() {
    console.log("Initializing One Piece Power Exchange...");

    // Show loading state
    if(stocksContainer) {
        stocksContainer.innerHTML = '<p>Loading character data...</p>';
        searchInput.disabled = true;
        sortSelect.disabled = true;
    }
    if(portfolioContainer) portfolioContainer.innerHTML = '<p style="text-align:center; opacity:0.7;">Loading portfolio...</p>';

    // Load character data
    try {
        characters = await loadCharacterData();
        console.log("Character data loaded.", characters);
        
        // Enable controls after load
        if(searchInput) searchInput.disabled = false;
        if(sortSelect) sortSelect.disabled = false;
    } catch (error) {
        console.error("Failed to load character data:", error);
        stocksContainer.innerHTML = `
            <p style="text-align: center; opacity: 0.7;">Failed to load stock data.</p>
            <div style="text-align: center; margin-top: 1rem;">
                <button class="btn" onclick="initializeApp()">Retry</button>
            </div>
        `;
        portfolioContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">Failed to load portfolio data.</p>';
        return;
    }

    // Initialize the app with loaded data
    initNews();
    renderFactionFilters();
    loadPortfolioFromStorage();
    renderPortfolio();
    renderStocks();
    initStockCardClicks();

    // Start market simulation
    setInterval(simulateMarketChanges, 10000);
    console.log("App Initialized. Market simulation running.");
}


// Start with loading screen animation
document.addEventListener('DOMContentLoaded', () => {
    // Hide the main content initially
    // document.body.style.overflow = 'hidden'; // Handled in animateLoadingScreen

    // Start loading animation
    animateLoadingScreen();

    // The call to initializeApp is now within the animateLoadingScreen completion
});

// Export functions if needed for other modules (though combined here)
// export { stockData, loadCharacterData, generatePriceHistory, updateMarket, buyStock, sellStock, initializeApp };
