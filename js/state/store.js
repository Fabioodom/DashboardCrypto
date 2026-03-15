window.Store = {
    _state: {
        currentView: VIEW_NAMES.LOGIN,
        coins: [],
        favorites: [],
        searchResults: [],
        currentCoin: null,
        isLoading: false,
        error: null,
        filters: {
            search: '',
            sort: SORT_OPTIONS.MARKET_CAP_DESC,
            limit: 25
        }
    },

    _listeners: new Map(),

    getState() {
        return { ...this._state };
    },

    setState(updates) {
        const prevState = { ...this._state };
        this._state = { ...this._state, ...updates };
        this._notify(prevState);
    },

    subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);
        
        return () => {
            this._listeners.get(key)?.delete(callback);
        };
    },

    _notify(prevState) {
        for (const [key, callbacks] of this._listeners.entries()) {
            if (this._state[key] !== prevState[key]) {
                callbacks.forEach(cb => cb(this._state[key], prevState[key]));
            }
        }
    },

    updateCoins(coins) {
        this.setState({ coins, error: null });
    },

    setLoading(isLoading) {
        this.setState({ isLoading });
    },

    setError(error) {
        this.setState({ error, isLoading: false });
    },

    clearError() {
        this.setState({ error: null });
    },

    updateFilters(filters) {
        this.setState({
            filters: { ...this._state.filters, ...filters }
        });
    },

    setCurrentCoin(coin) {
        this.setState({ currentCoin: coin });
    },

    clearCurrentCoin() {
        this.setState({ currentCoin: null });
    },

    clear() {
        this._state = {
            currentView: VIEW_NAMES.LOGIN,
            coins: [],
            favorites: [],
            searchResults: [],
            currentCoin: null,
            isLoading: false,
            error: null,
            filters: {
                search: '',
                sort: SORT_OPTIONS.MARKET_CAP_DESC,
                limit: 25
            }
        };
    }
};