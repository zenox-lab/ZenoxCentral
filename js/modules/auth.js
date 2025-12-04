const AuthModule = {
    renderContent() {
        return `
            <div class="p-8">
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-zenox-primary to-zenox-secondary flex items-center justify-center shadow-lg shadow-zenox-primary/20">
                            <i class="fa-solid fa-user text-white text-lg"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight" id="auth-title">Login</h3>
                    </div>
                    <button onclick="AuthModule.closeModal()" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-white transition-all">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <form id="auth-form" onsubmit="AuthModule.handleSubmit(event)" class="space-y-5">
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Email</label>
                        <div class="relative group">
                            <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zenox-primary transition-colors"></i>
                            <input type="email" name="email" required placeholder="seu@email.com" 
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-zenox-primary focus:ring-2 focus:ring-zenox-primary/20 transition-all">
                        </div>
                    </div>
                    
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Senha</label>
                        <div class="relative group">
                            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zenox-primary transition-colors"></i>
                            <input type="password" name="password" required placeholder="••••••••" 
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-zenox-primary focus:ring-2 focus:ring-zenox-primary/20 transition-all">
                        </div>
                    </div>

                    <div id="auth-error" class="hidden text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 flex items-center gap-3">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <span id="auth-error-msg">Erro</span>
                    </div>

                    <button type="submit" id="auth-submit-btn" 
                        class="w-full py-3.5 bg-gradient-to-r from-zenox-primary to-zenox-secondary hover:from-cyan-400 hover:to-violet-400 text-white rounded-xl font-bold shadow-lg shadow-zenox-primary/25 hover:shadow-zenox-primary/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base">
                        <span>Entrar</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>

                <div class="mt-8 text-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2" id="auth-switch-text">Não tem uma conta?</p>
                    <button onclick="AuthModule.toggleMode()" 
                        class="text-sm font-bold text-zenox-primary hover:text-zenox-secondary transition-colors border border-zenox-primary/20 hover:border-zenox-primary/50 rounded-lg px-4 py-2" 
                        id="auth-switch-btn">
                        Criar conta gratuitamente
                    </button>
                </div>
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
            if (!supabase) throw new Error("Supabase não inicializado. Verifique as chaves.");

            let error;
            if (this.isLoginMode) {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                error = signInError;
            } else {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                error = signUpError;
            }

            if (error) throw error;

            this.closeModal();
            // Store will handle auth state change
        } catch (error) {
            console.error("Auth Error:", error);
            errorDiv.textContent = this.getErrorMessage(error.message || error.code);
            errorDiv.classList.remove('hidden');
        }
    },

    getErrorMessage(code) {
        // Supabase error messages are often plain text, but we can map common ones
        if (code.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
        if (code.includes('User already registered')) return 'Email já está em uso.';
        if (code.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';

        return code || 'Ocorreu um erro. Tente novamente.';
    },

    async logout() {
        if (supabase) {
            await supabase.auth.signOut();
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
