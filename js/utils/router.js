window.Router = {
    _routes: new Map(),
    _currentView: null,

    init() {
        this.setupRoutes();
        this.handleRoute();
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigate(page);
            }
        });
    },

    setupRoutes() {
        this._routes.set(VIEW_NAMES.LOGIN, {
            page: VIEW_NAMES.LOGIN,
            requiresAuth: false,
            show: () => LoginPage.show(),
            hide: () => LoginPage.hide()
        });

        this._routes.set(VIEW_NAMES.DASHBOARD, {
            page: VIEW_NAMES.DASHBOARD,
            requiresAuth: true,
            show: () => DashboardPage.show(),
            hide: () => DashboardPage.hide()
        });

        this._routes.set(VIEW_NAMES.DETAIL, {
            page: VIEW_NAMES.DETAIL,
            requiresAuth: true,
            show: (params) => {
                if (params?.coinId) {
                    DetailPage.load(params.coinId);
                }
                DetailPage.show();
            },
            hide: () => DetailPage.hide()
        });

        this._routes.set(VIEW_NAMES.FAVORITES, {
            page: VIEW_NAMES.FAVORITES,
            requiresAuth: true,
            show: () => FavoritesPage.show(),
            hide: () => FavoritesPage.hide()
        });
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || VIEW_NAMES.LOGIN;
        const [page, params] = hash.split('?');
        
        const routeParams = {};
        if (params) {
            params.split('&').forEach(param => {
                const [key, value] = param.split('=');
                routeParams[key] = value;
            });
        }

        this.navigate(page, routeParams, true);
    },

    navigate(page, params = {}, replace = false) {
        if (!this._routes.has(page)) {
            console.warn(`Route not found: ${page}`);
            page = VIEW_NAMES.LOGIN;
        }

        const route = this._routes.get(page);
        
        if (route.requiresAuth && !AuthGuard.checkAuth()) {
            this.navigate(VIEW_NAMES.LOGIN);
            return;
        }

        if (!route.requiresAuth && page !== VIEW_NAMES.LOGIN && AuthGuard.checkAuth()) {
            this.navigate(VIEW_NAMES.DASHBOARD);
            return;
        }

        if (this._currentView && this._currentView !== page) {
            const prevRoute = this._routes.get(this._currentView);
            if (prevRoute) prevRoute.hide();
        }

        this._currentView = page;
        route.show(params);

        const url = params && Object.keys(params).length > 0
            ? `#${page}?${new URLSearchParams(params).toString()}`
            : `#${page}`;

        if (replace) {
            history.replaceState(null, '', url);
        } else {
            history.pushState(null, '', url);
        }
    },

    getCurrentView() {
        return this._currentView;
    }
};