window.AnalysisModule = {
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
                <div class="flex overflow-x-auto gap-4 pb-2 border-b border-gray-200 dark:border-white/5 no-scrollbar mb-6">
                    <button onclick="AnalysisModule.switchTab('performance')" id="tab-performance" class="px-6 py-2 rounded-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white shadow-sm whitespace-nowrap transition-all">
                        Performance
                    </button>
                    <button onclick="AnalysisModule.switchTab('strategy')" id="tab-strategy" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Estratégias
                    </button>
                    <button onclick="AnalysisModule.switchTab('timeframe')" id="tab-timeframe" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Timeframe
                    </button>
                    <button onclick="AnalysisModule.switchTab('psychology')" id="tab-psychology" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Psicologia
                    </button>
                    <button onclick="AnalysisModule.switchTab('emotions')" id="tab-emotions" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Emoções
                    </button>
                    <button onclick="AnalysisModule.switchTab('top')" id="tab-top" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Top
                    </button>
                </div>

                <!-- Content Grid -->
                <div class="grid grid-cols-1 gap-6">
                    
                    <!-- Tab: Performance -->
                    <div id="content-performance" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        <!-- Asset Performance Chart -->
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

                    <!-- Tab: Strategy -->
                    <div id="content-strategy" class="hidden animate-fade-in">
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white">
                                    <i class="fa-solid fa-chess-knight text-sm"></i>
                                </div>
                                <h3 class="font-bold text-gray-800 dark:text-white">Performance por Estratégia</h3>
                            </div>
                            <div class="h-80 w-full relative">
                                <canvas id="strategyPerformanceChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Timeframe -->
                    <div id="content-timeframe" class="hidden animate-fade-in">
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white">
                                    <i class="fa-solid fa-clock text-sm"></i>
                                </div>
                                <h3 class="font-bold text-gray-800 dark:text-white">Performance por Timeframe</h3>
                            </div>
                            <div class="h-80 w-full relative">
                                <canvas id="timeframePerformanceChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Psychology -->
                    <div id="content-psychology" class="hidden animate-fade-in">
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-8 h-8 rounded bg-pink-500 flex items-center justify-center text-white">
                                    <i class="fa-solid fa-brain text-sm"></i>
                                </div>
                                <h3 class="font-bold text-gray-800 dark:text-white">Análise Psicológica</h3>
                            </div>
                            <div class="h-80 w-full relative">
                                <canvas id="psychologyChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Emotions -->
                    <div id="content-emotions" class="hidden animate-fade-in">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Chart -->
                            <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 rounded bg-pink-500 flex items-center justify-center text-white">
                                        <i class="fa-solid fa-face-smile text-sm"></i>
                                    </div>
                                    <h3 class="font-bold text-gray-800 dark:text-white">Análise de Emoções</h3>
                                </div>
                                <div class="h-80 w-full relative">
                                    <canvas id="emotionsChart"></canvas>
                                </div>
                                <div class="flex justify-center gap-4 mt-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded bg-emerald-500"></div>
                                        <span class="text-sm text-gray-500 dark:text-gray-400">Ganhos</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded bg-red-500"></div>
                                        <span class="text-sm text-gray-500 dark:text-gray-400">Perdas</span>
                                    </div>
                                </div>
                            </div>

                            <!-- List -->
                            <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white">
                                        <i class="fa-solid fa-list text-sm"></i>
                                    </div>
                                    <h3 class="font-bold text-gray-800 dark:text-white">Detalhes por Emoção</h3>
                                </div>
                                <div id="emotionsList" class="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                                    <!-- List items injected by JS -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Top -->
                    <div id="content-top" class="hidden animate-fade-in">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Top Strategies -->
                            <div class="bg-emerald-500 p-6 rounded-2xl shadow-card text-white">
                                <div class="flex items-center gap-3 mb-6">
                                    <i class="fa-solid fa-bullseye text-xl"></i>
                                    <h3 class="font-bold text-lg">Top 3 Estratégias</h3>
                                </div>
                                <div id="topStrategiesList" class="space-y-4">
                                    <!-- List items injected by JS -->
                                </div>
                            </div>

                            <!-- Top Timeframes -->
                            <div class="bg-blue-500 p-6 rounded-2xl shadow-card text-white">
                                <div class="flex items-center gap-3 mb-6">
                                    <i class="fa-solid fa-clock text-xl"></i>
                                    <h3 class="font-bold text-lg">Melhor Timeframe</h3>
                                </div>
                                <div id="topTimeframesList" class="space-y-4">
                                    <!-- List items injected by JS -->
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    },

    switchTab(tabName) {
        const tabs = ['performance', 'strategy', 'timeframe', 'psychology', 'emotions', 'top'];

        tabs.forEach(tab => {
            const content = document.getElementById(`content-${tab}`);
            const button = document.getElementById(`tab-${tab}`);

            if (tab === tabName) {
                content.classList.remove('hidden');
                button.className = 'px-6 py-2 rounded-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white shadow-sm whitespace-nowrap transition-all';
            } else {
                content.classList.add('hidden');
                button.className = 'px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors';
            }
        });
    },


    afterRender() {
        this.renderAssetChart();
        this.renderStrategyChart();
        this.renderTimeframeChart();
        this.renderPsychologyChart();
        this.renderEmotionsChart();
        this.renderTopTab();
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

    calculateGroupStats(trades, key) {
        const stats = {};
        trades.forEach(t => {
            const group = t[key] || 'Não definido';
            const result = parseFloat(t.result);
            if (!stats[group]) stats[group] = 0;
            stats[group] += result;
        });
        return stats;
    },

    calculateEmotionStats(trades) {
        const stats = {};

        trades.forEach(t => {
            const emotion = t.emotion || 'Neutro';
            const result = parseFloat(t.result);

            if (!stats[emotion]) {
                stats[emotion] = {
                    totalPL: 0,
                    count: 0,
                    wins: 0
                };
            }

            stats[emotion].totalPL += result;
            stats[emotion].count++;
            if (result >= 0) stats[emotion].wins++;
        });

        // Calculate Win Rate
        Object.keys(stats).forEach(emotion => {
            stats[emotion].winRate = (stats[emotion].wins / stats[emotion].count) * 100;
        });

        return stats;
    },

    calculateTopStats(trades, key) {
        const stats = {};

        trades.forEach(t => {
            const group = t[key] || 'Não definido';
            const result = parseFloat(t.result);

            if (!stats[group]) {
                stats[group] = {
                    name: group,
                    totalPL: 0,
                    count: 0,
                    wins: 0
                };
            }

            stats[group].totalPL += result;
            stats[group].count++;
            if (result >= 0) stats[group].wins++;
        });

        // Calculate Win Rate and convert to array
        const statsArray = Object.values(stats).map(item => {
            item.winRate = (item.wins / item.count) * 100;
            return item;
        });

        // Sort by Total PL descending
        return statsArray.sort((a, b) => b.totalPL - a.totalPL).slice(0, 3);
    },

    formatCurrency(value) {
        return Store.formatCurrency(value);
    },

    renderAssetChart() {
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
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Perdas',
                        data: lossesData,
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    }
                ]
            },
            options: this.getChartOptions()
        });
    },

    renderStrategyChart() {
        const ctx = document.getElementById('strategyPerformanceChart');
        if (!ctx) return;

        const trades = Store.getTrades();
        const stats = this.calculateGroupStats(trades, 'strategy');
        const labels = Object.keys(stats);
        const data = Object.values(stats);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Resultado Financeiro',
                    data: data,
                    backgroundColor: data.map(v => v >= 0 ? '#8b5cf6' : '#ef4444'),
                    borderRadius: 4
                }]
            },
            options: this.getChartOptions()
        });
    },

    renderTimeframeChart() {
        const ctx = document.getElementById('timeframePerformanceChart');
        if (!ctx) return;

        const trades = Store.getTrades();
        const stats = this.calculateGroupStats(trades, 'timeframe');
        const labels = Object.keys(stats);
        const data = Object.values(stats);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Resultado Financeiro',
                    data: data,
                    backgroundColor: data.map(v => v >= 0 ? '#f97316' : '#ef4444'),
                    borderRadius: 4
                }]
            },
            options: this.getChartOptions()
        });
    },

    renderPsychologyChart() {
        const ctx = document.getElementById('psychologyChart');
        if (!ctx) return;

        // Mock data for psychology if not available in trades
        // In a real app, this would come from trade tags or specific fields
        const labels = ['Disciplina', 'Paciência', 'Confiança', 'Foco', 'Resiliência'];
        const data = [8, 6, 9, 7, 8]; // 0-10 scale

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pontuação Média',
                    data: data,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#8b5cf6',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: '#000000',
                            lineWidth: 0.5
                        },
                        grid: {
                            color: '#000000',
                            lineWidth: 0.5
                        },
                        pointLabels: {
                            color: '#000000',
                            font: {
                                size: 12
                            }
                        },
                        ticks: { display: false, max: 10 }
                    }
                }
            }
        });
    },

    renderEmotionsChart() {
        const ctx = document.getElementById('emotionsChart');
        const listContainer = document.getElementById('emotionsList');
        if (!ctx || !listContainer) return;

        const trades = Store.getTrades();
        const stats = this.calculateEmotionStats(trades);
        const labels = Object.keys(stats);

        // Prepare Chart Data
        const dataValues = labels.map(emotion => Math.abs(stats[emotion].totalPL));
        const backgroundColors = labels.map(emotion => stats[emotion].totalPL >= 0 ? '#10b981' : '#ef4444');

        // Render Chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Resultado',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderRadius: 4,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const emotion = labels[context.dataIndex];
                                const value = stats[emotion].totalPL;
                                return ` Resultado: R$ ${Store.formatCurrency(value)}`;
                            }
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

        // Render List
        if (labels.length === 0) {
            listContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum dado disponível</p>`;
        } else {
            listContainer.innerHTML = labels.map(emotion => {
                const stat = stats[emotion];
                const isPositive = stat.totalPL >= 0;
                const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

                return `
                    <div class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h4 class="font-bold text-gray-800 dark:text-white capitalize">${emotion}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${stat.count} operações • Win Rate: ${stat.winRate.toFixed(1)}%
                            </p>
                        </div>
                        <span class="font-bold ${colorClass}">
                            ${isPositive ? '+' : ''}R$ ${Store.formatCurrency(stat.totalPL)}
                        </span>
                    </div>
                `;
            }).join('');
        }
    },

    renderTopTab() {
        const strategiesContainer = document.getElementById('topStrategiesList');
        const timeframesContainer = document.getElementById('topTimeframesList');

        if (!strategiesContainer || !timeframesContainer) return;

        const trades = Store.getTrades();

        // Render Top Strategies
        const topStrategies = this.calculateTopStats(trades, 'strategy');
        if (topStrategies.length === 0) {
            strategiesContainer.innerHTML = `<p class="text-white/70 text-center py-4">Nenhum dado disponível</p>`;
        } else {
            strategiesContainer.innerHTML = topStrategies.map((stat, index) => `
                <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-white/80">#${index + 1}</span>
                            <h4 class="font-bold text-white">${stat.name}</h4>
                        </div>
                        <span class="font-bold text-white">$${Store.formatCurrency(stat.totalPL)}</span>
                    </div>
                    <p class="text-xs text-white/70">
                        Win Rate: ${stat.winRate.toFixed(0)}% • ${stat.count} trades
                    </p>
                </div>
            `).join('');
        }

        // Render Top Timeframes
        const topTimeframes = this.calculateTopStats(trades, 'timeframe');
        if (topTimeframes.length === 0) {
            timeframesContainer.innerHTML = `<p class="text-white/70 text-center py-4">Nenhum dado disponível</p>`;
        } else {
            timeframesContainer.innerHTML = topTimeframes.map((stat, index) => `
                <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-white/80">#${index + 1}</span>
                            <h4 class="font-bold text-white">${stat.name}</h4>
                        </div>
                        <span class="font-bold text-white">$${Store.formatCurrency(stat.totalPL)}</span>
                    </div>
                    <p class="text-xs text-white/70">
                        ${stat.count} operações
                    </p>
                </div>
            `).join('');
        }
    },

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
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
        };
    }
};
