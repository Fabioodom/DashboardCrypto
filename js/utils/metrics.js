window.Metrics = {
    _metrics: null,
    _startTime: null,

    init() {
        this._metrics = Storage.get(APP_CONFIG.STORAGE_KEYS.METRICS, {
            searches: 0,
            details_viewed: 0,
            favorites_added: 0,
            errors: 0,
            api_calls: 0,
            session_start: Date.now()
        });
        this._startTime = performance.now();
        this._log('Metrics initialized');
    },

    increment(key) {
        if (!this._metrics) this.init();
        
        if (this._metrics.hasOwnProperty(key)) {
            this._metrics[key]++;
            this._save();
        }
        this._log(`Metric increment: ${key}`);
    },

    _save() {
        if (this._metrics) {
            Storage.set(APP_CONFIG.STORAGE_KEYS.METRICS, this._metrics);
        }
    },

    get(key) {
        if (!this._metrics) this.init();
        return this._metrics ? this._metrics[key] : 0;
    },

    getAll() {
        if (!this._metrics) this.init();
        return { ...this._metrics };
    },

    getPageLoadTime() {
        return this._startTime ? (performance.now() - this._startTime).toFixed(2) : 0;
    },

    reset() {
        this._metrics = {
            searches: 0,
            details_viewed: 0,
            favorites_added: 0,
            errors: 0,
            api_calls: 0,
            session_start: Date.now()
        };
        this._save();
        this._log('Metrics reset');
    },

    logError(error) {
        this.increment('errors');
        this._log(`Error logged: ${error.message || error}`);
    },

    _log(message) {
        if (typeof console !== 'undefined' && APP_CONFIG.ENV !== 'production') {
            console.log(`[Metrics] ${message}`);
        }
    },

    getReport() {
        return {
            searches: this.get('searches'),
            detailsViewed: this.get('details_viewed'),
            favoritesAdded: this.get('favorites_added'),
            errors: this.get('errors'),
            apiCalls: this.get('api_calls'),
            pageLoadTime: this.getPageLoadTime() + 'ms',
            sessionDuration: this._formatDuration(Date.now() - this._metrics?.session_start)
        };
    },

    _formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
};