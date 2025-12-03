window.EquityModule = {
    render() {
        const trades = Store.getTrades();
        const stats = this.calculateStats(trades);
        const initialBalance = parseFloat(localStorage.getItem('zenox_initial_balance')) || 50000; // Default Prop Account Balance
        const currentBalance = initialBalance + stats.totalProfit;

        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Patrimônio & Performance</h2>
                    <p class="text-gray-500 dark:text-gray-400">Análise completa dos seus resultados</p>
                </div>

                <!-- Top Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Prop Account Balance -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-building-columns text-6xl text-gray-600 dark:text-gray-300"></i>
                        </div>
                        <div class="absolute top-4 right-4 z-10">
                            <button onclick="EquityModule.editBalance()" class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors">
                                <i class="fa-solid fa-gear text-sm"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-lg bg-gray-800 dark:bg-white/20 flex items-center justify-center text-white">
                                <i class="fa-solid fa-dollar-sign text-lg"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo da Conta Prop</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">$${this.formatCurrency(initialBalance)}</h3>
                    </div>

                    <!-- Current Balance -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-wallet text-6xl text-blue-500"></i>
                        </div>
                        <div class="absolute top-4 right-4">
                            <span class="px-2 py-1 rounded text-xs font-bold ${stats.totalProfit >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}">
                                ${stats.returnPercentage}%
                            </span>
                        </div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <i class="fa-solid fa-chart-line text-lg"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">$${this.formatCurrency(currentBalance)}</h3>
                    </div>

                    <!-- Total Profit -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-sack-dollar text-6xl text-emerald-500"></i>
                        </div>
                        <div class="absolute top-4 right-4">
                            <span class="px-2 py-1 rounded text-xs font-bold ${stats.totalProfit >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}">
                                ${stats.returnPercentage}%
                            </span>
                        </div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                                <i class="fa-solid fa-bullseye text-lg"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Lucro Total</span>
                        </div>
                        <h3 class="text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}">$${this.formatCurrency(stats.totalProfit)}</h3>
                    </div>
                </div>

                <!-- Equity Chart -->
                <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Evolução do Patrimônio</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Curva de equity ao longo do tempo</p>
                    </div>
                    <div class="h-80 w-full relative">
                        <canvas id="equityChart"></canvas>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Win Stats -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                                <i class="fa-solid fa-arrow-trend-up text-sm"></i>
                            </div>
                            <h3 class="font-bold text-gray-800 dark:text-white">Estatísticas de Ganhos</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Total de Ganhos</span>
                                <span class="font-bold text-emerald-600 dark:text-emerald-400">${stats.wins}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Ganho Médio</span>
                                <span class="font-bold text-gray-800 dark:text-white">$${this.formatCurrency(stats.avgWin)}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Maior Ganho</span>
                                <span class="font-bold text-emerald-600 dark:text-emerald-400">$${this.formatCurrency(stats.maxWin)}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Soma Total</span>
                                <span class="font-bold text-emerald-600 dark:text-emerald-400">$${this.formatCurrency(stats.grossProfit)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Loss Stats -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                                <i class="fa-solid fa-arrow-trend-down text-sm"></i>
                            </div>
                            <h3 class="font-bold text-gray-800 dark:text-white">Estatísticas de Perdas</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Total de Perdas</span>
                                <span class="font-bold text-red-600 dark:text-red-400">${stats.losses}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Perda Média</span>
                                <span class="font-bold text-gray-800 dark:text-white">$${this.formatCurrency(stats.avgLoss)}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Maior Perda</span>
                                <span class="font-bold text-red-600 dark:text-red-400">$${this.formatCurrency(stats.maxLoss)}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Soma Total</span>
                                <span class="font-bold text-red-600 dark:text-red-400">$${this.formatCurrency(stats.grossLoss)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- General Summary Footer -->
                <div class="bg-gray-900 dark:bg-black/40 p-6 rounded-2xl border border-gray-800 dark:border-white/5">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                            <i class="fa-solid fa-fingerprint text-sm"></i>
                        </div>
                        <h3 class="font-bold text-white">Resumo Geral</h3>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p class="text-xs text-gray-400 mb-1">Total de Operações</p>
                            <p class="text-xl font-bold text-white">${stats.totalOps}</p>
                        </div>
                        <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p class="text-xs text-gray-400 mb-1">Taxa de Acerto</p>
                            <p class="text-xl font-bold text-white">${stats.winRate}%</p>
                        </div>
                        <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p class="text-xs text-gray-400 mb-1">Profit Factor</p>
                            <p class="text-xl font-bold text-white">${stats.profitFactor}</p>
                        </div>
                        <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                            <p class="text-xs text-gray-400 mb-1">Retorno (%)</p>
                            <p class="text-xl font-bold ${stats.returnPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}">${stats.returnPercentage >= 0 ? '+' : ''}${stats.returnPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        this.renderChart();
    },

    calculateStats(trades) {
        let wins = 0;
        let losses = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let maxWin = 0;
        let maxLoss = 0;

        // Sort trades by date ascending for chart
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTrades.forEach(t => {
            const result = parseFloat(t.result);
            if (result >= 0) {
                wins++;
                grossProfit += result;
                if (result > maxWin) maxWin = result;
            } else {
                losses++;
                grossLoss += Math.abs(result);
                if (Math.abs(result) > maxLoss) maxLoss = Math.abs(result);
            }
        });

        const totalOps = wins + losses;
        const totalProfit = grossProfit - grossLoss;
        const avgWin = wins > 0 ? grossProfit / wins : 0;
        const avgLoss = losses > 0 ? grossLoss / losses : 0;
        const winRate = totalOps > 0 ? ((wins / totalOps) * 100).toFixed(1) : 0;
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
        const initialBalance = 50000;
        const returnPercentage = ((totalProfit / initialBalance) * 100).toFixed(2);

        return {
            wins, losses, totalOps,
            grossProfit, grossLoss, totalProfit,
            avgWin, avgLoss,
            maxWin, maxLoss,
            winRate, profitFactor, returnPercentage,
            sortedTrades
        };
    },

    formatCurrency(value) {
        return Store.formatCurrency(value);
    },

    editBalance() {
        const current = parseFloat(localStorage.getItem('zenox_initial_balance')) || 50000;
        const newBalance = prompt('Digite o novo saldo inicial da conta:', current);

        if (newBalance !== null && !isNaN(newBalance)) {
            localStorage.setItem('zenox_initial_balance', parseFloat(newBalance));
            router.handleRoute(); // Re-render
        }
    },

    renderChart() {
        const ctx = document.getElementById('equityChart');
        if (!ctx) return;

        const trades = Store.getTrades();
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

        let balance = parseFloat(localStorage.getItem('zenox_initial_balance')) || 50000;
        const dataPoints = [balance];
        const labels = ['Início'];

        sortedTrades.forEach(t => {
            balance += parseFloat(t.result);
            dataPoints.push(balance);
            labels.push(new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Patrimônio',
                    data: dataPoints,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => ` R$ ${Store.formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(128, 128, 128, 0.1)' },
                        ticks: { color: '#9ca3af' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
    }
};
