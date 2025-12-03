window.router = {
    routes: {
        'dashboard': window.DashboardModule,
        'trades': window.TradesModule,
        'equity': window.EquityModule,
        'analysis': window.AnalysisModule,
        'wallet': window.WalletModule,
        'strategies': window.StrategiesModule,
        'checklist': window.ChecklistModule,
        'expenses': window.ExpensesModule,
        'habits': window.HabitsModule,
        'notes': window.NotesModule
    },

    init() {
        // Handle navigation
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    navigate(route) {
        window.location.hash = route;
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const module = this.routes[hash];

        // Update Sidebar
        document.querySelectorAll('.nav-item').forEach(el => {
            // Reset to default state
            el.classList.remove('bg-gray-100', 'dark:bg-white/5', 'text-zenox-primary', 'dark:text-white');
            el.classList.add('text-gray-700', 'dark:text-gray-400');

            // Apply active state
            if (el.dataset.target === hash) {
                el.classList.remove('text-gray-700', 'dark:text-gray-400');
                el.classList.add('bg-gray-100', 'dark:bg-white/5', 'text-zenox-primary', 'dark:text-white');
            }
        });

        // Update Mobile Navigation
        document.querySelectorAll('.mobile-nav-item').forEach(el => {
            el.classList.remove('active', 'text-zenox-primary', 'dark:text-white');
            el.classList.add('text-gray-400', 'dark:text-gray-500');

            if (el.dataset.target === hash) {
                el.classList.add('active', 'text-zenox-primary', 'dark:text-white');
                el.classList.remove('text-gray-400', 'dark:text-gray-500');
            }
        });

        // Handle Trading Submenu State
        const tradingRoutes = ['trades', 'equity', 'analysis', 'wallet', 'strategies', 'checklist'];
        const submenu = document.getElementById('trading-submenu');
        const chevron = document.getElementById('trading-chevron');
        const tradingBtn = document.getElementById('trading-menu-btn');

        if (submenu && chevron && tradingBtn) {
            if (tradingRoutes.includes(hash)) {
                submenu.classList.remove('hidden');
                chevron.style.transform = 'rotate(180deg)';
                tradingBtn.classList.add('text-blue-500', 'dark:text-white');
                tradingBtn.classList.remove('text-gray-700', 'dark:text-gray-400');
            } else {
                tradingBtn.classList.remove('text-blue-500', 'dark:text-white');
                tradingBtn.classList.add('text-gray-700', 'dark:text-gray-400');
            }
        }

        const container = document.getElementById('app-container');
        if (module) {
            try {
                container.innerHTML = module.render();
                if (module.afterRender) module.afterRender();
            } catch (error) {
                console.error('Error rendering module:', error);
                container.innerHTML = `
                    <div class="p-8 text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                            <i class="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Erro ao carregar módulo</h2>
                        <p class="text-gray-500 dark:text-gray-400 mb-4">Ocorreu um erro ao tentar exibir esta página.</p>
                        <pre class="text-left bg-gray-100 dark:bg-black/50 p-4 rounded-lg overflow-x-auto text-xs text-red-500 font-mono mb-4">
${error.stack || error.message}
                        </pre>
                        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Recarregar Página
                        </button>
                    </div>
                `;
            }
        } else {
            // Placeholder for new routes
            // Placeholder for new routes
            container.innerHTML = '<h1 class="text-2xl font-bold text-gray-800 dark:text-white">404 - Página não encontrada</h1>';
        }
    }
};

// Global function for onclick
window.toggleTradingMenu = function () {
    const submenu = document.getElementById('trading-submenu');
    const chevron = document.getElementById('trading-chevron');
    if (submenu && chevron) {
        submenu.classList.toggle('hidden');

        if (submenu.classList.contains('hidden')) {
            chevron.style.transform = 'rotate(0deg)';
        } else {
            chevron.style.transform = 'rotate(180deg)';
        }
    }
};

window.toggleMobileMenu = function (forceClose = null) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar || !overlay) return;

    const isClosed = sidebar.classList.contains('-translate-x-full');
    const shouldOpen = forceClose === null ? isClosed : !forceClose;

    if (shouldOpen) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
};

window.toggleTheme = function () {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
};

// Initialize App
// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Store (and Firebase) to initialize
    if (window.Store) {
        await window.Store.init();
    }

    if (window.router) {
        window.router.init();
    } else {
        console.error('Router not initialized!');
    }
});
