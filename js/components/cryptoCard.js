window.CryptoCard = {
    create(coin) {
        const isFavorite = Favorites.has(coin.id);
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        const changeIcon = coin.price_change_percentage_24h >= 0 ? '↑' : '↓';

        const card = DOM.createElement('article', {
            class: 'crypto-card',
            dataset: { coinId: coin.id },
            role: 'listitem',
            tabindex: '0',
            ariaLabel: `${coin.name}, ${Formatters.currency(coin.current_price)}`
        });

        card.innerHTML = `
            <div class="crypto-card-header">
                <div class="crypto-info">
                    <img src="${coin.image}" alt="${coin.name}" width="32" height="32" loading="lazy">
                    <div>
                        <span class="crypto-rank">#${coin.market_cap_rank || '-'}</span>
                        <div class="crypto-name">${Formatters.truncate(coin.name, 20)}</div>
                        <span class="crypto-symbol">${coin.symbol}</span>
                    </div>
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-coin-id="${coin.id}"
                        aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                        aria-pressed="${isFavorite}">
                    ${isFavorite ? '★' : '☆'}
                </button>
            </div>
            <div class="crypto-price">${Formatters.currency(coin.current_price)}</div>
            <div class="crypto-change ${changeClass}">
                <span>${changeIcon}</span>
                <span>${Formatters.percentage(coin.price_change_percentage_24h)}</span>
            </div>
            <div class="crypto-stats">
                <div class="crypto-stat">
                    <span class="crypto-stat-label">Market Cap</span>
                    <span class="crypto-stat-value">${Formatters.compactNumber(coin.market_cap)}</span>
                </div>
                <div class="crypto-stat">
                    <span class="crypto-stat-label">Volumen 24h</span>
                    <span class="crypto-stat-value">${Formatters.compactNumber(coin.total_volume)}</span>
                </div>
            </div>
        `;

        DOM.on(card, 'click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                Router.navigate(VIEW_NAMES.DETAIL, { coinId: coin.id });
            }
        });

        DOM.on(card, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                Router.navigate(VIEW_NAMES.DETAIL, { coinId: coin.id });
            }
        });

        const favBtn = card.querySelector('.favorite-btn');
        DOM.on(favBtn, 'click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(coin.id, favBtn);
        });

        return card;
    },

    toggleFavorite(coinId, btn) {
        const isFavorite = Favorites.has(coinId);
        
        if (isFavorite) {
            Favorites.remove(coinId);
            DOM.removeClass(btn, 'active');
            btn.textContent = '☆';
            btn.setAttribute('aria-label', 'Añadir a favoritos');
            btn.setAttribute('aria-pressed', 'false');
            Toast.show('Eliminado de favoritos', 'success');
        } else {
            Favorites.add(coinId);
            DOM.addClass(btn, 'active');
            btn.textContent = '★';
            btn.setAttribute('aria-label', 'Quitar de favoritos');
            btn.setAttribute('aria-pressed', 'true');
            Toast.show('Añadido a favoritos', 'success');
        }

        Store.setState({ favorites: Favorites.getAll() });
        Header.updateAuthState();
    },

    createSkeleton() {
        const card = DOM.createElement('div', {
            class: 'crypto-card loading-skeleton skeleton-card'
        });
        card.innerHTML = '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div>';
        return card;
    }
};