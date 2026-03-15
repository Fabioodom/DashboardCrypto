window.SearchBar = {
    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.searchInput = DOM.$('#search-input');
        this.searchBtn = DOM.$('#search-btn');
        this.sortSelect = DOM.$('#sort-select');
        this.limitSelect = DOM.$('#limit-select');
    },

    bindEvents() {
        DOM.on(this.searchInput, 'input', (e) => this.handleInput(e));
        DOM.on(this.searchInput, 'keydown', (e) => {
            if (e.key === 'Enter') this.search();
        });
        
        DOM.on(this.searchBtn, 'click', () => this.search());
        
        DOM.on(this.sortSelect, 'change', (e) => this.handleSort(e.target.value));
        DOM.on(this.limitSelect, 'change', (e) => this.handleLimit(e.target.value));
    },

    handleInput(e) {
        const value = e.target.value;
        Store.updateFilters({ search: value });
    },

    async search() {
        const query = this.searchInput.value.trim();
        
        Store.updateFilters({ search: query });
        
        if (query.length >= 2) {
            DashboardPage.loadCoins(true);
        } else if (query.length === 0) {
            DashboardPage.loadCoins();
        }
    },

    handleSort(value) {
        Store.updateFilters({ sort: value });
        DashboardPage.loadCoins();
    },

    handleLimit(value) {
        Store.updateFilters({ limit: parseInt(value) });
        DashboardPage.loadCoins();
    },

    clear() {
        this.searchInput.value = '';
        Store.updateFilters({ search: '' });
    },

    getValue() {
        return this.searchInput.value;
    }
};