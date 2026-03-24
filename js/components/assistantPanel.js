window.AssistantPanel = {
    container: null,
    toggleBtn: null,
    isOpen: false,

    init() {
        this.createPanel();
        this.cacheElements();
        this.bindEvents();
    },

    createPanel() {
        const existingPanel = DOM.$('#assistant-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = DOM.createElement('div', {
            id: 'assistant-panel',
            class: 'assistant-panel'
        });

        panel.innerHTML = `
            <div class="assistant-body" id="assistant-body">
                <div class="assistant-messages" id="assistant-messages">
                    <div class="assistant-message bot">
                        Hola, soy tu asistente de CryptoVision. Escribe "ayuda" para ver los comandos disponibles.
                    </div>
                </div>
                <div class="assistant-input-group">
                    <input type="text" class="assistant-input" id="assistant-input" 
                           placeholder="Escribe un comando..." aria-label="Comando para el asistente">
                    <button class="assistant-send-btn" id="assistant-send" aria-label="Enviar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <button class="assistant-toggle" id="assistant-toggle" aria-label="Abrir asistente" aria-expanded="false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </button>
        `;

        document.body.appendChild(panel);
    },

    cacheElements() {
        this.container = DOM.$('#assistant-panel');
        this.body = DOM.$('#assistant-body');
        this.toggleBtn = DOM.$('#assistant-toggle');
        this.messagesContainer = DOM.$('#assistant-messages');
        this.input = DOM.$('#assistant-input');
        this.sendBtn = DOM.$('#assistant-send');
    },

    bindEvents() {
        DOM.on(this.toggleBtn, 'click', () => this.toggle());
        DOM.on(this.input, 'keydown', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        DOM.on(this.sendBtn, 'click', () => this.sendMessage());
    },

    toggle() {
        this.isOpen = !this.isOpen;
        this.body.classList.toggle('open', this.isOpen);
        this.toggleBtn.setAttribute('aria-expanded', this.isOpen);
        
        if (this.isOpen) {
            this.input.focus();
        }
    },

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.input.value = '';
        this.addMessage(message, 'user');

        try {
            const response = this.processCommand(message);
            this.addMessage(response.message, 'bot');

            if (response.action === 'navigate_detail' && response.data) {
                Store.setCurrentCoin(response.data);
                Router.navigate(VIEW_NAMES.DETAIL);
            } else if (response.action === 'filter' && response.params) {
                Store.updateFilters(response.params);
                Router.navigate(VIEW_NAMES.DASHBOARD);
            } else if (response.action === 'navigate_dashboard') {
                Router.navigate(VIEW_NAMES.DASHBOARD);
            } else if (response.action === 'navigate_favorites') {
                Router.navigate(VIEW_NAMES.FAVORITES);
            }
        } catch (error) {
            this.addMessage('Lo siento, no entendí tu mensaje. Escribe "ayuda" para ver los comandos.', 'error');
        }
    },

    processCommand(input) {
        const lower = input.toLowerCase().trim();
        const coins = Store.getState().coins;

        if (lower === 'ayuda' || lower === 'help') {
            return {
                type: 'info',
                message: `Asistente CryptoVision\n\n` +
                         `Comandos disponibles:\n\n` +
                         `📈 "top 5 que suben" - Mejores ganancias\n` +
                         `📉 "top 5 que bajan" - Peores pérdidas\n` +
                         `📊 "mayor volumen" - Más traded\n` +
                         `📋 "resumen mercado" - Estado general\n` +
                         `⭐ "resumen favoritos" - Tu portfolio\n` +
                         `🏆 "mejor favorita" - La que mejor va\n` +
                         `💔 "peor favorita" - La que peor va\n` +
                         `🔍 "buscar btc" - Buscar criptomoneda\n` +
                         `📖 "ayuda" - Mostrar comandos`,
                action: 'none'
            };
        }

        if (lower.includes('top') && (lower.includes('suben') || lower.includes('mejor') || lower.includes('ganan'))) {
            if (!coins.length) return { message: 'Cargando datos...', action: 'none' };
            const top = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
            return {
                message: `Top 5 que más suben:\n` + top.map((c, i) => `${i+1}. ${c.symbol?.toUpperCase()}: ${(c.price_change_percentage_24h || 0) > 0 ? '+' : ''}${(c.price_change_percentage_24h || 0).toFixed(2)}%`).join('\n'),
                action: 'filter',
                params: { sort: 'change_desc', limit: 5 }
            };
        }

        if (lower.includes('top') && (lower.includes('bajan') || lower.includes('peor') || lower.includes('pierden'))) {
            if (!coins.length) return { message: 'Cargando datos...', action: 'none' };
            const top = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);
            return {
                message: `Top 5 que más bajan:\n` + top.map((c, i) => `${i+1}. ${c.symbol?.toUpperCase()}: ${(c.price_change_percentage_24h || 0).toFixed(2)}%`).join('\n'),
                action: 'filter',
                params: { sort: 'change_asc', limit: 5 }
            };
        }

        if (lower.includes('volumen') || lower.includes('traded') || lower.includes('negociado')) {
            if (!coins.length) return { message: 'Cargando datos...', action: 'none' };
            const top = [...coins].sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0)).slice(0, 5);
            return {
                message: `Top 5 por volumen:\n` + top.map((c, i) => `${i+1}. ${c.symbol?.toUpperCase()} - $${Formatters.formatNumber(c.total_volume)}`).join('\n'),
                action: 'none'
            };
        }

        if (lower.includes('resumen') && lower.includes('mercado')) {
            if (!coins.length) return { message: 'Cargando datos...', action: 'none' };
            const avg = coins.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / coins.length;
            const pos = coins.filter(c => (c.price_change_percentage_24h || 0) > 0).length;
            return {
                message: `Resumen del mercado:\n\n` +
                         `• Monedas: ${coins.length}\n` +
                         `• Cambio promedio: ${avg > 0 ? '+' : ''}${avg.toFixed(2)}%\n` +
                         `• Subiendo: ${pos}\n` +
                         `• Bajando: ${coins.length - pos}`,
                action: 'none'
            };
        }

        if (lower.includes('buscar')) {
            const query = lower.replace('buscar', '').trim();
            if (!query || !coins.length) return { message: 'Indica qué criptomoneda buscar.', action: 'none' };
            const results = coins.filter(c => c.name?.toLowerCase().includes(query) || c.symbol?.toLowerCase().includes(query)).slice(0, 5);
            if (!results.length) return { message: `No encontré "${query}".`, action: 'none' };
            return {
                message: `Resultados para "${query}":\n` + results.map((c, i) => `${i+1}. ${c.name} (${c.symbol?.toUpperCase()})`).join('\n'),
                action: 'none'
            };
        }

        return {
            message: 'No entendí tu mensaje. Escribe "ayuda" para ver los comandos disponibles.',
            action: 'none'
        };
    },

    addMessage(text, type) {
        const messageEl = DOM.createElement('div', {
            class: `assistant-message ${type}`
        });
        messageEl.textContent = text;
        this.messagesContainer.appendChild(messageEl);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    show() {
        if (!this.isOpen) {
            this.toggle();
        }
    },

    hide() {
        if (this.isOpen) {
            this.toggle();
        }
    }
};
