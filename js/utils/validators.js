const Validators = {
    required(value, message = 'Este campo es obligatorio') {
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, message };
        }
        return { valid: true };
    },

    minLength(value, min, message = null) {
        const msg = message || `Mínimo ${min} caracteres`;
        if (!value || value.length < min) {
            return { valid: false, message: msg };
        }
        return { valid: true };
    },

    maxLength(value, max, message = null) {
        const msg = message || `Máximo ${max} caracteres`;
        if (value && value.length > max) {
            return { valid: false, message: msg };
        }
        return { valid: true };
    },

    email(value, message = 'Email inválido') {
        if (!value) return { valid: true };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return { valid: emailRegex.test(value), message };
    },

    validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        for (const [field, validators] of Object.entries(rules)) {
            const value = formData[field];
            
            for (const validator of validators) {
                const result = validator(value);
                if (!result.valid) {
                    errors[field] = result.message;
                    isValid = false;
                    break;
                }
            }
        }

        return { valid: isValid, errors };
    },

    username(value) {
        const checks = [
            Validators.required(value, 'El usuario es obligatorio'),
            Validators.minLength(value, 3, 'El usuario debe tener al menos 3 caracteres')
        ];
        
        for (const check of checks) {
            if (!check.valid) return check;
        }
        return { valid: true };
    },

    password(value) {
        const checks = [
            Validators.required(value, 'La contraseña es obligatoria'),
            Validators.minLength(value, 4, 'La contraseña debe tener al menos 4 caracteres')
        ];
        
        for (const check of checks) {
            if (!check.valid) return check;
        }
        return { valid: true };
    },

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '')
            .trim();
    },

    isPositiveNumber(value) {
        const num = Number(value);
        return !isNaN(num) && num > 0;
    },

    isValidCoinId(value) {
        if (!value || typeof value !== 'string') return false;
        return /^[a-z0-9-]+$/.test(value);
    }
};

window.Validators = Validators;