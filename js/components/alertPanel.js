window.AlertPanel = {
    container: null,
    alerts: [],
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.createPanel();
        this.bindEvents();
        this.loadAlerts();
        this.isInitialized = true;
    },

    createPanel() {
        const existing = document.getElementById('alert-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'alert-panel';
        panel.className = 'agent-panel';
        panel.innerHTML = `
            <div class="agent-panel-header">
                <div class="agent-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    Alertas
                    <span class="agent-status">
                        <span class="agent-status-dot"></span>
                        <span id="alert-count-display">0</span> activas
                    </span>
                </div>
            </div>
            <div class="agent-panel-body">
                <div id="alert-list-container">
                    <div class="alert-empty">No tienes alertas configuradas.</div>
                </div>
                <div class="mt-md">
                    <button class="btn btn-outline btn-sm" id="add-alert-btn" style="width: 100%;">+ Nueva Alerta</button>
                </div>
                <div id="alert-form-container" class="add-alert-form mt-md" style="display: none;">
                    <div class="form-group">
                        <label for="alert-coin-input">Criptomoneda</label>
                        <input type="text" id="alert-coin-input" placeholder="Ej: bitcoin" required>
                    </div>
                    <div class="form-group">
                        <label for="alert-type-input">Tipo</label>
                        <select id="alert-type-input">
                            <option value="above_price">Precio sube de $</option>
                            <option value="below_price">Precio cae de $</option>
                            <option value="percent_gain">Ganancia % +</option>
                            <option value="percent_loss">Pérdida % -</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="alert-value-input">Valor</label>
                        <input type="number" id="alert-value-input" placeholder="Ej: 50000" step="any" required>
                    </div>
                    <button class="btn btn-primary btn-sm" id="save-alert-btn" style="width: 100%;">Guardar</button>
                    <button class="btn btn-outline btn-sm mt-md" id="cancel-alert-btn" style="width: 100%;">Cancelar</button>
                </div>
            </div>
        `;

        const dashboardContainer = document.querySelector('#dashboard-view .dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.insertBefore(panel, dashboardContainer.firstChild);
        }

        this.container = document.getElementById('alert-panel');
    },

    bindEvents() {
        const addBtn = document.getElementById('add-alert-btn');
        const cancelBtn = document.getElementById('cancel-alert-btn');
        const saveBtn = document.getElementById('save-alert-btn');
        const formContainer = document.getElementById('alert-form-container');
        const form = document.querySelector('#alert-form-container');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (formContainer) formContainer.style.display = 'block';
                if (addBtn) addBtn.style.display = 'none';
                const coinInput = document.getElementById('alert-coin-input');
                if (coinInput) coinInput.focus();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (formContainer) formContainer.style.display = 'none';
                if (addBtn) addBtn.style.display = 'block';
                const coinInput = document.getElementById('alert-coin-input');
                const valueInput = document.getElementById('alert-value-input');
                if (coinInput) coinInput.value = '';
                if (valueInput) valueInput.value = '';
            });
        }

        if (saveBtn) {
            saveBtn.onclick = () => this.handleSaveAlert();
        }

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleSaveAlert();
            };
        }

        document.getElementById('alert-value-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSaveAlert();
            }
        });
    },

    loadAlerts() {
        this.alerts = JSON.parse(localStorage.getItem('cv_alerts') || '[]');
        this.renderAlerts();
    },

    saveAlerts() {
        localStorage.setItem('cv_alerts', JSON.stringify(this.alerts));
    },

    handleSaveAlert() {
        const coinInput = document.getElementById('alert-coin-input');
        const typeInput = document.getElementById('alert-type-input');
        const valueInput = document.getElementById('alert-value-input');

        const coinId = coinInput.value.trim().toLowerCase();
        const type = typeInput.value;
        const value = valueInput.value;

        if (!coinId || !value) {
            Toast.show('Completa todos los campos', 'warning');
            return;
        }

        const alert = {
            id: `alert_${Date.now()}`,
            coinId: coinId,
            coinName: coinId,
            type: type,
            targetValue: parseFloat(value),
            createdAt: Date.now(),
            active: true
        };

        this.alerts.push(alert);
        this.saveAlerts();
        Metrics.increment('alerts_created');

        Toast.show('Alerta creada', 'success');

        document.getElementById('alert-form-container').style.display = 'none';
        document.getElementById('add-alert-btn').style.display = 'block';
        coinInput.value = '';
        valueInput.value = '';

        this.renderAlerts();
    },

    renderAlerts() {
        const container = document.getElementById('alert-list-container');
        if (!container) return;

        const activeCount = this.alerts.filter(a => a.active).length;
        const countDisplay = document.getElementById('alert-count-display');
        if (countDisplay) countDisplay.textContent = activeCount;

        if (this.alerts.length === 0) {
            container.innerHTML = '<div class="alert-empty">No tienes alertas configuradas.</div>';
            return;
        }

        let html = '';
        this.alerts.forEach(alert => {
            const conditionText = this.getConditionText(alert);
            html += `
                <div class="alert-item ${alert.active ? '' : 'inactive'}">
                    <div class="alert-info">
                        <div class="alert-coin">${alert.coinName || alert.coinId}</div>
                        <div class="alert-condition">${conditionText}</div>
                    </div>
                    <div class="alert-actions">
                        <button class="alert-btn toggle ${alert.active ? 'active' : ''}" data-id="${alert.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2"/>
                            </svg>
                        </button>
                        <button class="alert-btn delete" data-id="${alert.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        container.querySelectorAll('.alert-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => this.deleteAlert(btn.dataset.id));
        });

        container.querySelectorAll('.alert-btn.toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleAlert(btn.dataset.id));
        });
    },

    getConditionText(alert) {
        const types = {
            'above_price': `Precio > $${Formatters.formatNumber(alert.targetValue)}`,
            'below_price': `Precio < $${Formatters.formatNumber(alert.targetValue)}`,
            'percent_gain': `Ganancia >= +${alert.targetValue}%`,
            'percent_loss': `Pérdida >= -${alert.targetValue}%`
        };
        return types[alert.type] || alert.type;
    },

    deleteAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.saveAlerts();
        Metrics.increment('alerts_removed');
        Toast.show('Alerta eliminada', 'success');
        this.renderAlerts();
    },

    toggleAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.active = !alert.active;
            this.saveAlerts();
            this.renderAlerts();
        }
    },

    show() {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    },

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
};
