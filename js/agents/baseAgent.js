class BaseAgent {
    constructor(name, config) {
        this.name = name;
        this.config = config || {};
        this.enabled = this.config.enabled !== false;
        this.state = 'idle';
        this.lastRun = null;
        this.results = [];
        this.errors = [];
        this._listeners = new Map();
    }

    init() {
        this.state = 'initialized';
        this._log(`${this.name} inicializado`);
        return this;
    }

    observe(context = {}) {
        this._log(`${this.name} observando contexto:`, Object.keys(context));
        return this;
    }

    analyze(data) {
        this._log(`${this.name} analizando datos`);
        return this;
    }

    decide(context) {
        this._log(`${this.name} tomando decisiones`);
        return this;
    }

    act() {
        this._log(`${this.name} ejecutando acciones`);
        return this;
    }

    async run(context = {}) {
        if (!this.enabled) {
            this._log(`${this.name} está deshabilitado`);
            return null;
        }

        try {
            this.state = 'running';
            const startTime = performance.now();

            this.observe(context);
            const data = this.analyze(context);
            this.decide(context);
            const result = this.act();

            this.lastRun = Date.now();
            this.state = 'idle';
            Metrics.increment(`agent_${this.name.toLowerCase()}_executions`);

            const duration = (performance.now() - startTime).toFixed(2);
            this._log(`${this.name} completado en ${duration}ms`);

            return result;
        } catch (error) {
            this.state = 'error';
            this.errors.push({
                timestamp: Date.now(),
                error: error.message,
                context
            });
            Metrics.increment(`agent_${this.name.toLowerCase()}_errors`);
            ErrorHandler.handle(error, this.name);
            return null;
        }
    }

    enable() {
        this.enabled = true;
        this._log(`${this.name} habilitado`);
    }

    disable() {
        this.enabled = false;
        this._log(`${this.name} deshabilitado`);
    }

    isEnabled() {
        return this.enabled;
    }

    getState() {
        return {
            name: this.name,
            state: this.state,
            enabled: this.enabled,
            lastRun: this.lastRun,
            resultsCount: this.results.length,
            errorsCount: this.errors.length
        };
    }

    getResults() {
        return [...this.results];
    }

    clearResults() {
        this.results = [];
    }

    clearErrors() {
        this.errors = [];
    }

    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
        return () => this._listeners.get(event).delete(callback);
    }

    emit(event, data) {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.forEach(cb => cb(data));
        }
    }

    _log(message, ...args) {
        if (typeof console !== 'undefined') {
            console.log(`[${this.name}] ${message}`, ...args);
        }
    }

    _createResult(type, data, metadata = {}) {
        const result = {
            id: this._generateId(),
            agent: this.name,
            type,
            data,
            timestamp: Date.now(),
            ...metadata
        };
        this.results.push(result);
        this.emit('result', result);
        return result;
    }

    _generateId() {
        return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

window.BaseAgent = BaseAgent;
