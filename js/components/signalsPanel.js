window.SignalsPanel = {
    container: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.createPanel();
        this.isInitialized = true;
    },

    createPanel() {
        const existing = document.getElementById('signals-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'signals-panel';
        panel.className = 'agent-panel';
        panel.innerHTML = `
            <div class="agent-panel-header">
                <div class="agent-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Señales del Mercado
                </div>
                <div class="agent-status">
                    <span class="agent-status-dot" id="signal-status-dot"></span>
                    <span id="signal-status-text">Analizando</span>
                </div>
            </div>
            <div class="agent-panel-body">
                <div class="market-summary" id="market-summary-content">
                    <div class="market-summary-text" id="signal-message">
                        Cargando análisis del mercado...
                    </div>
                    <div class="market-stats-row" id="signal-stats"></div>
                </div>
                <div class="signals-grid" id="signals-grid">
                    <div class="signal-card bullish" id="signal-bullish" style="display: none;">
                        <div class="signal-header">
                            <span class="signal-badge">📈 Alcistas</span>
                            <span class="signal-change positive" id="bullish-count">0</span>
                        </div>
                        <div class="signal-coins-list" id="bullish-list"></div>
                    </div>
                    <div class="signal-card bearish" id="signal-bearish" style="display: none;">
                        <div class="signal-header">
                            <span class="signal-badge">📉 Bajistas</span>
                            <span class="signal-change negative" id="bearish-count">0</span>
                        </div>
                        <div class="signal-coins-list" id="bearish-list"></div>
                    </div>
                    <div class="signal-card volatile" id="signal-volatile" style="display: none;">
                        <div class="signal-header">
                            <span class="signal-badge">⚡ Volátiles</span>
                            <span class="signal-change" id="volatile-count">0</span>
                        </div>
                        <div class="signal-coins-list" id="volatile-list"></div>
                    </div>
                </div>
            </div>
        `;

        const dashboardContainer = document.querySelector('#dashboard-view .dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.insertBefore(panel, dashboardContainer.firstChild);
        }

        this.container = document.getElementById('signals-panel');

        document.querySelectorAll('.signal-coins-list').forEach(list => {
            list.addEventListener('click', (e) => {
                const item = e.target.closest('.signal-coin-item');
                if (item && item.dataset.coinId) {
                    const coins = Store.getState().coins;
                    const coin = coins.find(c => c.id === item.dataset.coinId);
                    if (coin) {
                        Store.setCurrentCoin(coin);
                        Router.navigate(VIEW_NAMES.DETAIL);
                    }
                }
            });
        });
    },

    updateWithCoins(coins) {
        if (!coins || coins.length === 0) return;

        const thresholds = {
            bullish: 2,
            bearish: -2,
            volatile: 5
        };

        const signals = {
            bullish: [],
            bearish: [],
            volatile: []
        };

        const avgVolume = coins.reduce((sum, c) => sum + (c.total_volume || 0), 0) / coins.length;

        coins.forEach(coin => {
            const change = coin.price_change_percentage_24h || 0;

            if (change > thresholds.bullish) {
                signals.bullish.push({
                    coinId: coin.id,
                    symbol: coin.symbol?.toUpperCase(),
                    name: coin.name,
                    change: change,
                    image: coin.image
                });
            } else if (change < thresholds.bearish) {
                signals.bearish.push({
                    coinId: coin.id,
                    symbol: coin.symbol?.toUpperCase(),
                    name: coin.name,
                    change: change,
                    image: coin.image
                });
            }

            if (Math.abs(change) > thresholds.volatile) {
                signals.volatile.push({
                    coinId: coin.id,
                    symbol: coin.symbol?.toUpperCase(),
                    name: coin.name,
                    change: change,
                    image: coin.image
                });
            }
        });

        signals.bullish.sort((a, b) => b.change - a.change);
        signals.bearish.sort((a, b) => a.change - b.change);
        signals.volatile.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        this.renderSignals(signals, coins);
    },

    renderSignals(signals, coins) {
        const avgChange = coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length;
        
        const bullishCount = signals.bullish.length;
        const bearishCount = signals.bearish.length;
        const volatileCount = signals.volatile.length;

        const messageEl = document.getElementById('signal-message');
        if (messageEl) {
            let sentiment = 'neutral';
            if (bullishCount > bearishCount * 1.5) sentiment = 'alcista';
            else if (bearishCount > bullishCount * 1.5) sentiment = 'bajista';
            
            messageEl.textContent = `Mercado ${sentiment}. Cambio promedio: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%`;
        }

        const statsEl = document.getElementById('signal-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="market-stat">
                    <span>Monedas:</span>
                    <span class="market-stat-value">${coins.length}</span>
                </div>
                <div class="market-stat">
                    <span>Subiendo:</span>
                    <span class="market-stat-value text-positive">${bullishCount}</span>
                </div>
                <div class="market-stat">
                    <span>Bajando:</span>
                    <span class="market-stat-value text-negative">${bearishCount}</span>
                </div>
            `;
        }

        const statusDot = document.getElementById('signal-status-dot');
        const statusText = document.getElementById('signal-status-text');
        if (statusDot) statusDot.style.background = 'var(--color-positive)';
        if (statusText) statusText.textContent = 'Activo';

        this.renderList('bullish-list', signals.bullish.slice(0, 5), 'signal-bullish', 'bullish-count');
        this.renderList('bearish-list', signals.bearish.slice(0, 5), 'signal-bearish', 'bearish-count');
        this.renderList('volatile-list', signals.volatile.slice(0, 5), 'signal-volatile', 'volatile-count');
    },

    renderList(listId, items, cardId, countId) {
        const list = document.getElementById(listId);
        const card = document.getElementById(cardId);
        const count = document.getElementById(countId);

        if (!list || !card || !count) return;

        if (items.length === 0) {
            card.style.display = 'none';
            return;
        }

        card.style.display = 'block';
        count.textContent = items.length;

        list.innerHTML = items.map(item => `
            <div class="signal-coin-item" data-coin-id="${item.coinId}">
                <div class="coin-info">
                    <img src="${item.image || ''}" alt="${item.symbol}">
                    <span class="coin-symbol">${item.symbol}</span>
                    <span class="coin-name">${item.name}</span>
                </div>
                <span class="coin-change ${item.change > 0 ? 'positive' : 'negative'}">
                    ${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}%
                </span>
            </div>
        `).join('');
    },

    show() {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    },

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
};
