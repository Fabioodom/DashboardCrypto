window.AGENT_CONFIG = {
    MARKET_AGENT: {
        name: 'MarketAgent',
        enabled: true,
        refreshInterval: 60000,
        thresholds: {
            bullish: 2,
            bearish: -2,
            volatile: 5,
            highVolumeMultiplier: 1.5
        }
    },
    ALERT_AGENT: {
        name: 'AlertAgent',
        enabled: true,
        checkInterval: 30000,
        maxAlerts: 50
    },
    PORTFOLIO_AGENT: {
        name: 'PortfolioAgent',
        enabled: true,
        refreshInterval: 120000
    },
    ASSISTANT_AGENT: {
        name: 'AssistantAgent',
        enabled: true,
        intents: [
            'top_subidas',
            'top_bajadas',
            'mayor_volumen',
            'resumen_mercado',
            'resumen_favoritos',
            'buscar',
            'abrir_detalle',
            'mejor_favorita',
            'peor_favorita'
        ]
    },
    ORCHESTRATOR: {
        name: 'OrchestratorAgent',
        enabled: true,
        tickInterval: 30000
    }
};

window.AGENT_SIGNALS = {
    BULLISH: 'bullish',
    BEARISH: 'bearish',
    VOLATILE: 'volatile',
    HIGH_INTEREST: 'high_interest',
    STABLE: 'stable'
};

window.AGENT_TYPES = {
    MARKET: 'market',
    ALERT: 'alert',
    PORTFOLIO: 'portfolio',
    ASSISTANT: 'assistant',
    ORCHESTRATOR: 'orchestrator'
};

Object.freeze(window.AGENT_CONFIG);
Object.freeze(window.AGENT_SIGNALS);
Object.freeze(window.AGENT_TYPES);
