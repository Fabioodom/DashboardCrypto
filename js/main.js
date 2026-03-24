(function() {
    'use strict';

    console.log('%c CryptoVision Dashboard ', 'background: #58a6ff; color: #0d1117; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.log('%c Inicializando aplicación... ', 'color: #8b949e;');

    Metrics.init();
    Toast.init();
    Header.init();
    LoginPage.init();
    DashboardPage.init();
    DetailPage.init();
    FavoritesPage.init();
    Router.init();
    Agents.init();
    AssistantPanel.init();

    if (AuthGuard.checkAuth()) {
        Router.navigate(VIEW_NAMES.DASHBOARD);
    } else {
        LoginPage.show();
        Router.navigate(VIEW_NAMES.LOGIN);
    }

    console.log('%c Aplicación lista ', 'background: #238636; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('%c Métricas: ' + Metrics.getPageLoadTime() + 'ms ', 'color: #8b949e;');

    window.addEventListener('error', (e) => {
        console.error('[Global Error]', e.error);
        Metrics.logError({ message: e.message, filename: e.filename, lineno: e.lineno });
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('[Unhandled Promise Rejection]', e.reason);
        Metrics.logError({ message: e.reason?.message || 'Unhandled rejection' });
    });

})();