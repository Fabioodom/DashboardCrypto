class AlertAgent extends BaseAgent {
    constructor() {
        super('AlertAgent', AGENT_CONFIG.ALERT_AGENT);
        this.alerts = [];
        this.triggeredAlerts = [];
        this.coins = [];
    }

    init() {
        super.init();
        this._loadAlerts();
        return this;
    }

    observe(context = {}) {
        super.observe(context);
        this.coins = context.coins || Store.getState().coins;
        return this;
    }

    analyze(context = {}) {
        super.analyze(context);
        
        if (!this.coins || this.coins.length === 0 || this.alerts.length === 0) {
            return { triggered: [], pending: this.alerts };
        }

        const triggered = [];
        const pending = [];

        this.alerts.forEach(alert => {
            const coin = this.coins.find(c => c.id === alert.coinId || c.symbol?.toLowerCase() === alert.coinId?.toLowerCase());
            
            if (!coin) {
                pending.push(alert);
                return;
            }

            const price = coin.current_price;
            const change24h = coin.price_change_percentage_24h || 0;
            
            let triggeredNow = false;
            let triggerReason = null;

            switch (alert.type) {
                case 'above_price':
                    if (price >= alert.targetValue) {
                        triggeredNow = true;
                        triggerReason = `Precio ${Formatters.formatCurrency(price)} ha superado ${Formatters.formatCurrency(alert.targetValue)}`;
                    }
                    break;

                case 'below_price':
                    if (price <= alert.targetValue) {
                        triggeredNow = true;
                        triggerReason = `Precio ${Formatters.formatCurrency(price)} ha caído por debajo de ${Formatters.formatCurrency(alert.targetValue)}`;
                    }
                    break;

                case 'percent_gain':
                    if (change24h >= alert.targetValue) {
                        triggeredNow = true;
                        triggerReason = `Ganancia de ${change24h.toFixed(2)}% ha alcanzado o superado el objetivo de +${alert.targetValue}%`;
                    }
                    break;

                case 'percent_loss':
                    if (change24h <= -alert.targetValue) {
                        triggeredNow = true;
                        triggerReason = `Pérdida de ${Math.abs(change24h).toFixed(2)}% ha alcanzado o superado el límite de -${alert.targetValue}%`;
                    }
                    break;
            }

            if (triggeredNow) {
                if (!alert.lastTriggered || Date.now() - alert.lastTriggered > 300000) {
                    const triggeredAlert = {
                        ...alert,
                        triggeredAt: Date.now(),
                        reason: triggerReason,
                        coinData: {
                            price,
                            change24h,
                            name: coin.name,
                            symbol: coin.symbol?.toUpperCase(),
                            image: coin.image
                        }
                    };
                    triggered.push(triggeredAlert);
                    alert.lastTriggered = Date.now();
                    this._saveAlerts();
                }
                pending.push(alert);
            } else {
                pending.push(alert);
            }
        });

        this.triggeredAlerts = triggered;

        return { triggered, pending };
    }

    decide(context) {
        super.decide(context);
        return {
            shouldNotify: this.triggeredAlerts.length > 0,
            alertCount: this.triggeredAlerts.length
        };
    }

    act() {
        super.act();
        
        this.triggeredAlerts.forEach(alert => {
            this.emit('alertTriggered', alert);
            Toast.show(alert.reason, alert.type.includes('loss') ? 'warning' : 'success');
            Metrics.increment('alerts_triggered');
        });

        const result = this._createResult('alert_check', {
            triggered: this.triggeredAlerts,
            pending: this.alerts.length,
            timestamp: Date.now()
        });

        return result;
    }

    async run(context = {}) {
        this.observe(context);
        const analysis = this.analyze(context);
        const decision = this.decide(context);
        return this.act();
    }

    addAlert(alertData) {
        if (this.alerts.length >= AGENT_CONFIG.ALERT_AGENT.maxAlerts) {
            throw new Error(`Máximo de ${AGENT_CONFIG.ALERT_AGENT.maxAlerts} alertas permitidas`);
        }

        const alert = {
            id: this._generateId(),
            coinId: alertData.coinId,
            coinName: alertData.coinName || alertData.coinId,
            type: alertData.type,
            targetValue: parseFloat(alertData.targetValue),
            createdAt: Date.now(),
            lastTriggered: null,
            active: true
        };

        if (!this._validateAlert(alert)) {
            throw new Error('Datos de alerta inválidos');
        }

        this.alerts.push(alert);
        this._saveAlerts();
        Metrics.increment('alerts_created');

        this.emit('alertAdded', alert);
        return alert;
    }

    removeAlert(alertId) {
        const index = this.alerts.findIndex(a => a.id === alertId);
        if (index === -1) {
            throw new Error('Alerta no encontrada');
        }

        const removed = this.alerts.splice(index, 1)[0];
        this._saveAlerts();
        Metrics.increment('alerts_removed');

        this.emit('alertRemoved', removed);
        return removed;
    }

    updateAlert(alertId, updates) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            throw new Error('Alerta no encontrada');
        }

        Object.assign(alert, updates, { updatedAt: Date.now() });
        
        if (!this._validateAlert(alert)) {
            throw new Error('Datos de alerta inválidos');
        }

        this._saveAlerts();
        this.emit('alertUpdated', alert);
        return alert;
    }

    toggleAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            throw new Error('Alerta no encontrada');
        }

        alert.active = !alert.active;
        alert.updatedAt = Date.now();
        this._saveAlerts();
        this.emit('alertToggled', alert);
        return alert;
    }

    getAlerts(includeInactive = false) {
        if (includeInactive) {
            return [...this.alerts];
        }
        return this.alerts.filter(a => a.active);
    }

    getAlert(alertId) {
        return this.alerts.find(a => a.id === alertId);
    }

    getTriggeredAlerts() {
        return [...this.triggeredAlerts];
    }

    clearTriggeredAlerts() {
        this.triggeredAlerts = [];
    }

    _validateAlert(alert) {
        if (!alert.coinId || alert.coinId.trim() === '') return false;
        if (!['above_price', 'below_price', 'percent_gain', 'percent_loss'].includes(alert.type)) return false;
        if (isNaN(alert.targetValue) || alert.targetValue <= 0) return false;
        return true;
    }

    _loadAlerts() {
        this.alerts = Storage.get('cv_alerts', []);
    }

    _saveAlerts() {
        Storage.set('cv_alerts', this.alerts);
    }

    getAlertTypes() {
        return [
            { value: 'above_price', label: 'Precio sube de', icon: '↑' },
            { value: 'below_price', label: 'Precio cae de', icon: '↓' },
            { value: 'percent_gain', label: 'Ganancia % igual o mayor a', icon: '+%' },
            { value: 'percent_loss', label: 'Pérdida % igual o mayor a', icon: '-%' }
        ];
    }

    getActiveCount() {
        return this.alerts.filter(a => a.active).length;
    }

    exportAlerts() {
        return JSON.stringify(this.alerts, null, 2);
    }

    importAlerts(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!Array.isArray(imported)) {
                throw new Error('Formato inválido');
            }

            imported.forEach(alert => {
                if (this._validateAlert(alert)) {
                    alert.id = this._generateId();
                    alert.createdAt = Date.now();
                    alert.lastTriggered = null;
                    alert.active = true;
                    this.alerts.push(alert);
                }
            });

            this._saveAlerts();
            return imported.length;
        } catch (error) {
            throw new Error('Error al importar alertas: ' + error.message);
        }
    }
}

window.AlertAgent = AlertAgent;
