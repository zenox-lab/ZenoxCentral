const AnalysisModule = {
    render() {
        const trades = Store.getTrades();
        const assetStats = this.calculateAssetStats(trades);

        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Análise Avançada</h2>
                    <p class="text-gray-500 dark:text-gray-400">Visualize e analise seus dados de trading em profundidade</p>
                </div>

                <!-- Tabs -->
                <div class="flex overflow-x-auto gap-4 pb-2 border-b border-gray-200 dark:border-white/5 no-scrollbar">
                    <button class="px-6 py-2 rounded-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white shadow-sm whitespace-nowrap">
                        Performance
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Estratégias
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Timeframe
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Psicologia
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Emoções
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Checklist
                    </button>
                    <button class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Top
                    </button>
                </div>

                <!-- Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Chart Section -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white">
                                <i class="fa-solid fa-chart-column text-sm"></i>
                            </div>
                            <h3 class="font-bold text-gray-800 dark:text-white">Ganhos vs Perdas por Ativo</h3>
                        </div>
                        <div class="h-80 w-full relative">
                            <canvas id="assetPerformanceChart"></canvas>
                        </div>
                    </div>

                    <!-- Detailed Performance List -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white">
                                <i class="fa-solid fa-arrow-trend-up text-sm"></i>
                            </div>
                            <h3 class="font-bold text-gray-800 dark:text-white">Desempenho Detalhado</h3>
                        </div>

                        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                            ${Object.keys(assetStats).length === 0 ?
                `<p class="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum dado disponível</p>` :
                Object.entries(assetStats).map(([asset, stat]) => `
                                <div class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div class="flex justify-between items-center mb-3">
                                        <h4 class="font-bold text-gray-800 dark:text-white">${asset}</h4>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">${stat.ops} ops</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg text-center">
                                            <p class="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Ganhos</p>
                                            <p class="font-bold text-emerald-600 dark:text-emerald-400">$${this.formatCurrency(stat.wins)}</p>
                                        </div>
                                        <div class="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-center">
                                            <p class="text-xs text-red-600 dark:text-red-400 mb-1">Perdas</p>
                                            <p class="font-bold text-red-600 dark:text-red-400">$${this.formatCurrency(stat.losses)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        this.renderChart();
    },

    calculateAssetStats(trades) {
        const stats = {};

        trades.forEach(t => {
            const asset = t.asset || 'Desconhecido';
            const result = parseFloat(t.result);

            if (!stats[asset]) {
                stats[asset] = { wins: 0, losses: 0, ops: 0 };
            }

            stats[asset].ops++;
            if (result >= 0) {
                stats[asset].wins += result;
            } else {
                stats[asset].losses += Math.abs(result);
            }
        });

        return stats;
    },

    formatCurrency(value) {
        return Store.formatCurrency(value);
    },

    renderChart() {
        const ctx = document.getElementById('assetPerformanceChart');
        if (!ctx) return;

        const trades = Store.getTrades();
        const stats = this.calculateAssetStats(trades);
        const labels = Object.keys(stats);
        const winsData = labels.map(asset => stats[asset].wins);
        const lossesData = labels.map(asset => stats[asset].losses);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ganhos',
                        data: winsData,
                        backgroundColor: '#10b981', // Emerald 500
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Perdas',
                        data: lossesData,
                        backgroundColor: '#ef4444', // Red 500
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', usePointStyle: true }
                    },
                    tooltip: {
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
