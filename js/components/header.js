window.Header = {
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateAuthState();
    },

    cacheElements() {
        this.navToggle = DOM.$('.nav-toggle');
        this.navMenu = DOM.$('#nav-menu');
        this.navLogin = DOM.$('#nav-login');
        this.navUser = DOM.$('#nav-user');
        this.userNameDisplay = DOM.$('#user-name-display');
        this.logoutBtn = DOM.$('#logout-btn');
    },

    bindEvents() {
        DOM.on(this.navToggle, 'click', () => this.toggleMenu());
        
        DOM.delegate(document, '.nav-link', 'click', (e, target) => {
            const page = target.dataset.page;
            if (page) {
                Router.navigate(page);
                this.closeMenu();
            }
        });

        DOM.on(this.logoutBtn, 'click', () => this.logout());
    },

    toggleMenu() {
        const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isExpanded);
        DOM.toggleClass(this.navMenu, 'active');
    },

    closeMenu() {
        this.navToggle.setAttribute('aria-expanded', 'false');
        DOM.removeClass(this.navMenu, 'active');
    },

    updateAuthState() {
        const user = AuthGuard.getUser();
        
        if (user) {
            DOM.hide(this.navLogin);
            DOM.show(this.navUser);
            this.userNameDisplay.textContent = user.username;
        } else {
            DOM.show(this.navLogin);
            DOM.hide(this.navUser);
        }
    },

    logout() {
        AuthService.logout();
        Router.navigate(VIEW_NAMES.LOGIN);
        Toast.show('Sesión cerrada correctamente', 'success');
    }
};