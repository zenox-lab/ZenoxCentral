const AuthModule = {
    renderContent() {
        return `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white" id="auth-title">Login</h3>
                <button onclick="AuthModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <form id="auth-form" onsubmit="AuthModule.handleSubmit(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" name="email" required class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-zenox-primary focus:ring-1 focus:ring-zenox-primary transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                    <input type="password" name="password" required class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-zenox-primary focus:ring-1 focus:ring-zenox-primary transition-all">
                </div>

                <div id="auth-error" class="hidden text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20"></div>

                <button type="submit" id="auth-submit-btn" class="w-full py-3 bg-zenox-primary hover:bg-zenox-primary/90 text-white rounded-xl font-bold shadow-lg shadow-zenox-primary/20 transition-all flex items-center justify-center gap-2">
                    <span>Entrar</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>

            <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <span id="auth-switch-text">Não tem uma conta?</span>
                <button onclick="AuthModule.toggleMode()" class="text-zenox-primary font-bold hover:underline ml-1" id="auth-switch-btn">Criar conta</button>
            </div>
        `;
    },

    isLoginMode: true,

    openModal() {
        const modal = document.getElementById('auth-modal');
        const content = document.getElementById('auth-modal-content');

        if (modal && content) {
            // Inject content
            content.innerHTML = this.renderContent();
            this.isLoginMode = true; // Reset to login mode

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }, 10);
        }
    },

    closeModal() {
        const modal = document.getElementById('auth-modal');
        const content = document.getElementById('auth-modal-content');
        if (modal && content) {
            modal.classList.add('opacity-0');
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                content.innerHTML = ''; // Clear content
            }, 300);
        }
    },

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const switchText = document.getElementById('auth-switch-text');
        const switchBtn = document.getElementById('auth-switch-btn');

        if (this.isLoginMode) {
            title.textContent = 'Login';
            submitBtn.innerHTML = '<span>Entrar</span><i class="fa-solid fa-arrow-right"></i>';
            switchText.textContent = 'Não tem uma conta?';
            switchBtn.textContent = 'Criar conta';
        } else {
            title.textContent = 'Criar Conta';
            submitBtn.innerHTML = '<span>Cadastrar</span><i class="fa-solid fa-user-plus"></i>';
            switchText.textContent = 'Já tem uma conta?';
            switchBtn.textContent = 'Fazer login';
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const errorDiv = document.getElementById('auth-error');

        try {
            if (!auth) throw new Error("Firebase não inicializado. Verifique as chaves.");

            if (this.isLoginMode) {
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                await auth.createUserWithEmailAndPassword(email, password);
            }
            this.closeModal();
            // Store will handle auth state change
        } catch (error) {
            console.error("Auth Error:", error);
            errorDiv.textContent = this.getErrorMessage(error.code);
            errorDiv.classList.remove('hidden');
        }
    },

    getErrorMessage(code) {
        switch (code) {
            case 'auth/invalid-email': return 'Email inválido.';
            case 'auth/user-disabled': return 'Usuário desativado.';
            case 'auth/user-not-found': return 'Usuário não encontrado.';
            case 'auth/wrong-password': return 'Senha incorreta.';
            case 'auth/email-already-in-use': return 'Email já está em uso.';
            case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
            default: return 'Ocorreu um erro. Tente novamente.';
        }
    },

    logout() {
        if (auth) {
            auth.signOut();
        }
        localStorage.removeItem('zenox_access_granted');
        window.location.href = 'login.html';
    },

    handleAuthClick() {
        if (Store.currentUser) {
            if (confirm('Deseja sair da sua conta?')) {
                this.logout();
            }
        } else {
            this.openModal();
        }
    }
};

window.AuthModule = AuthModule;
