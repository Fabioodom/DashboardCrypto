window.FavoritesPage = {
    container: null,
    emptyState: null,

    init() {
        this.cacheElements();
    },

    cacheElements() {
        this.container = DOM.$('#favorites-grid');
        this.emptyState = DOM.$('#favorites-empty');
    },

    async load() {
        const favoriteIds = Favorites.getAll();
        
        if (favoriteIds.length === 0) {
            this.showEmpty();
            PortfolioInsights.showEmpty();
            return;
        }

        this.showLoader();

        try {
            const coins = await CryptoService.fetchCoins({
                ids: favoriteIds.join(','),
                order: 'market_cap_desc'
            });

            this.renderFavorites(coins);
            PortfolioInsights.show(coins);
        } catch (error) {
            this.showError(ErrorHandler.getUserMessage(ErrorHandler.handle(error, 'favorites')));
        }
    },

    renderFavorites(coins) {
        DOM.clearElement(this.container);
        DOM.hide(this.emptyState);
        
        if (!coins || coins.length === 0) {
            this.showEmpty();
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
        DOM.clearElement(this.container);
        this.container.appendChild(
            DOM.createElement('div', { class: 'loader' }, [
                DOM.createElement('div', { class: 'spinner' }),
                DOM.createElement('span', {}, ['Cargando favoritos...'])
            ])
        );
    },

    showEmpty() {
        DOM.clearElement(this.container);
        DOM.show(this.emptyState);
    },

    showError(message) {
        DOM.clearElement(this.container);
        this.container.innerHTML = `
            <div class="error-container">
                <p>${message}</p>
            </div>
        `;
    },

    show() {
        DOM.$('#favorites-view').classList.remove('hidden');
        PortfolioInsights.init();
        this.load();
    },

    hide() {
        DOM.$('#favorites-view').classList.add('hidden');
        PortfolioInsights.hide();
    }
};