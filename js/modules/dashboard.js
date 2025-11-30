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
                    <h2 class="text-3xl font-bold text-white">Dashboard</h2>
                    <p class="text-gray-400">Visão geral do seu desempenho e finanças.</p>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Trade Balance -->
                    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-chart-line text-6xl text-zenox-primary"></i>
                        </div>
                        <p class="text-sm text-gray-400 font-medium uppercase tracking-wider">Resultado (Trades)</p>
                        <h3 class="text-3xl font-bold mt-2 ${tradeBalance >= 0 ? 'text-zenox-success' : 'text-zenox-accent'}">
                            R$ ${tradeBalance.toFixed(2)}
                        </h3>
                        <p class="text-xs text-gray-500 mt-2">Win Rate: <span class="text-white">${winRate}%</span></p>
                    </div>

                    <!-- Monthly Expenses -->
                    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-wallet text-6xl text-zenox-warning"></i>
                        </div>
                        <p class="text-sm text-gray-400 font-medium uppercase tracking-wider">Despesas (Mês)</p>
                        <h3 class="text-3xl font-bold mt-2 text-white">
                            R$ ${monthlyExpenses.toFixed(2)}
                        </h3>
                        <p class="text-xs text-gray-500 mt-2">Total de ${expenses.length} registros</p>
                    </div>

                    <!-- Habits Streak (Mock) -->
                    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-fire text-6xl text-zenox-accent"></i>
                        </div>
                        <p class="text-sm text-gray-400 font-medium uppercase tracking-wider">Hábitos (Streak)</p>
                        <h3 class="text-3xl font-bold mt-2 text-white">5 Dias</h3>
                        <p class="text-xs text-gray-500 mt-2">Melhor sequência: 12 dias</p>
                    </div>

                    <!-- Quick Note -->
                    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors" onclick="router.navigate('notes')">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-plus text-6xl text-white"></i>
                        </div>
                        <p class="text-sm text-gray-400 font-medium uppercase tracking-wider">Nova Nota</p>
                        <div class="mt-4 flex items-center gap-2 text-zenox-primary">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span class="font-bold">Criar agora</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Recent Trades -->
                    <div class="glass-card rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-white">Últimos Trades</h3>
                            <button onclick="router.navigate('trades')" class="text-sm text-zenox-primary hover:text-white transition-colors">Ver todos</button>
                        </div>
                        <div class="space-y-4">
                            ${trades.slice(0, 3).map(trade => `
                                <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg ${trade.result >= 0 ? 'bg-zenox-success/20 text-zenox-success' : 'bg-zenox-accent/20 text-zenox-accent'} flex items-center justify-center">
                                            <i class="fa-solid ${trade.result >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-white">${trade.asset}</p>
                                            <p class="text-xs text-gray-400">${trade.date} • ${trade.strategy}</p>
                                        </div>
                                    </div>
                                    <span class="font-mono font-bold ${trade.result >= 0 ? 'text-zenox-success' : 'text-zenox-accent'}">
                                        ${trade.result >= 0 ? '+' : ''}R$ ${parseFloat(trade.result).toFixed(2)}
                                    </span>
                                </div>
                            `).join('')}
                            ${trades.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhum trade registrado.</p>' : ''}
                        </div>
                    </div>

                    <!-- Recent Expenses -->
                    <div class="glass-card rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-white">Últimas Despesas</h3>
                            <button onclick="router.navigate('expenses')" class="text-sm text-zenox-primary hover:text-white transition-colors">Ver todas</button>
                        </div>
                        <div class="space-y-4">
                            ${expenses.slice(0, 3).map(expense => `
                                <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-zenox-warning/20 text-zenox-warning flex items-center justify-center">
                                            <i class="fa-solid fa-receipt"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-white">${expense.description}</p>
                                            <p class="text-xs text-gray-400">${expense.date} • ${expense.category}</p>
                                        </div>
                                    </div>
                                    <span class="font-mono font-bold ${expense.type === 'income' ? 'text-zenox-success' : 'text-white'}">
                                        ${expense.type === 'income' ? '+' : '-'}R$ ${parseFloat(expense.amount).toFixed(2)}
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
