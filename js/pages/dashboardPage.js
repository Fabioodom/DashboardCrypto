window.DashboardPage = {
    container: null,
    loader: null,
    errorContainer: null,
    isLoading: false,

    init() {
        this.cacheElements();
    },

    cacheElements() {
        this.container = DOM.$('#crypto-grid');
        this.loader = DOM.$('#dashboard-loader');
        this.errorContainer = DOM.$('#error-container');
        this.totalCoinsEl = DOM.$('#total-coins');
        this.searchCountEl = DOM.$('#search-count');
        this.favoritesCountEl = DOM.$('#favorites-count');
    },

    async loadCoins(isSearch = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoader();
        this.hideError();

        const filters = Store.getState().filters;
        
        const params = {
            order: filters.sort,
            per_page: filters.limit,
            page: 1
        };

        try {
            let coins;
            
            if (filters.search && filters.search.length >= 2 && isSearch) {
                const searchResults = await CryptoService.searchCoins(filters.search);
                const coinIds = searchResults.map(c => c.id).join(',');
                
                if (coinIds) {
                    params.ids = coinIds;
                }
            }
            
            coins = await CryptoService.fetchCoins(params);
            
            Store.updateCoins(coins);
            this.renderCoins(coins);
            this.updateStats();
            
            SignalsPanel.show();
            SignalsPanel.updateWithCoins(coins);
            AlertPanel.show();
            
        } catch (error) {
            this.showError(ErrorHandler.getUserMessage(ErrorHandler.handle(error, 'dashboard')));
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    },

    renderCoins(coins) {
        DOM.clearElement(this.container);
        
        if (!coins || coins.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>No se encontraron criptomonedas.</p>
                    <p>Intenta con otros filtros.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        
        coins.forEach(coin => {
            const card = CryptoCard.create(coin);
            fragment.appendChild(card);
        });

        this.container.appendChild(fragment);
    },

    showLoader() {
        DOM.show(this.loader);
    },

    hideLoader() {
        DOM.hide(this.loader);
    },

    showError(message) {
        this.errorContainer.textContent = message;
        DOM.show(this.errorContainer);
    },

    hideError() {
        DOM.hide(this.errorContainer);
    },

    updateStats() {
        const state = Store.getState();
        
        this.totalCoinsEl.textContent = state.coins.length || '-';
        this.searchCountEl.textContent = Metrics.get('searches');
        this.favoritesCountEl.textContent = Favorites.getAll().length;
    },

    show() {
        DOM.$('#dashboard-view').classList.remove('hidden');
        SearchBar.init();
        SignalsPanel.init();
        AlertPanel.init();
        this.loadCoins();
    },

    hide() {
        DOM.$('#dashboard-view').classList.add('hidden');
        SignalsPanel.hide();
        AlertPanel.hide();
    }
};