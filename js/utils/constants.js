const APP_CONFIG = {
    APP_NAME: 'CryptoVision Dashboard',
    VERSION: '1.0.0',
    API_BASE_URL: 'https://api.coingecko.com/api/v3',
    CACHE_DURATION: 5 * 60 * 1000,
    RATE_LIMIT_CALLS: 10,
    RATE_LIMIT_WINDOW: 60 * 1000,
    DEMO_CREDENTIALS: {
        username: 'admin',
        password: 'demo123'
    },
    STORAGE_KEYS: {
        AUTH: 'cv_auth',
        FAVORITES: 'cv_favorites',
        METRICS: 'cv_metrics',
        CACHE: 'cv_cache',
        ALERTS: 'cv_alerts',
        MARKET_SIGNALS_HISTORY: 'cv_market_signals_history',
        PORTFOLIO_HISTORY: 'cv_portfolio_history',
        ASSISTANT_HISTORY: 'cv_assistant_history'
    }
};

const API_ENDPOINTS = {
    COINS: '/coins/markets',
    COIN_DETAIL: '/coins',
    SEARCH: '/search'
};

const SORT_OPTIONS = {
    MARKET_CAP_DESC: 'market_cap_desc',
    MARKET_CAP_ASC: 'market_cap_asc',
    PRICE_DESC: 'price_desc',
    PRICE_ASC: 'price_asc',
    CHANGE_DESC: 'change_desc',
    CHANGE_ASC: 'change_asc'
};

const VIEW_NAMES = {
    LOGIN: 'login',
    DASHBOARD: 'dashboard',
    DETAIL: 'detail',
    FAVORITES: 'favorites'
};

window.APP_CONFIG = APP_CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.SORT_OPTIONS = SORT_OPTIONS;
window.VIEW_NAMES = VIEW_NAMES;

Object.freeze(APP_CONFIG);
Object.freeze(API_ENDPOINTS);
Object.freeze(SORT_OPTIONS);
Object.freeze(VIEW_NAMES);