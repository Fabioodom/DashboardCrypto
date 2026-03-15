window.AuthService = {
    async login(username, password, remember = false) {
        const sanitizedUsername = Validators.sanitizeInput(username);
        
        const validation = Validators.validateForm(
            { username: sanitizedUsername, password },
            {
                username: [Validators.required, Validators.username],
                password: [Validators.required, Validators.password]
            }
        );

        if (!validation.valid) {
            const firstError = Object.values(validation.errors)[0];
            throw new Error(firstError);
        }

        await this._simulateDelay();

        const isValid = this._verifyCredentials(sanitizedUsername, password);
        
        if (!isValid) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        const user = {
            username: sanitizedUsername,
            loginTime: Date.now(),
            remember
        };

        Session.setSession(user);
        
        return user;
    },

    _verifyCredentials(username, password) {
        const demo = APP_CONFIG.DEMO_CREDENTIALS;
        return username.toLowerCase() === demo.username && password === demo.password;
    },

    _simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, 500));
    },

    logout() {
        Session.clearSession();
        Store.clear();
    },

    getCurrentUser() {
        const session = Session.getSession();
        return session ? session.user : null;
    },

    isAuthenticated() {
        return Session.isAuthenticated();
    },

    updateLastActivity() {
        const session = Session.getSession();
        if (session) {
            session.lastActivity = Date.now();
            Storage.set(APP_CONFIG.STORAGE_KEYS.AUTH, session);
        }
    }
};