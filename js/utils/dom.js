const DOM = {
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    createElement(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'class') {
                el.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    el.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (key.startsWith('aria') || key.startsWith('data') || key === 'role' || key === 'for') {
                el.setAttribute(key, value);
            } else if (key === 'src' || key === 'href') {
                el.setAttribute(key, value);
            } else {
                el[key] = value;
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });

        return el;
    },

    clearElement(el) {
        if (el) el.innerHTML = '';
    },

    addClass(el, ...classes) {
        if (el) el.classList.add(...classes);
    },

    removeClass(el, ...classes) {
        if (el) el.classList.remove(...classes);
    },

    toggleClass(el, className, force) {
        if (el) el.classList.toggle(className, force);
    },

    show(el) {
        if (el) el.classList.remove('hidden');
    },

    hide(el) {
        if (el) el.classList.add('hidden');
    },

    on(el, event, handler, options) {
        if (el) el.addEventListener(event, handler, options);
    },

    off(el, event, handler, options) {
        if (el) el.removeEventListener(event, handler, options);
    },

    delegate(parent, selector, event, handler, options) {
        if (parent) {
            parent.addEventListener(event, (e) => {
                const target = e.target.closest(selector);
                if (target) handler.call(target, e, target);
            }, options);
        }
    },

    html(strings, ...values) {
        return strings.reduce((result, str, i) => {
            return result + str + (values[i] !== undefined ? values[i] : '');
        }, '');
    }
};

window.DOM = DOM;
Object.freeze(DOM);