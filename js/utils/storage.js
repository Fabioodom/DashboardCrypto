window.Storage = {
    _getStorage() {
        return typeof localStorage !== 'undefined' ? localStorage : null;
    },

    set(key, value) {
        try {
            const storage = this._getStorage();
            if (!storage) return false;
            
            const data = JSON.stringify(value);
            storage.setItem(key, data);
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const storage = this._getStorage();
            if (!storage) return defaultValue;
            
            const data = storage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            const storage = this._getStorage();
            if (!storage) return false;
            
            storage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    clear() {
        try {
            const storage = this._getStorage();
            if (!storage) return false;
            
            storage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },

    has(key) {
        const storage = this._getStorage();
        return storage ? storage.getItem(key) !== null : false;
    }
};

window.Session = {
    setSession(user) {
        const sessionData = {
            user: { ...user, password: undefined },
            timestamp: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        };
        return Storage.set(APP_CONFIG.STORAGE_KEYS.AUTH, sessionData);
    },

    getSession() {
        const session = Storage.get(APP_CONFIG.STORAGE_KEYS.AUTH);
        if (!session) return null;
        
        if (Date.now() > session.expiresAt) {
            this.clearSession();
            return null;
        }
        
        return session;
    },

    clearSession() {
        return Storage.remove(APP_CONFIG.STORAGE_KEYS.AUTH);
    },

    isAuthenticated() {
        return this.getSession() !== null;
    }
};

window.Favorites = {
    getAll() {
        return Storage.get(APP_CONFIG.STORAGE_KEYS.FAVORITES, []);
    },

    add(coinId) {
        const favorites = this.getAll();
        if (!favorites.includes(coinId)) {
            favorites.push(coinId);
            Storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, favorites);
            Metrics.increment('favorites_added');
            return true;
        }
        return false;
    },

    remove(coinId) {
        let favorites = this.getAll();
        favorites = favorites.filter(id => id !== coinId);
        Storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, favorites);
        return true;
    },

    has(coinId) {
        return this.getAll().includes(coinId);
    },

    clear() {
        Storage.remove(APP_CONFIG.STORAGE_KEYS.FAVORITES);
    }
};