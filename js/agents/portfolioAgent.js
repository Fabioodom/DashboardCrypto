class PortfolioAgent extends BaseAgent {
    constructor() {
        super('PortfolioAgent', AGENT_CONFIG.PORTFOLIO_AGENT);
        this.favorites = [];
        this.favoriteCoins = [];
        this.summary = null;
        this.insights = [];
    }

    init() {
        super.init();
        this._loadFavoriteHistory();
        return this;
    }

    observe(context = {}) {
        super.observe(context);
        this.favorites = Favorites.getAll();
        this.favoriteCoins = context.favoriteCoins || [];
        return this;
    }

    analyze(context = {}) {
        super.analyze(context);
        
        if (this.favoriteCoins.length === 0) {
            return null;
        }

        const analysis = {
            bestPerformer: this._findBestPerformer(),
            worstPerformer: this._findWorstPerformer(),
            averageChange: this._calculateAverageChange(),
            totalValue: this._calculateTotalValue(),
            changeDistribution: this._calculateChangeDistribution(),
            volatility: this._calculatePortfolioVolatility()
        };

        this.insights = this._generateInsights(analysis);
        this.summary = this._generateSummary(analysis);
        
        this._saveFavoriteHistory(analysis);

        return analysis;
    }

    decide(context) {
        super.decide(context);
        return {
            hasData: this.favoriteCoins.length > 0,
            insightsCount: this.insights.length
        };
    }

    act() {
        super.act();
        
        const result = this._createResult('portfolio_analysis', {
            summary: this.summary,
            insights: this.insights,
            favorites: this.favoriteCoins,
            timestamp: Date.now()
        });

        this.emit('summaryUpdated', this.summary);
        this.emit('insightsGenerated', this.insights);

        return result;
    }

    async run(context = {}) {
        this.observe(context);
        const analysis = this.analyze(context);
        const decision = this.decide(context);
        return this.act();
    }

    getSummary() {
        return this.summary;
    }

    getInsights() {
        return [...this.insights];
    }

    getBestPerformer() {
        return this._findBestPerformer();
    }

    getWorstPerformer() {
        return this._findWorstPerformer();
    }

    getAverageChange() {
        return this._calculateAverageChange();
    }

    _findBestPerformer() {
        if (this.favoriteCoins.length === 0) return null;

        const sorted = [...this.favoriteCoins].sort(
            (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        );

        const best = sorted[0];
        return {
            coinId: best.id,
            symbol: best.symbol?.toUpperCase(),
            name: best.name,
            change: best.price_change_percentage_24h || 0,
            price: best.current_price,
            image: best.image
        };
    }

    _findWorstPerformer() {
        if (this.favoriteCoins.length === 0) return null;

        const sorted = [...this.favoriteCoins].sort(
            (a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
        );

        const worst = sorted[0];
        return {
            coinId: worst.id,
            symbol: worst.symbol?.toUpperCase(),
            name: worst.name,
            change: worst.price_change_percentage_24h || 0,
            price: worst.current_price,
            image: worst.image
        };
    }

    _calculateAverageChange() {
        if (this.favoriteCoins.length === 0) return 0;

        const total = this.favoriteCoins.reduce(
            (sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0
        );
        return (total / this.favoriteCoins.length).toFixed(2);
    }

    _calculateTotalValue() {
        return this.favoriteCoins.reduce(
            (sum, coin) => sum + (coin.current_price || 0), 0
        );
    }

    _calculateChangeDistribution() {
        const distribution = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        this.favoriteCoins.forEach(coin => {
            const change = coin.price_change_percentage_24h || 0;
            if (change > 0.5) distribution.positive++;
            else if (change < -0.5) distribution.negative++;
            else distribution.neutral++;
        });

        return distribution;
    }

    _calculatePortfolioVolatility() {
        if (this.favoriteCoins.length === 0) return 0;

        const changes = this.favoriteCoins.map(c => c.price_change_percentage_24h || 0);
        const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
        const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changes.length;
        
        return {
            standardDeviation: Math.sqrt(variance).toFixed(2),
            isHigh: Math.sqrt(variance) > 5
        };
    }

    _generateInsights(analysis) {
        const insights = [];

        const best = this._findBestPerformer();
        const worst = this._findWorstPerformer();
        const distribution = this._calculateChangeDistribution();
        const volatility = this._calculatePortfolioVolatility();

        if (best && best.change > 5) {
            insights.push({
                type: 'opportunity',
                icon: '📈',
                message: `${best.name} (${best.symbol}) sube un ${best.change.toFixed(1)}%. ¡Buen momento para seguir de cerca!`
            });
        }

        if (worst && worst.change < -5) {
            insights.push({
                type: 'warning',
                icon: '📉',
                message: `${worst.name} (${worst.symbol}) cae un ${Math.abs(worst.change).toFixed(1)}%. Vigilancia recomendada.`
            });
        }

        if (distribution.positive > distribution.negative) {
            insights.push({
                type: 'positive',
                icon: '✅',
                message: `Tu watchlist está en verde: ${distribution.positive} activos subiendo vs ${distribution.negative} bajando.`
            });
        } else if (distribution.negative > distribution.positive) {
            insights.push({
                type: 'negative',
                icon: '⚠️',
                message: `Tu watchlist está en rojo: ${distribution.negative} activos bajando vs ${distribution.positive} subiendo.`
            });
        }

        if (volatility.isHigh) {
            insights.push({
                type: 'volatility',
                icon: '⚡',
                message: `Alta volatilidad en favoritos (desviación: ${volatility.standardDeviation}%). Actúa con precaución.`
            });
        }

        if (this.favoriteCoins.length >= 5) {
            const avgChange = parseFloat(this._calculateAverageChange());
            if (avgChange > 2) {
                insights.push({
                    type: 'trend',
                    icon: '🚀',
                    message: `El promedio de tus favoritos sube ${avgChange}%. Tendencia general positiva.`
                });
            } else if (avgChange < -2) {
                insights.push({
                    type: 'trend',
                    icon: '🔻',
                    message: `El promedio de tus favoritos cae ${Math.abs(avgChange)}%. Mercado correcting.`
                });
            }
        }

        return insights;
    }

    _generateSummary(analysis) {
        const best = this._findBestPerformer();
        const worst = this._findWorstPerformer();
        const avgChange = parseFloat(this._calculateAverageChange());
        const distribution = this._calculateChangeDistribution();
        const volatility = this._calculatePortfolioVolatility();

        return {
            totalFavorites: this.favoriteCoins.length,
            averageChange: avgChange,
            bestPerformer: best,
            worstPerformer: worst,
            distribution,
            volatility,
            sentiment: this._determineSentiment(avgChange, distribution),
            summaryText: this._generateSummaryText(analysis),
            timestamp: Date.now()
        };
    }

    _determineSentiment(avgChange, distribution) {
        if (avgChange > 3 || distribution.positive > distribution.negative + 2) return 'bullish';
        if (avgChange < -3 || distribution.negative > distribution.positive + 2) return 'bearish';
        return 'neutral';
    }

    _generateSummaryText(analysis) {
        const { averageChange, distribution } = analysis;
        const avgStr = parseFloat(averageChange) > 0 ? `+${averageChange}` : averageChange;
        
        const parts = [];
        
        if (this.favoriteCoins.length === 0) {
            return 'Añade favoritos para ver el análisis de tu portfolio.';
        }

        parts.push(`Tienes ${this.favoriteCoins.length} favoritos.`);
        
        if (analysis.bestPerformer && analysis.bestPerformer.change > 1) {
            parts.push(`Mejor: ${analysis.bestPerformer.symbol} (${analysis.bestPerformer.change > 0 ? '+' : ''}${analysis.bestPerformer.change.toFixed(1)}%)`);
        }
        
        if (analysis.worstPerformer && analysis.worstPerformer.change < -1) {
            parts.push(`Peor: ${analysis.worstPerformer.symbol} (${analysis.worstPerformer.change.toFixed(1)}%)`);
        }

        parts.push(`Cambio promedio: ${avgStr}%`);
        parts.push(`${distribution.positive} suben, ${distribution.negative} bajan`);

        return parts.join(' · ');
    }

    _loadFavoriteHistory() {
        this.history = Storage.get('cv_portfolio_history', []);
    }

    _saveFavoriteHistory(analysis) {
        this.history.push({
            timestamp: Date.now(),
            summary: {
                averageChange: analysis.averageChange,
                totalFavorites: this.favoriteCoins.length
            }
        });

        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
        }

        Storage.set('cv_portfolio_history', this.history);
    }

    getHistoricalPerformance(days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.history.filter(h => h.timestamp >= cutoff);
    }

    getTrend() {
        const history = this.getHistoricalPerformance(7);
        if (history.length < 2) return 'insufficient_data';

        const first = parseFloat(history[0]?.summary?.averageChange || 0);
        const last = parseFloat(history[history.length - 1]?.summary?.averageChange || 0);

        if (last > first + 2) return 'improving';
        if (last < first - 2) return 'declining';
        return 'stable';
    }
}

window.PortfolioAgent = PortfolioAgent;
