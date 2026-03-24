class MarketAgent extends BaseAgent {
    constructor() {
        super('MarketAgent', AGENT_CONFIG.MARKET_AGENT);
        this.thresholds = AGENT_CONFIG.MARKET_AGENT.thresholds;
        this.currentSignals = [];
        this.marketSummary = null;
    }

    init() {
        super.init();
        this._loadHistoricalData();
        return this;
    }

    observe(context = {}) {
        super.observe(context);
        this.coins = context.coins || Store.getState().coins;
        return this;
    }

    analyze(context = {}) {
        super.analyze(context);
        
        if (!this.coins || this.coins.length === 0) {
            return null;
        }

        const signals = {
            bullish: [],
            bearish: [],
            volatile: [],
            highInterest: []
        };

        const avgVolume = this._calculateAverageVolume();
        const avgMarketCap = this._calculateAverageMarketCap();

        this.coins.forEach(coin => {
            const change24h = coin.price_change_percentage_24h || 0;
            const volume = coin.total_volume || 0;
            const marketCap = coin.market_cap || 0;
            const isHighVolume = volume > avgVolume * this.thresholds.highVolumeMultiplier;

            if (change24h > this.thresholds.bullish) {
                signals.bullish.push(this._createCoinSignal(coin, AGENT_SIGNALS.BULLISH, {
                    change: change24h,
                    volume,
                    isHighVolume
                }));
            } else if (change24h < this.thresholds.bearish) {
                signals.bearish.push(this._createCoinSignal(coin, AGENT_SIGNALS.BEARISH, {
                    change: change24h,
                    volume,
                    isHighVolume
                }));
            }

            if (Math.abs(change24h) > this.thresholds.volatile) {
                signals.volatile.push(this._createCoinSignal(coin, AGENT_SIGNALS.VOLATILE, {
                    change: change24h,
                    volatility: Math.abs(change24h)
                }));
            }

            if (isHighVolume && change24h > 0 && marketCap > avgMarketCap) {
                signals.highInterest.push(this._createCoinSignal(coin, AGENT_SIGNALS.HIGH_INTEREST, {
                    change: change24h,
                    volume,
                    marketCap
                }));
            }
        });

        signals.bullish.sort((a, b) => b.data.change - a.data.change);
        signals.bearish.sort((a, b) => a.data.change - b.data.change);
        signals.volatile.sort((a, b) => b.data.volatility - a.data.volatility);

        this.currentSignals = signals;
        this.marketSummary = this._generateMarketSummary(signals);

        return signals;
    }

    decide(context) {
        super.decide(context);
        return {
            shouldNotify: this._shouldNotify(),
            prioritySignals: this._getPrioritySignals()
        };
    }

    act() {
        super.act();
        
        const result = this._createResult('market_analysis', {
            signals: this.currentSignals,
            summary: this.marketSummary,
            timestamp: Date.now()
        }, { signalsCount: this._countSignals() });

        this.emit('signalsUpdated', this.currentSignals);
        this.emit('summaryUpdated', this.marketSummary);

        return result;
    }

    async run(context = {}) {
        this.observe(context);
        const analysis = this.analyze(context);
        const decision = this.decide(context);
        return this.act();
    }

    getSignals(type = null) {
        if (type) {
            return this.currentSignals[type] || [];
        }
        return this.currentSignals;
    }

    getSummary() {
        return this.marketSummary;
    }

    getTopSignals(type, limit = 5) {
        const signals = this.currentSignals[type] || [];
        return signals.slice(0, limit);
    }

    _createCoinSignal(coin, signalType, extraData = {}) {
        return {
            coinId: coin.id,
            symbol: coin.symbol?.toUpperCase(),
            name: coin.name,
            signal: signalType,
            price: coin.current_price,
            change: extraData.change,
            volume: extraData.volume,
            marketCap: coin.market_cap,
            image: coin.image,
            timestamp: Date.now(),
            ...extraData
        };
    }

    _calculateAverageVolume() {
        if (!this.coins || this.coins.length === 0) return 0;
        const total = this.coins.reduce((sum, c) => sum + (c.total_volume || 0), 0);
        return total / this.coins.length;
    }

    _calculateAverageMarketCap() {
        if (!this.coins || this.coins.length === 0) return 0;
        const total = this.coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
        return total / this.coins.length;
    }

    _generateMarketSummary(signals) {
        const totalCoins = this.coins?.length || 0;
        const bullishCount = signals.bullish?.length || 0;
        const bearishCount = signals.bearish?.length || 0;
        const volatileCount = signals.volatile?.length || 0;

        let sentiment = 'neutral';
        if (bullishCount > bearishCount * 2) sentiment = 'muy_bullish';
        else if (bullishCount > bearishCount) sentiment = 'bullish';
        else if (bearishCount > bullishCount * 2) sentiment = 'muy_bearish';
        else if (bearishCount > bullishCount) sentiment = 'bearish';

        const avgChange = this.coins?.length > 0
            ? this.coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / totalCoins
            : 0;

        return {
            sentiment,
            avgChange: avgChange.toFixed(2),
            totalCoins,
            bullishCount,
            bearishCount,
            volatileCount,
            highInterestCount: signals.highInterest?.length || 0,
            message: this._generateSentimentMessage(sentiment, avgChange, bullishCount, bearishCount),
            timestamp: Date.now()
        };
    }

    _generateSentimentMessage(sentiment, avgChange, bullish, bearish) {
        const changeStr = avgChange > 0 ? `+${avgChange}` : avgChange;
        
        switch (sentiment) {
            case 'muy_bullish':
                return `El mercado muestra fuerte tendencia alcista. ${bullish} activos con ganancias destacadas. Cambio promedio: ${changeStr}%`;
            case 'bullish':
                return `Sesgo alcista en el mercado. ${bullish} activos subiendo. Cambio promedio: ${changeStr}%`;
            case 'bearish':
                return `Sesgo bajista detectado. ${bearish} activos en pérdida. Cambio promedio: ${changeStr}%`;
            case 'muy_bearish':
                return `Alerta: Fuerte presión vendedora. ${bearish} activos con caídas significativas. Cambio promedio: ${changeStr}%`;
            default:
                return `Mercado estable. Cambio promedio: ${changeStr}%. ${bullish} suben, ${bearish} bajan.`;
        }
    }

    _shouldNotify() {
        return this.currentSignals.volatile?.length > 0 ||
               this.currentSignals.bullish?.length > 3 ||
               this.currentSignals.bearish?.length > 3;
    }

    _getPrioritySignals() {
        const priority = [];
        
        this.currentSignals.volatile?.slice(0, 2).forEach(s => {
            priority.push({ ...s, priority: 'high' });
        });
        
        this.currentSignals.highInterest?.slice(0, 3).forEach(s => {
            priority.push({ ...s, priority: 'medium' });
        });

        return priority;
    }

    _countSignals() {
        return (this.currentSignals.bullish?.length || 0) +
               (this.currentSignals.bearish?.length || 0) +
               (this.currentSignals.volatile?.length || 0) +
               (this.currentSignals.highInterest?.length || 0);
    }

    _loadHistoricalData() {
        const saved = Storage.get('cv_market_signals_history', []);
        this.historicalSignals = saved.slice(-100);
    }

    _saveHistoricalData() {
        if (this.currentSignals) {
            this.historicalSignals.push({
                timestamp: Date.now(),
                signals: this.currentSignals
            });
            if (this.historicalSignals.length > 100) {
                this.historicalSignals = this.historicalSignals.slice(-100);
            }
            Storage.set('cv_market_signals_history', this.historicalSignals);
        }
    }
}

window.MarketAgent = MarketAgent;
