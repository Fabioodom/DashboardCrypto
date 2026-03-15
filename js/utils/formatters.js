const Formatters = {
    currency(value, currency = 'USD', compact = false) {
        if (value === null || value === undefined) return '-';
        
        const options = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: compact ? 0 : 2,
            maximumFractionDigits: compact ? 2 : 8
        };

        if (compact && value >= 1e9) {
            options.notation = 'compact';
            options.maximumFractionDigits = 2;
        }

        return new Intl.NumberFormat('en-US', options).format(value);
    },

    number(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    compactNumber(value) {
        if (value === null || value === undefined) return '-';
        
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(2) + 'K';
        }
        return value.toFixed(2);
    },

    percentage(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        const sign = value >= 0 ? '+' : '';
        return sign + value.toFixed(decimals) + '%';
    },

    date(date, format = 'short') {
        if (!date) return '-';
        
        const d = new Date(date);
        
        const formats = {
            short: { month: 'short', day: 'numeric' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };

        return new Intl.DateTimeFormat('es-ES', formats[format] || formats.short).format(d);
    },

    timeAgo(date) {
        if (!date) return '-';
        
        const now = Date.now();
        const past = new Date(date).getTime();
        const diff = now - past;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'recientemente';
    },

    ordinal(number) {
        if (!number) return '-';
        const suffixes = ['mo', 'ro', 'ro', 'ro', 'to', 'to', 'to', 'mo', 'no', 'mo'];
        const suffix = number % 100 > 10 && number % 100 < 14 ? 'mo' : suffixes[number % 10] || 'mo';
        return number + suffix;
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    truncate(str, maxLength = 50) {
        if (!str || str.length <= maxLength) return str;
        return str.slice(0, maxLength - 3) + '...';
    }
};

window.Formatters = Formatters;
Object.freeze(Formatters);