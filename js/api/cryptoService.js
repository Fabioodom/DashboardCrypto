window.CryptoService = {
    _cache: new Map(),
    _cacheTimeout: APP_CONFIG.CACHE_DURATION,

    async fetchCoins(params = {}) {
        const cacheKey = JSON.stringify(params);
        
        if (this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this._cacheTimeout) {
                Metrics.increment('api_calls');
                return cached.data;
            }
        }

        if (!RateLimiter.canMakeRequest()) {
            const waitTime = RateLimiter.getWaitTime();
            throw new Error(`Rate limit. Espera ${waitTime} segundos`);
        }

        const url = ApiConfig.getUrl(ApiConfig.endpoints.coins, params);
        
        try {
            const response = await this._fetch(url);
            Metrics.increment('api_calls');
            
            this._cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });
            
            return response;
        } catch (error) {
            throw ErrorHandler.handle(error, 'fetchCoins');
        }
    },

    async fetchCoinDetail(coinId) {
        if (!Validators.isValidCoinId(coinId)) {
            throw new Error('ID de moneda inválido');
        }

        const cacheKey = `detail_${coinId}`;
        
        if (this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this._cacheTimeout) {
                Metrics.increment('api_calls');
                Metrics.increment('details_viewed');
                return cached.data;
            }
        }

        if (!RateLimiter.canMakeRequest()) {
            const waitTime = RateLimiter.getWaitTime();
            throw new Error(`Rate limit. Espera ${waitTime} segundos`);
        }

        const url = ApiConfig.getDetailUrl(coinId);

        try {
            const response = await this._fetch(url);
            Metrics.increment('api_calls');
            Metrics.increment('details_viewed');
            
            this._cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });
            
            return response;
        } catch (error) {
            throw ErrorHandler.handle(error, 'fetchCoinDetail');
        }
    },

    async searchCoins(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        Metrics.increment('searches');

        const cacheKey = `search_${query.toLowerCase()}`;
        
        if (this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this._cacheTimeout) {
                return cached.data;
            }
        }

        if (!RateLimiter.canMakeRequest()) {
            const waitTime = RateLimiter.getWaitTime();
            throw new Error(`Rate limit. Espera ${waitTime} segundos`);
        }

        const url = `${ApiConfig.baseUrl}${ApiConfig.endpoints.search}?query=${encodeURIComponent(query)}`;

        try {
            const response = await this._fetch(url);
            
            const result = response.coins?.slice(0, 10) || [];
            
            this._cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
        } catch (error) {
            throw ErrorHandler.handle(error, 'searchCoins');
        }
    },

    async _fetch(url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ApiConfig.timeout);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: ApiConfig.headers,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeout);
            
            if (error.name === 'AbortError') {
                const err = new Error('Tiempo de espera agotado');
                err.name = 'Timeout';
                throw err;
            }
            
            throw error;
        }
    },

    clearCache() {
        this._cache.clear();
    },

    getCachedCoins() {
        const coins = [];
        for (const [key, value] of this._cache.entries()) {
            if (key.startsWith('{') && Date.now() - value.timestamp < this._cacheTimeout) {
                try {
                    const params = JSON.parse(key);
                    if (params.vs_currency === 'usd' && params.order) {
                        coins.push(...value.data);
                    }
                } catch (e) {}
            }
        }
        return coins;
    }
};