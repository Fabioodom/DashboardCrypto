class AssistantAgent extends BaseAgent {
    constructor() {
        super('AssistantAgent', AGENT_CONFIG.ASSISTANT_AGENT);
        this.coins = [];
        this.favorites = [];
        this.conversationHistory = [];
        this.intentPatterns = this._buildIntentPatterns();
    }

    init() {
        super.init();
        this._loadHistory();
        return this;
    }

    observe(context = {}) {
        super.observe(context);
        this.coins = context.coins || Store.getState().coins;
        this.favorites = context.favoriteCoins || [];
        return this;
    }

    analyze(input) {
        super.analyze(input);
        
        if (!input || input.trim().length === 0) {
            return { intent: null, confidence: 0, message: 'Por favor, escribe algo.' };
        }

        const normalizedInput = input.toLowerCase().trim();
        const intent = this._parseIntent(normalizedInput);
        
        return intent;
    }

    decide(context) {
        super.decide(context);
        return {
            shouldRespond: true,
            shouldNavigate: context.intent?.action === 'navigate'
        };
    }

    act() {
        super.act();
        Metrics.increment('assistant_queries');
        return this;
    }

    async process(input) {
        this.observe();
        const analysis = this.analyze(input);
        
        if (!analysis.intent) {
            return this._createResponse({
                type: 'error',
                message: analysis.message,
                timestamp: Date.now()
            });
        }

        const result = this._executeIntent(analysis);
        const response = this._createResponse(result, analysis.intent);

        this._addToHistory(input, response);

        return response;
    }

    _buildIntentPatterns() {
        return {
            top_subidas: {
                keywords: ['top', 'mas suben', 'mejor', 'mayor subida', 'mejor rendimiento', 'ganadores', 'que suben'],
                synonyms: ['suben', 'subida', 'alcista', 'arriba', 'mejor'],
                intent: 'top_subidas',
                action: 'filter',
                params: { sort: 'change_desc', limit: 5 }
            },
            top_bajadas: {
                keywords: ['top', 'mas bajan', 'peor', 'mayor caida', 'peor rendimiento', 'perdedores', 'que bajan'],
                synonyms: ['bajan', 'bajada', 'bajista', 'abajo', 'peor'],
                intent: 'top_bajadas',
                action: 'filter',
                params: { sort: 'change_asc', limit: 5 }
            },
            mayor_volumen: {
                keywords: ['volumen', 'mas traded', 'mas negociado', 'trading', 'actividad'],
                synonyms: ['volumen', 'trade', 'traded'],
                intent: 'mayor_volumen',
                action: 'filter',
                params: { sort: 'volume_desc' }
            },
            resumen_mercado: {
                keywords: ['resumen', 'resumen mercado', 'Resumen mercado', 'como va', 'estado mercado', 'situacion'],
                synonyms: ['resumen', 'resumen del mercado', 'overview'],
                intent: 'resumen_mercado',
                action: 'summarize'
            },
            resumen_favoritos: {
                keywords: ['favoritos', 'mi portfolio', 'mi portafolio', 'mis cryptos', 'mi lista'],
                synonyms: ['favoritos', 'portfolio', 'portafolio', 'watchlist'],
                intent: 'resumen_favoritos',
                action: 'summarize_favorites'
            },
            mejor_favorita: {
                keywords: ['mejor favorita', 'mejor de favoritos', 'mejor posicion', 'top favorita'],
                synonyms: ['mejor favorita', 'best'],
                intent: 'mejor_favorita',
                action: 'find_best'
            },
            peor_favorita: {
                keywords: ['peor favorita', 'peor de favoritos', 'peor posicion', 'la que peor va'],
                synonyms: ['peor favorita', 'worst'],
                intent: 'peor_favorita',
                action: 'find_worst'
            },
            buscar: {
                keywords: ['buscar', 'encuentra', 'dime de', 'info de', 'datos de'],
                synonyms: ['buscar', 'encuentra', 'search', 'find'],
                intent: 'buscar',
                action: 'search'
            },
            abrir_detalle: {
                keywords: ['abrir', 'ver detalle', 'muestrame', 'detalles de'],
                synonyms: ['abrir', 'ver', 'show', 'open'],
                intent: 'abrir_detalle',
                action: 'navigate'
            },
            ayuda: {
                keywords: ['ayuda', 'comandos', 'que puedes hacer', 'help', 'que haces'],
                synonyms: ['ayuda', 'help', 'comandos'],
                intent: 'ayuda',
                action: 'help'
            }
        };
    }

    _parseIntent(input) {
        let bestMatch = null;
        let bestScore = 0;

        for (const [intentName, pattern] of Object.entries(this.intentPatterns)) {
            let score = 0;
            
            pattern.keywords.forEach(keyword => {
                if (input.includes(keyword)) {
                    score += 2;
                }
            });

            pattern.synonyms.forEach(synonym => {
                if (input.includes(synonym)) {
                    score += 1;
                }
            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = { intent: intentName, pattern, score };
            }
        }

        if (bestScore === 0) {
            const words = input.split(/\s+/);
            if (words.length <= 3 && this._looksLikeCoinQuery(input)) {
                return {
                    intent: 'buscar',
                    pattern: this.intentPatterns.buscar,
                    score: 1,
                    extractedQuery: input
                };
            }
        }

        return {
            intent: bestMatch?.intent || null,
            pattern: bestMatch?.pattern || null,
            score: bestScore,
            confidence: Math.min(bestScore / 4, 1),
            extractedQuery: this._extractQuery(input, bestMatch?.pattern)
        };
    }

    _extractQuery(input, pattern) {
        if (!pattern) {
            const words = input.split(/\s+/);
            const filtered = words.filter(w => 
                !['el', 'la', 'los', 'las', 'de', 'del', 'en', 'que', 'como', 'un', 'una'].includes(w)
            );
            return filtered.join(' ');
        }

        let query = input;
        const removeWords = [...(pattern.keywords || []), ...(pattern.synonyms || [])];
        
        removeWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            query = query.replace(regex, '');
        });

        return query.replace(/\s+/g, ' ').trim();
    }

    _looksLikeCoinQuery(input) {
        const coinIndicators = ['btc', 'eth', 'bitcoin', 'ethereum', 'sol', 'solana', 'ripple', 'xrp'];
        return coinIndicators.some(indicator => input.includes(indicator)) || input.length < 10;
    }

    _executeIntent(analysis) {
        const { intent, extractedQuery } = analysis;

        switch (intent) {
            case 'top_subidas':
                return this._handleTopSubidas();
            case 'top_bajadas':
                return this._handleTopBajadas();
            case 'mayor_volumen':
                return this._handleMayorVolumen();
            case 'resumen_mercado':
                return this._handleResumenMercado();
            case 'resumen_favoritos':
                return this._handleResumenFavoritos();
            case 'mejor_favorita':
                return this._handleMejorFavorita();
            case 'peor_favorita':
                return this._handlePeorFavorita();
            case 'buscar':
                return this._handleBuscar(extractedQuery);
            case 'abrir_detalle':
                return this._handleAbrirDetalle(extractedQuery);
            case 'ayuda':
                return this._handleAyuda();
            default:
                return this._handleUnknown();
        }
    }

    _handleTopSubidas() {
        if (!this.coins || this.coins.length === 0) {
            return { type: 'info', message: 'Cargando datos del mercado...', action: 'reload_data' };
        }

        const top = [...this.coins]
            .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
            .slice(0, 5);

        const coinsList = top.map((c, i) => 
            `${i + 1}. ${c.symbol?.toUpperCase()} (${c.name}): ${(c.price_change_percentage_24h || 0) > 0 ? '+' : ''}${(c.price_change_percentage_24h || 0).toFixed(2)}%`
        ).join('\n');

        return {
            type: 'success',
            message: `Top 5 que más suben:\n${coinsList}`,
            action: 'filter',
            data: top,
            params: { sort: 'change_desc', limit: 5 }
        };
    }

    _handleTopBajadas() {
        if (!this.coins || this.coins.length === 0) {
            return { type: 'info', message: 'Cargando datos del mercado...', action: 'reload_data' };
        }

        const top = [...this.coins]
            .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
            .slice(0, 5);

        const coinsList = top.map((c, i) => 
            `${i + 1}. ${c.symbol?.toUpperCase()} (${c.name}): ${(c.price_change_percentage_24h || 0).toFixed(2)}%`
        ).join('\n');

        return {
            type: 'warning',
            message: `Top 5 que más bajan:\n${coinsList}`,
            action: 'filter',
            data: top,
            params: { sort: 'change_asc', limit: 5 }
        };
    }

    _handleMayorVolumen() {
        if (!this.coins || this.coins.length === 0) {
            return { type: 'info', message: 'Cargando datos del mercado...', action: 'reload_data' };
        }

        const top = [...this.coins]
            .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
            .slice(0, 5);

        const coinsList = top.map((c, i) => 
            `${i + 1}. ${c.symbol?.toUpperCase()} - Vol: $${Formatters.formatNumber(c.total_volume)}`
        ).join('\n');

        return {
            type: 'info',
            message: `Top 5 por volumen:\n${coinsList}`,
            action: 'filter',
            data: top,
            params: { sort: 'volume_desc' }
        };
    }

    _handleResumenMercado() {
        if (!this.coins || this.coins.length === 0) {
            return { type: 'info', message: 'Cargando datos del mercado...', action: 'reload_data' };
        }

        const avgChange = this.coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / this.coins.length;
        const positive = this.coins.filter(c => (c.price_change_percentage_24h || 0) > 0).length;
        const negative = this.coins.length - positive;
        const sentiment = avgChange > 2 ? 'alcista 🟢' : avgChange < -2 ? 'bajista 🔴' : 'neutral ⚪';

        return {
            type: 'info',
            message: `Resumen del mercado:\n\n` +
                     `• Monedas analizadas: ${this.coins.length}\n` +
                     `• Cambio promedio: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%\n` +
                     `• Subiendo: ${positive}\n` +
                     `• Bajando: ${negative}\n` +
                     `• Sentimiento: ${sentiment}`,
            action: 'none'
        };
    }

    _handleResumenFavoritos() {
        if (this.favorites.length === 0) {
            return { type: 'info', message: 'No tienes favoritos. Añade algunos desde el dashboard.', action: 'navigate_dashboard' };
        }

        const avgChange = this.favorites.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / this.favorites.length;
        const best = [...this.favorites].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))[0];
        const worst = [...this.favorites].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))[0];

        return {
            type: 'info',
            message: `Tu Portfolio:\n\n` +
                     `• Favoritos: ${this.favorites.length}\n` +
                     `• Cambio promedio: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%\n` +
                     `• Mejor: ${best?.symbol?.toUpperCase()} (+${(best?.price_change_percentage_24h || 0).toFixed(2)}%)\n` +
                     `• Peor: ${worst?.symbol?.toUpperCase()} (${(worst?.price_change_percentage_24h || 0).toFixed(2)}%)`,
            action: 'navigate_favorites'
        };
    }

    _handleMejorFavorita() {
        if (this.favorites.length === 0) {
            return { type: 'info', message: 'No tienes favoritos aún.', action: 'navigate_dashboard' };
        }

        const best = [...this.favorites].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))[0];
        
        return {
            type: 'success',
            message: `Mejor favorita: ${best?.name} (${best?.symbol?.toUpperCase()})\n` +
                     `Precio: ${Formatters.formatCurrency(best?.current_price)}\n` +
                     `Cambio 24h: +${(best?.price_change_percentage_24h || 0).toFixed(2)}%`,
            action: 'navigate_detail',
            data: best
        };
    }

    _handlePeorFavorita() {
        if (this.favorites.length === 0) {
            return { type: 'info', message: 'No tienes favoritos aún.', action: 'navigate_dashboard' };
        }

        const worst = [...this.favorites].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))[0];

        return {
            type: 'warning',
            message: `Peor favorita: ${worst?.name} (${worst?.symbol?.toUpperCase()})\n` +
                     `Precio: ${Formatters.formatCurrency(worst?.current_price)}\n` +
                     `Cambio 24h: ${(worst?.price_change_percentage_24h || 0).toFixed(2)}%`,
            action: 'navigate_detail',
            data: worst
        };
    }

    _handleBuscar(query) {
        if (!query || query.length < 2) {
            return { type: 'info', message: 'Indica qué criptomoneda quieres buscar.', action: 'none' };
        }

        const results = this.coins?.filter(c => 
            c.name?.toLowerCase().includes(query.toLowerCase()) ||
            c.symbol?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5) || [];

        if (results.length === 0) {
            return { type: 'info', message: `No encontré "${query}". Prueba con otro nombre o símbolo.`, action: 'none' };
        }

        const coinsList = results.map((c, i) => 
            `${i + 1}. ${c.name} (${c.symbol?.toUpperCase()})`
        ).join('\n');

        return {
            type: 'success',
            message: `Resultados para "${query}":\n${coinsList}`,
            action: 'search_results',
            data: results
        };
    }

    _handleAbrirDetalle(query) {
        if (!query || query.length < 2) {
            return { type: 'info', message: 'Indica de qué criptomoneda quieres ver el detalle.', action: 'none' };
        }

        const coin = this.coins?.find(c => 
            c.name?.toLowerCase().includes(query.toLowerCase()) ||
            c.symbol?.toLowerCase().includes(query.toLowerCase())
        );

        if (!coin) {
            return { type: 'info', message: `No encontré "${query}".`, action: 'none' };
        }

        return {
            type: 'success',
            message: `Abriendo detalle de ${coin.name}...`,
            action: 'navigate_detail',
            data: coin
        };
    }

    _handleAyuda() {
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

    _handleUnknown() {
        return {
            type: 'info',
            message: 'No entendí tu mensaje. Escribe "ayuda" para ver los comandos disponibles.',
            action: 'none'
        };
    }

    _createResponse(result, intent) {
        const response = {
            ...result,
            intent,
            timestamp: Date.now(),
            id: this._generateId()
        };

        this.emit('response', response);
        return response;
    }

    _addToHistory(input, response) {
        this.conversationHistory.push({
            input,
            response: response.message,
            intent: response.intent,
            timestamp: Date.now()
        });

        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }

        this._saveHistory();
    }

    _loadHistory() {
        this.conversationHistory = Storage.get('cv_assistant_history', []);
    }

    _saveHistory() {
        Storage.set('cv_assistant_history', this.conversationHistory);
    }

    getHistory() {
        return [...this.conversationHistory];
    }

    clearHistory() {
        this.conversationHistory = [];
        Storage.remove('cv_assistant_history');
    }
}

window.AssistantAgent = AssistantAgent;
