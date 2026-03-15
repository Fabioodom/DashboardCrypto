window.ErrorHandler = {
    handle(error, context = '') {
        const errorInfo = this._parseError(error, context);
        Metrics.logError(errorInfo);
        console.error(`[ErrorHandler] ${context}:`, errorInfo);
        return errorInfo;
    },

    _parseError(error, context) {
        let type = 'UNKNOWN';
        let message = 'Error desconocido';
        let code = null;

        if (error.name === 'TypeError') {
            type = 'NETWORK';
            message = 'Error de conexión';
        } else if (error.name === 'SyntaxError') {
            type = 'PARSE';
            message = 'Error al procesar datos';
        } else if (error.status === 429) {
            type = 'RATE_LIMIT';
            message = 'Límite de peticiones alcanzado';
        } else if (error.status === 404) {
            type = 'NOT_FOUND';
            message = 'Recurso no encontrado';
        } else if (error.status >= 500) {
            type = 'SERVER';
            message = 'Error del servidor';
        } else if (error.status === 401) {
            type = 'AUTH';
            message = 'Error de autenticación';
        } else if (error.message) {
            message = error.message;
        }

        return {
            type,
            message,
            code: error.status || error.code || null,
            context,
            timestamp: new Date().toISOString(),
            original: error.message
        };
    },

    getUserMessage(errorInfo) {
        const messages = {
            NETWORK: 'No se pudo conectar al servidor. Verifica tu conexión.',
            PARSE: 'Hubo un problema al procesar los datos.',
            RATE_LIMIT: 'Demasiadas peticiones. Espera un momento.',
            NOT_FOUND: 'No se encontró la información solicitada.',
            SERVER: 'El servicio no está disponible temporalmente.',
            AUTH: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
            UNKNOWN: 'Ocurrió un error inesperado.'
        };
        return messages[errorInfo.type] || messages.UNKNOWN;
    },

    showUser(error, context = '') {
        const errorInfo = this.handle(error, context);
        Toast.show(this.getUserMessage(errorInfo), 'error');
    },

    isRetryable(error) {
        const retryableTypes = ['NETWORK', 'SERVER', 'RATE_LIMIT'];
        return retryableTypes.includes(error.type);
    },

    retryConfig(maxRetries = 3, baseDelay = 1000) {
        return { maxRetries, baseDelay };
    },

    async withRetry(fn, config = {}) {
        const { maxRetries = 3, baseDelay = 1000 } = config;
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                const errorInfo = this.handle(error, 'retry');
                
                if (!this.isRetryable(errorInfo)) {
                    throw error;
                }

                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        throw lastError;
    }
};