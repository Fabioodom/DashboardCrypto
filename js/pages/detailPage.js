window.DetailPage = {
    container: null,
    backBtn: null,
    coinId: null,

    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.container = DOM.$('#detail-content');
        this.backBtn = DOM.$('#back-btn');
    },

    bindEvents() {
        DOM.on(this.backBtn, 'click', () => Router.navigate(VIEW_NAMES.DASHBOARD));
    },

    async load(coinId) {
        this.coinId = coinId;
        this.showLoader();
        
        try {
            const coin = await CryptoService.fetchCoinDetail(coinId);
            Store.setCurrentCoin(coin);
            this.renderDetail(coin);
        } catch (error) {
            this.showError(ErrorHandler.getUserMessage(ErrorHandler.handle(error, 'detail')));
        }
    },

    renderDetail(coin) {
        const data = coin.market_data || {};
        const change24h = data.price_change_percentage_24h;
        const changeClass = change24h >= 0 ? 'positive' : 'negative';
        
        const content = DOM.createElement('div', { class: 'detail-content' });
        
        content.innerHTML = `
            <div class="detail-header">
                <img src="${coin.image?.large}" alt="${coin.name}" class="detail-image" width="64" height="64">
                <div>
                    <h1 class="detail-title">${coin.name}</h1>
                    <span class="detail-symbol">${coin.symbol}</span>
                    <span class="crypto-rank" style="margin-left: 12px;">#${coin.market_cap_rank}</span>
                </div>
            </div>
            
            <div class="crypto-price" style="font-size: 2.5rem; margin: 24px 0;">
                ${Formatters.currency(data.current_price?.usd)}
                <span class="crypto-change ${changeClass}" style="margin-left: 16px; font-size: 1rem;">
                    ${change24h >= 0 ? '↑' : '↓'} ${Formatters.percentage(change24h)}
                </span>
            </div>
            
            <div class="detail-grid">
                <div class="detail-card">
                    <div class="detail-card-label">Market Cap</div>
                    <div class="detail-card-value">${Formatters.compactNumber(data.market_cap?.usd)}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-card-label">Volumen 24h</div>
                    <div class="detail-card-value">${Formatters.compactNumber(data.total_volume?.usd)}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-card-label">Oferta Circulante</div>
                    <div class="detail-card-value">${Formatters.compactNumber(data.circulating_supply)}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-card-label">Oferta Máxima</div>
                    <div class="detail-card-value">${data.max_supply ? Formatters.compactNumber(data.max_supply) : '∞'}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-card-label">Cambio 7d</div>
                    <div class="detail-card-value ${data.price_change_percentage_7d >= 0 ? 'text-positive' : 'text-negative'}">
                        ${Formatters.percentage(data.price_change_percentage_7d)}
                    </div>
                </div>
                <div class="detail-card">
                    <div class="detail-card-label">Cambio 30d</div>
                    <div class="detail-card-value ${data.price_change_percentage_30d >= 0 ? 'text-positive' : 'text-negative'}">
                        ${Formatters.percentage(data.price_change_percentage_30d)}
                    </div>
                </div>
                ${coin.links?.homepage?.[0] ? `
                <div class="detail-card" style="grid-column: span 2;">
                    <div class="detail-card-label">Web Oficial</div>
                    <div class="detail-card-value">
                        <a href="${coin.links.homepage[0]}" target="_blank" rel="noopener noreferrer" class="text-primary">
                            ${new URL(coin.links.homepage[0]).hostname}
                        </a>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        DOM.clearElement(this.container);
        this.container.appendChild(content);
    },

    showLoader() {
        this.container.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <span>Cargando detalles...</span>
            </div>
        `;
    },

    showError(message) {
        this.container.innerHTML = `
            <div class="error-container">
                <p>${message}</p>
                <button class="btn btn-primary" onclick="Router.navigate('dashboard')">Volver al Dashboard</button>
            </div>
        `;
    },

    show() {
        DOM.$('#detail-view').classList.remove('hidden');
    },

    hide() {
        DOM.$('#detail-view').classList.add('hidden');
    }
};