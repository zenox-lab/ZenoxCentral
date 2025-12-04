window.DashboardModule = {
    render() {
        const trades = Store.getTrades();
        const expenses = Store.getExpenses();
        const habits = Store.getHabits();

        // --- Stats Calculations ---

        // 1. Expenses (Current Month)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
        const totalExpenses = currentMonthExpenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
        const expensesCount = currentMonthExpenses.length;

        // 2. Trades (Today)
        const today = new Date().toISOString().split('T')[0];
        const todayTrades = trades.filter(t => t.date === today);
        const todayProfit = todayTrades.reduce((acc, t) => acc + parseFloat(t.result), 0);
        const tradesCount = todayTrades.length;

        // 3. Habits (Today's Completion)
        let habitsCompletion = 0;
        if (habits.length > 0) {
            const completedToday = habits.filter(h => h.history && h.history[today]).length;
            habitsCompletion = Math.round((completedToday / habits.length) * 100);
        }

        // 4. Wallet (Total Equity)
        let walletTotal = 0;
        let walletCount = 0;
        // Ensure WalletModule data is loaded
        if (window.WalletModule && window.WalletModule.data) {
            const walletData = window.WalletModule.data;
            if (walletData.assets) {
                walletTotal = walletData.assets.reduce((acc, asset) => {
                    const price = asset.lastPrice || asset.entryPrice || 0;
                    return acc + (price * asset.quantity);
                }, 0);
                walletCount = walletData.assets.length;
            }
        }

        return `
            <div class="animate-fade-in space-y-8">
                
                <!-- Top Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <!-- Expenses Card -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group h-32">
                        <div class="flex justify-between items-start z-10">
                            <div>
                                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gastos do Mês</p>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">R$ ${Store.formatCurrency(totalExpenses)}</h3>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
                                <i class="fa-solid fa-wallet text-lg"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 z-10">${expensesCount} despesas registradas</p>
                        
                        <!-- Background Decoration -->
                        <div class="absolute -bottom-4 -right-4 text-orange-500/5 dark:text-orange-500/10 transform rotate-12">
                            <i class="fa-solid fa-wallet text-8xl"></i>
                        </div>
                    </div>

                    <!-- Trades Card -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group h-32">
                        <div class="flex justify-between items-start z-10">
                            <div>
                                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trades Hoje</p>
                                <h3 class="text-2xl font-bold ${todayProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'} mt-1">$ ${Store.formatCurrency(todayProfit)}</h3>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <i class="fa-solid fa-chart-line text-lg"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 z-10">${tradesCount} operações realizadas</p>

                        <!-- Background Decoration -->
                        <div class="absolute -bottom-4 -right-4 text-blue-500/5 dark:text-blue-500/10 transform rotate-12">
                            <i class="fa-solid fa-chart-line text-8xl"></i>
                        </div>
                    </div>

                    <!-- Habits Card -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group h-32">
                        <div class="flex justify-between items-start z-10">
                            <div>
                                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hábitos</p>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">${habitsCompletion}%</h3>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <i class="fa-solid fa-check-circle text-lg"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 z-10">Conclusão diária</p>

                        <!-- Background Decoration -->
                        <div class="absolute -bottom-4 -right-4 text-emerald-500/5 dark:text-emerald-500/10 transform rotate-12">
                            <i class="fa-solid fa-check-circle text-8xl"></i>
                        </div>
                    </div>

                    <!-- Investments Card (NEW) -->
                    <div onclick="document.getElementById('investments-section').scrollIntoView({behavior: 'smooth'})" class="cursor-pointer bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group h-32 hover:border-purple-500/50 transition-all">
                        <div class="flex justify-between items-start z-10">
                            <div>
                                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Investimentos</p>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">$ ${Store.formatCurrency(walletTotal)}</h3>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-500">
                                <i class="fa-solid fa-chart-pie text-lg"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 z-10">${walletCount} ativos em carteira</p>
                        
                        <!-- Background Decoration -->
                        <div class="absolute -bottom-4 -right-4 text-purple-500/5 dark:text-purple-500/10 transform rotate-12">
                            <i class="fa-solid fa-chart-pie text-8xl"></i>
                        </div>
                    </div>

                </div>

                <!-- Shortcuts Section -->
                <div>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Atalhos Rápidos</h2>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        
                        <!-- Financeiro -->
                        <button onclick="router.navigate('expenses')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-zenox-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-zenox-primary/10 transition-colors">
                                <i class="fa-solid fa-wallet text-gray-400 dark:text-gray-500 group-hover:text-zenox-primary transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Financeiro</span>
                        </button>

                        <!-- Diário de Trade -->
                        <button onclick="router.navigate('trades')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                                <i class="fa-solid fa-chart-candlestick text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Diário de Trade</span>
                        </button>

                        <!-- Hábitos -->
                        <button onclick="router.navigate('habits')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                <i class="fa-solid fa-list-check text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Hábitos</span>
                        </button>

                        <!-- Anotações -->
                        <button onclick="router.navigate('notes')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-zenox-secondary/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-zenox-secondary/10 transition-colors">
                                <i class="fa-solid fa-note-sticky text-gray-400 dark:text-gray-500 group-hover:text-zenox-secondary transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Anotações</span>
                        </button>

                         <!-- Estratégias -->
                        <button onclick="router.navigate('strategies')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-zenox-accent/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-zenox-accent/10 transition-colors">
                                <i class="fa-solid fa-bullseye text-gray-400 dark:text-gray-500 group-hover:text-zenox-accent transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Estratégias</span>
                        </button>

                        <!-- Checklist -->
                        <button onclick="router.navigate('checklist')" class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:border-pink-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                <i class="fa-solid fa-clipboard-list text-gray-400 dark:text-gray-500 group-hover:text-pink-500 transition-colors text-lg"></i>
                            </div>
                            <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Checklist</span>
                        </button>

                    </div>
                </div>

                <!-- Investments Section (NEW) -->
                <div id="investments-section" class="pt-8 border-t border-gray-200 dark:border-white/5">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Carteira de Investimentos</h2>
                        <button onclick="router.navigate('wallet')" class="text-sm text-zenox-primary hover:underline">Ver Detalhes Completos</button>
                    </div>
                    ${window.WalletModule ? window.WalletModule.renderPortfolio() : '<p class="text-gray-500">Carregando carteira...</p>'}
                </div>

            </div>
        `;
    },

    afterRender() {
        if (window.WalletModule) {
            window.WalletModule.renderSectorChart();
        }
    }
};
