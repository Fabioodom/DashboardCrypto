window.RateLimiter = {
    _calls: [],
    _maxCalls: APP_CONFIG.RATE_LIMIT_CALLS,
    _windowMs: APP_CONFIG.RATE_LIMIT_WINDOW,
    _enabled: true,

    canMakeRequest() {
        if (!this._enabled) return true;
        
        this._cleanOldCalls();
        return this._calls.length < this._maxCalls;
    },

    waitForSlot() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.canMakeRequest()) {
                    resolve();
                } else {
                    setTimeout(check, 1000);
                }
            };
            check();
        });
    },

    recordCall() {
        if (!this._enabled) return;
        
        this._calls.push(Date.now());
        this._cleanOldCalls();
    },

    _cleanOldCalls() {
        const now = Date.now();
        this._calls = this._calls.filter(time => now - time < this._windowMs);
    },

    getWaitTime() {
        if (this.canMakeRequest()) return 0;
        
        this._cleanOldCalls();
        if (this._calls.length === 0) return 0;
        
        const oldestCall = Math.min(...this._calls);
        const waitTime = this._windowMs - (Date.now() - oldestCall);
        return Math.max(0, Math.ceil(waitTime / 1000));
    },

    reset() {
        this._calls = [];
    },

    setConfig(maxCalls, windowMs) {
        this._maxCalls = maxCalls;
        this._windowMs = windowMs;
    },

    enable() {
        this._enabled = true;
    },

    disable() {
        this._enabled = false;
    },

    getStatus() {
        this._cleanOldCalls();
        return {
            remaining: this._maxCalls - this._calls.length,
            used: this._calls.length,
            total: this._maxCalls,
            waitTime: this.getWaitTime()
        };
    }
};