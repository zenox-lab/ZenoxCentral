window.DashboardModule = {
    render() {
        const trades = Store.getTrades();
        const expenses = Store.getExpenses();

        // Calculate Trade Stats
        const totalTrades = trades.length;
        const tradeBalance = trades.reduce((acc, t) => acc + parseFloat(t.result), 0);
        const winRate = totalTrades > 0 ? ((trades.filter(t => t.result > 0).length / totalTrades) * 100).toFixed(1) : 0;

        // Calculate Today and Month Stats
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        const todayProfit = trades
            .filter(t => t.date === today)
            .reduce((acc, t) => acc + parseFloat(t.result), 0);

        const monthProfit = trades
            .filter(t => t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + parseFloat(t.result), 0);

        // Calculate Expenses
        const totalExpenses = expenses
            .filter(e => e.date.startsWith(currentMonth))
            .reduce((acc, e) => acc + parseFloat(e.amount), 0);

        const netResult = monthProfit - totalExpenses;

        return `
            <div class="animate-fade-in space-y-8">


                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Trade Balance -->
                    <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-chart-line text-2xl"></i>
                        </div>
                        <p class="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Resultado Total</p>
                        <h3 class="text-2xl font-bold mt-2 ${tradeBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}">
                            $ ${Store.formatCurrency(tradeBalance)}
                        </h3>
                        <p class="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">Win Rate: <span class="font-bold">${winRate}%</span></p>
                    </div>

                    <!-- Profit Today -->
                    <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-dollar-sign text-2xl"></i>
                        </div>
                        <p class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Lucro Hoje</p>
                        <h3 class="text-2xl font-bold mt-2 ${todayProfit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-rose-600 dark:text-rose-400'}">
                            $ ${Store.formatCurrency(todayProfit)}
                        </h3>
                    </div>

                    <!-- Profit Month -->
                    <div class="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-calendar-check text-2xl"></i>
                        </div>
                        <p class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider">Lucro Mês</p>
                        <h3 class="text-2xl font-bold mt-2 ${monthProfit >= 0 ? 'text-purple-700 dark:text-purple-300' : 'text-rose-600 dark:text-rose-400'}">
                            $ ${Store.formatCurrency(monthProfit)}
                        </h3>
                    </div>


                </div>

                <!-- Recent Activity Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Recent Trades -->
                    <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">Últimos Trades</h3>
                            <button onclick="router.navigate('trades')" class="text-sm text-zenox-primary hover:text-zenox-primary/80 transition-colors">Ver todos</button>
                        </div>
                        <div class="space-y-4">
                            ${trades.slice(0, 5).map(trade => `
                                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg ${trade.result >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'} flex items-center justify-center">
                                            <i class="fa-solid ${trade.result >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 dark:text-white">${trade.asset}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">${trade.date} • ${trade.strategy}</p>
                                        </div>
                                    </div>
                                    <span class="font-mono font-bold ${trade.result >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                                        ${trade.result >= 0 ? '+' : ''}$ ${Store.formatCurrency(trade.result)}
                                    </span>
                                </div>
                            `).join('')}
                            ${trades.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhum trade registrado.</p>' : ''}
                        </div>
                    </div>

                    <!-- Quick Actions & Expenses -->
                    <div class="space-y-6">
                        <!-- Quick Actions -->
                        <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 p-6">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Acesso Rápido</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <button onclick="router.navigate('trades')" class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left group">
                                    <i class="fa-solid fa-plus text-zenox-primary mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                    <p class="font-bold text-gray-800 dark:text-white">Novo Trade</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Registrar operação</p>
                                </button>
                                <button onclick="router.navigate('notes')" class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left group">
                                    <i class="fa-solid fa-note-sticky text-zenox-secondary mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                    <p class="font-bold text-gray-800 dark:text-white">Nova Nota</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Criar anotação</p>
                                </button>
                            </div>
                        </div>

                        <!-- Recent Expenses -->
                        <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Últimas Despesas</h3>
                                <button onclick="router.navigate('expenses')" class="text-sm text-zenox-primary hover:text-zenox-primary/80 transition-colors">Ver todas</button>
                            </div>
                            <div class="space-y-4">
                                ${expenses.slice(0, 3).map(expense => `
                                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <i class="fa-solid fa-receipt"></i>
                                            </div>
                                            <div>
                                                <p class="font-bold text-gray-800 dark:text-white">${expense.description}</p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400">${expense.date}</p>
                                            </div>
                                        </div>
                                        <span class="font-mono font-bold text-gray-800 dark:text-white">
                                            R$ ${Store.formatCurrency(expense.amount)}
                                        </span>
                                    </div>
                                `).join('')}
                                ${expenses.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhuma despesa registrada.</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
