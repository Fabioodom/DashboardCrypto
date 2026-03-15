window.Toast = {
    container: null,
    timeout: 4000,

    init() {
        this.container = DOM.$('#toast-container');
    },

    show(message, type = 'info', duration = this.timeout) {
        if (!this.container) return;

        const toast = DOM.createElement('div', {
            class: `toast ${type}`,
            role: 'alert',
            ariaLive: 'polite'
        });

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Cerrar">×</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        DOM.on(closeBtn, 'click', () => this.remove(toast));

        this.container.appendChild(toast);

        setTimeout(() => {
            this.remove(toast);
        }, duration);
    },

    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    },

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};