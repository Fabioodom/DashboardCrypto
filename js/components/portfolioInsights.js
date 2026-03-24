window.PortfolioInsights = {
    container: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.createPanel();
        this.isInitialized = true;
    },

    createPanel() {
        const existing = document.getElementById('portfolio-insights');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'portfolio-insights';
        panel.className = 'agent-panel';
        panel.innerHTML = `
            <div class="agent-panel-header">
                <div class="agent-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Resumen Inteligente
                </div>
            </div>
            <div class="agent-panel-body">
                <div class="portfolio-summary-grid" id="portfolio-stats-grid"></div>
                <div class="portfolio-insights" id="insights-list"></div>
            </div>
        `;

        const favoritesContainer = document.querySelector('#favorites-view .favorites-container');
        if (favoritesContainer) {
            const title = favoritesContainer.querySelector('.page-title');
            if (title && title.nextSibling) {
                favoritesContainer.insertBefore(panel, title.nextSibling);
            } else {
                favoritesContainer.insertBefore(panel, favoritesContainer.firstChild);
            }
        }

        this.container = document.getElementById('portfolio-insights');
    },

    update(favoriteCoins) {
        if (!favoriteCoins || favoriteCoins.length === 0) {
            this.showEmpty();
            return;
        }

        const stats = this.analyzeFavorites(favoriteCoins);
        this.renderStats(stats);
        this.renderInsights(stats);
    },

    analyzeFavorites(coins) {
        const avgChange = coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length;
        
        const sorted = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];

        const positive = coins.filter(c => (c.price_change_percentage_24h || 0) > 0).length;
        const negative = coins.length - positive;

        const insights = [];

        if (best && best.price_change_percentage_24h > 3) {
            insights.push({
                icon: '📈',
                type: 'positive',
                text: `${best.name} sube ${best.price_change_percentage_24h.toFixed(1)}%. ¡Buen momento!`
            });
        }

        if (worst && worst.price_change_percentage_24h < -3) {
            insights.push({
                icon: '📉',
                type: 'warning',
                text: `${worst.name} cae ${Math.abs(worst.price_change_percentage_24h).toFixed(1)}%. Vigila este activo.`
            });
        }

        if (positive > negative) {
            insights.push({
                icon: '✅',
                type: 'positive',
                text: `${positive} favoritos subiendo vs ${negative} bajando.`
            });
        } else if (negative > positive) {
            insights.push({
                icon: '⚠️',
                type: 'warning',
                text: `${negative} favoritos bajando vs ${positive} subiendo.`
            });
        }

        return {
            total: coins.length,
            avgChange,
            best: best,
            worst: worst,
            positive,
            negative,
            insights
        };
    },

    renderStats(stats) {
        const grid = document.getElementById('portfolio-stats-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="portfolio-stat-card">
                <div class="portfolio-stat-label">Favoritos</div>
                <div class="portfolio-stat-value">${stats.total}</div>
            </div>
            <div class="portfolio-stat-card">
                <div class="portfolio-stat-label">Promedio</div>
                <div class="portfolio-stat-value ${stats.avgChange >= 0 ? 'positive' : 'negative'}">
                    ${stats.avgChange >= 0 ? '+' : ''}${stats.avgChange.toFixed(2)}%
                </div>
            </div>
            <div class="portfolio-stat-card">
                <div class="portfolio-stat-label">Mejor</div>
                <div class="portfolio-stat-value positive">
                    ${stats.best ? stats.best.symbol?.toUpperCase() : '-'}
                </div>
            </div>
            <div class="portfolio-stat-card">
                <div class="portfolio-stat-label">Peor</div>
                <div class="portfolio-stat-value negative">
                    ${stats.worst ? stats.worst.symbol?.toUpperCase() : '-'}
                </div>
            </div>
        `;
    },

    renderInsights(stats) {
        const list = document.getElementById('insights-list');
        if (!list) return;

        if (stats.insights.length === 0) {
            list.innerHTML = '<div class="alert-empty">Tu portfolio está estable.</div>';
            return;
        }

        list.innerHTML = stats.insights.map(insight => `
            <div class="insight-item insight-${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');
    },

    showEmpty() {
        const grid = document.getElementById('portfolio-stats-grid');
        const list = document.getElementById('insights-list');

        if (grid) {
            grid.innerHTML = `
                <div class="portfolio-stat-card" style="grid-column: 1 / -1;">
                    <div class="portfolio-stat-label">Favoritos</div>
                    <div class="portfolio-stat-value">0</div>
                </div>
            `;
        }

        if (list) {
            list.innerHTML = '<div class="alert-empty">Añade favoritos para ver el análisis inteligente.</div>';
        }
    },

    show(favoriteCoins) {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.container) {
            this.container.classList.remove('hidden');
        }
        this.update(favoriteCoins);
    },

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
};
