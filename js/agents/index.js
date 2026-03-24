window.Agents = {
    MarketAgent: null,
    AlertAgent: null,
    PortfolioAgent: null,
    AssistantAgent: null,
    OrchestratorAgent: null,
    orchestrator: null,

    init() {
        this.OrchestratorAgent = window.OrchestratorAgent;
        this.AlertAgent = window.AlertAgent;
        this.PortfolioAgent = window.PortfolioAgent;
        this.AssistantAgent = window.AssistantAgent;
        this.MarketAgent = window.MarketAgent;

        this.orchestrator = new this.OrchestratorAgent();
        this.orchestrator.init();

        console.log('[Agents] Sistema multiagente inicializado');
        return this;
    },

    start() {
        if (this.orchestrator) {
            this.orchestrator.start();
        }
    },

    stop() {
        if (this.orchestrator) {
            this.orchestrator.stop();
        }
    },

    getOrchestrator() {
        return this.orchestrator;
    },

    getAgent(name) {
        return this.orchestrator?.getAgent(name);
    },

    async runMarketAnalysis() {
        return await this.orchestrator?.runMarketAnalysis();
    },

    async analyzePortfolio() {
        return await this.orchestrator?.runPortfolioAnalysis();
    },

    async checkAlerts() {
        return await this.orchestrator?.checkAlerts();
    },

    async processQuery(query) {
        return await this.orchestrator?.processAssistantQuery(query);
    },

    getMarketSignals() {
        return this.orchestrator?.getMarketSignals();
    },

    getAlerts() {
        return this.orchestrator?.getAlerts();
    },

    getPortfolioSummary() {
        return this.orchestrator?.getPortfolioSummary();
    },

    addAlert(data) {
        return this.orchestrator?.addAlert(data);
    },

    removeAlert(id) {
        return this.orchestrator?.removeAlert(id);
    },

    toggleAlert(id) {
        return this.orchestrator?.toggleAlert(id);
    }
};
