class OrchestratorAgent extends BaseAgent {
    constructor() {
        super('OrchestratorAgent', AGENT_CONFIG.ORCHESTRATOR);
        this.agents = {};
        this.intervals = {};
        this.isRunning = false;
        this.eventLog = [];
    }

    init() {
        super.init();
        this._registerAgents();
        this._bindStoreSubscriptions();
        this._log('Orquestador inicializado');
        return this;
    }

    _registerAgents() {
        this.agents = {
            market: new MarketAgent(),
            alert: new AlertAgent(),
            portfolio: new PortfolioAgent(),
            assistant: new AssistantAgent()
        };

        Object.values(this.agents).forEach(agent => {
            agent.on('result', (result) => this._logAgentResult(result));
            agent.on('error', (error) => this._logAgentError(error));
        });

        this._log('Agentes registrados:', Object.keys(this.agents));
    }

    _bindStoreSubscriptions() {
        Store.subscribe('coins', (coins) => {
            if (coins && coins.length > 0) {
                this._onCoinsUpdated(coins);
            }
        });

        Store.subscribe('currentView', (view) => {
            this._onViewChanged(view);
        });
    }

    start() {
        if (this.isRunning) {
            this._log('El orquestador ya está en ejecución');
            return;
        }

        this.isRunning = true;
        this._log('Orquestador iniciado');

        this.intervals.market = setInterval(() => {
            if (this.agents.market.isEnabled()) {
                this.runAgent('market');
            }
        }, AGENT_CONFIG.MARKET_AGENT.refreshInterval);

        this.intervals.alert = setInterval(() => {
            if (this.agents.alert.isEnabled()) {
                this.runAgent('alert');
            }
        }, AGENT_CONFIG.ALERT_AGENT.checkInterval);

        this.intervals.portfolio = setInterval(() => {
            if (this.agents.portfolio.isEnabled()) {
                this.runAgent('portfolio');
            }
        }, AGENT_CONFIG.PORTFOLIO_AGENT.refreshInterval);

        Metrics.increment('orchestrator_started');
        this.emit('started');
    }

    stop() {
        if (!this.isRunning) {
            this._log('El orquestador no está en ejecución');
            return;
        }

        this.isRunning = false;
        Object.keys(this.intervals).forEach(key => {
            clearInterval(this.intervals[key]);
        });
        this.intervals = {};

        this._log('Orquestador detenido');
        Metrics.increment('orchestrator_stopped');
        this.emit('stopped');
    }

    restart() {
        this.stop();
        setTimeout(() => this.start(), 100);
    }

    async runAgent(agentName, context = {}) {
        const agent = this.agents[agentName];
        if (!agent) {
            this._log(`Agente no encontrado: ${agentName}`);
            return null;
        }

        if (!agent.isEnabled()) {
            this._log(`Agente deshabilitado: ${agentName}`);
            return null;
        }

        try {
            const enrichedContext = {
                coins: context.coins || Store.getState().coins,
                favoriteCoins: context.favoriteCoins || this._getFavoriteCoinsWithData()
            };

            return await agent.run(enrichedContext);
        } catch (error) {
            this._log(`Error ejecutando ${agentName}:`, error.message);
            ErrorHandler.handle(error, `Orchestrator.runAgent(${agentName})`);
            return null;
        }
    }

    async runAllAgents(context = {}) {
        this._log('Ejecutando todos los agentes...');
        const results = {};

        for (const agentName of Object.keys(this.agents)) {
            results[agentName] = await this.runAgent(agentName, context);
        }

        this.emit('allAgentsCompleted', results);
        return results;
    }

    async runMarketAnalysis() {
        const coins = Store.getState().coins;
        return await this.runAgent('market', { coins });
    }

    async checkAlerts() {
        const coins = Store.getState().coins;
        return await this.runAgent('alert', { coins });
    }

    async analyzePortfolio() {
        return await this.runAgent('portfolio');
    }

    async processAssistantQuery(query) {
        const agent = this.agents.assistant;
        if (!agent.isEnabled()) {
            return { error: 'Asistente deshabilitado' };
        }

        agent.observe({
            coins: Store.getState().coins,
            favoriteCoins: this._getFavoriteCoinsWithData()
        });

        return await agent.process(query);
    }

    _onCoinsUpdated(coins) {
        if (this.isRunning) {
            this.runAgent('market', { coins });
            this.runAgent('alert', { coins });
        }
    }

    _onViewChanged(view) {
        switch (view) {
            case VIEW_NAMES.DASHBOARD:
                this.runAgent('market');
                break;
            case VIEW_NAMES.FAVORITES:
                this.runPortfolioAnalysis();
                break;
        }
    }

    async runPortfolioAnalysis() {
        const favoriteIds = Favorites.getAll();
        if (favoriteIds.length === 0) return;

        try {
            const coins = await CryptoService.fetchCoins({
                ids: favoriteIds.join(','),
                order: 'market_cap_desc'
            });
            this.runAgent('portfolio', { favoriteCoins: coins });
        } catch (error) {
            this._log('Error cargando favoritos:', error.message);
        }
    }

    _getFavoriteCoinsWithData() {
        const favoriteIds = Favorites.getAll();
        const allCoins = Store.getState().coins;
        return allCoins.filter(coin => favoriteIds.includes(coin.id));
    }

    getAgent(agentName) {
        return this.agents[agentName] || null;
    }

    getAllAgents() {
        return Object.fromEntries(
            Object.entries(this.agents).map(([name, agent]) => [name, agent.getState()])
        );
    }

    enableAgent(agentName) {
        const agent = this.agents[agentName];
        if (agent) {
            agent.enable();
            this._log(`Agente habilitado: ${agentName}`);
        }
    }

    disableAgent(agentName) {
        const agent = this.agents[agentName];
        if (agent) {
            agent.disable();
            this._log(`Agente deshabilitado: ${agentName}`);
        }
    }

    getMarketSignals() {
        const marketAgent = this.agents.market;
        return {
            signals: marketAgent?.getSignals() || {},
            summary: marketAgent?.getSummary() || null
        };
    }

    getAlerts() {
        return this.agents.alert.getAlerts();
    }

    getPortfolioSummary() {
        return this.agents.portfolio.getSummary();
    }

    getInsights() {
        return this.agents.portfolio.getInsights();
    }

    addAlert(alertData) {
        return this.agents.alert.addAlert(alertData);
    }

    removeAlert(alertId) {
        return this.agents.alert.removeAlert(alertId);
    }

    toggleAlert(alertId) {
        return this.agents.alert.toggleAlert(alertId);
    }

    getEventLog() {
        return [...this.eventLog];
    }

    _logAgentResult(result) {
        this._addEvent({
            type: 'result',
            agent: result.agent,
            timestamp: Date.now()
        });
    }

    _logAgentError(error) {
        this._addEvent({
            type: 'error',
            agent: error.agent || 'unknown',
            error: error.message,
            timestamp: Date.now()
        });
    }

    _addEvent(event) {
        this.eventLog.push(event);
        if (this.eventLog.length > 100) {
            this.eventLog = this.eventLog.slice(-100);
        }
        this.emit('event', event);
    }

    getSystemStatus() {
        return {
            orchestrator: {
                running: this.isRunning,
                uptime: this.lastRun ? Date.now() - this.lastRun : 0
            },
            agents: this.getAllAgents(),
            memory: {
                eventLogSize: this.eventLog.length
            }
        };
    }
}

window.OrchestratorAgent = OrchestratorAgent;
