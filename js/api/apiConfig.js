window.ApiConfig = {
    baseUrl: APP_CONFIG.API_BASE_URL,
    
    endpoints: {
        coins: '/coins/markets',
        coinDetail: (id) => `/coins/${id}`,
        search: '/search'
    },

    defaultParams: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 25,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
    },

    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },

    timeout: 10000,

    getUrl(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        const mergedParams = { ...this.defaultParams, ...params };
        
        Object.entries(mergedParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
        
        return url.toString();
    },

    getDetailUrl(coinId, params = {}) {
        const url = new URL(this.baseUrl + this.endpoints.coinDetail(coinId));
        const defaultParams = {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false
        };
        
        Object.entries({ ...defaultParams, ...params }).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        return url.toString();
    }
};