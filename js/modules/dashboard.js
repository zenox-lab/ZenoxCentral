const DashboardModule = {
    render() {
        const trades = Store.getTrades();
        const expenses = Store.getExpenses();

        // Calculate Trade Stats
        const totalTrades = trades.length;
        const tradeBalance = trades.reduce((acc, t) => acc + parseFloat(t.result), 0);
        const winRate = totalTrades > 0 ? ((trades.filter(t => t.result > 0).length / totalTrades) * 100).toFixed(1) : 0;

        // Calculate Finance Stats
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthlyExpenses = expenses
            .filter(e => e.date.startsWith(currentMonth) && e.type === 'expense')
            .reduce((acc, e) => acc + parseFloat(e.amount), 0);

        return `
            <div class="animate-fade-in space-y-8">
                <header>
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                    <p class="text-gray-500 dark:text-gray-400">Visão geral do seu desempenho e finanças.</p>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Trade Balance -->
                    <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-chart-line text-3xl"></i>
                        </div>
                        <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Resultado (Trades)</p>
                        <h3 class="text-3xl font-bold mt-2 ${tradeBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}">
                            R$ ${Store.formatCurrency(tradeBalance)}
                        </h3>
                        <p class="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">Win Rate: <span class="font-bold">${winRate}%</span></p>
                    </div>

                    <!-- Monthly Expenses -->
                    <div class="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-rose-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-wallet text-3xl"></i>
                        </div>
                        <p class="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1 uppercase tracking-wider">Despesas (Mês)</p>
                        <h3 class="text-3xl font-bold mt-2 text-rose-700 dark:text-rose-300">
                            R$ ${Store.formatCurrency(monthlyExpenses)}
                        </h3>
                        <p class="text-xs text-rose-600/70 dark:text-rose-400/70 mt-2">Total de ${expenses.length} registros</p>
                    </div>

                    <!-- Habits Streak (Mock) -->
                    <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div class="absolute top-4 right-4 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-fire text-3xl"></i>
                        </div>
                        <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Hábitos (Streak)</p>
                        <h3 class="text-3xl font-bold mt-2 text-blue-700 dark:text-blue-300">5 Dias</h3>
                        <p class="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">Melhor sequência: 12 dias</p>
                    </div>

                    <!-- Quick Note -->
                    <div class="bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-zenox-primary/50 transition-colors" onclick="router.navigate('notes')">
                        <div class="absolute top-4 right-4 text-gray-400 group-hover:text-zenox-primary transition-colors">
                            <i class="fa-solid fa-plus text-3xl"></i>
                        </div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nova Nota</p>
                        <div class="mt-4 flex items-center gap-2 text-zenox-primary">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span class="font-bold">Criar agora</span>
                        </div>
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
                            ${trades.slice(0, 3).map(trade => `
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
                                        ${trade.result >= 0 ? '+' : ''}R$ ${Store.formatCurrency(trade.result)}
                                    </span>
                                </div>
                            `).join('')}
                            ${trades.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhum trade registrado.</p>' : ''}
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
                                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                            <i class="fa-solid fa-receipt"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 dark:text-white">${expense.description}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">${expense.date} • ${expense.category}</p>
                                        </div>
                                    </div>
                                    <span class="font-mono font-bold ${expense.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}">
                                        ${expense.type === 'income' ? '+' : '-'}R$ ${Store.formatCurrency(expense.amount)}
                                    </span>
                                </div>
                            `).join('')}
                            ${expenses.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhum registro encontrado.</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
