window.LoginPage = {
    form: null,
    usernameInput: null,
    passwordInput: null,
    submitBtn: null,
    usernameError: null,
    passwordError: null,

    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.form = DOM.$('#login-form');
        this.usernameInput = DOM.$('#username');
        this.passwordInput = DOM.$('#password');
        this.submitBtn = DOM.$('#login-submit');
        this.usernameError = DOM.$('#username-error');
        this.passwordError = DOM.$('#password-error');
        this.rememberCheckbox = DOM.$('#remember');
    },

    bindEvents() {
        DOM.on(this.form, 'submit', (e) => this.handleSubmit(e));
        
        DOM.on(this.usernameInput, 'input', () => this.clearErrors());
        DOM.on(this.passwordInput, 'input', () => this.clearErrors());
        
        DOM.on(this.usernameInput, 'blur', () => this.validateField('username'));
        DOM.on(this.passwordInput, 'blur', () => this.validateField('password'));
    },

    async handleSubmit(e) {
        e.preventDefault();
        this.clearErrors();
        
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        const remember = this.rememberCheckbox?.checked || false;

        const validation = Validators.validateForm(
            { username, password },
            {
                username: [Validators.required, Validators.username],
                password: [Validators.required, Validators.password]
            }
        );

        if (!validation.valid) {
            this.showErrors(validation.errors);
            return;
        }

        this.setLoading(true);

        try {
            await AuthService.login(username, password, remember);
            Toast.show('Bienvenido a CryptoVision', 'success');
            Router.navigate(VIEW_NAMES.DASHBOARD);
        } catch (error) {
            this.showSubmitError(error.message);
        } finally {
            this.setLoading(false);
        }
    },

    validateField(field) {
        const value = field === 'username' ? this.usernameInput.value : this.passwordInput.value;
        const validator = field === 'username' ? Validators.username : Validators.password;
        const result = validator(value);
        
        if (!result.valid) {
            this.showError(field, result.message);
            return false;
        }
        return true;
    },

    showErrors(errors) {
        if (errors.username) this.showError('username', errors.username);
        if (errors.password) this.showError('password', errors.password);
    },

    showError(field, message) {
        if (field === 'username') {
            this.usernameInput.classList.add('error');
            this.usernameError.textContent = message;
        } else if (field === 'password') {
            this.passwordInput.classList.add('error');
            this.passwordError.textContent = message;
        }
    },

    showSubmitError(message) {
        Toast.show(message, 'error');
    },

    clearErrors() {
        this.usernameInput.classList.remove('error');
        this.passwordInput.classList.remove('error');
        this.usernameError.textContent = '';
        this.passwordError.textContent = '';
    },

    setLoading(loading) {
        this.submitBtn.disabled = loading;
        this.submitBtn.textContent = loading ? 'Iniciando...' : 'Iniciar Sesión';
    },

    show() {
        DOM.$('#login-view').classList.remove('hidden');
    },

    hide() {
        DOM.$('#login-view').classList.add('hidden');
    }
};