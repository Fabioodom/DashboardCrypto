window.AuthGuard = {
    requireAuth(callback) {
        if (!AuthService.isAuthenticated()) {
            Router.navigate(VIEW_NAMES.LOGIN);
            return false;
        }
        
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    },

    requireGuest(callback) {
        if (AuthService.isAuthenticated()) {
            Router.navigate(VIEW_NAMES.DASHBOARD);
            return false;
        }
        
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    },

    checkAuth() {
        return AuthService.isAuthenticated();
    },

    getUser() {
        return AuthService.getCurrentUser();
    }
};