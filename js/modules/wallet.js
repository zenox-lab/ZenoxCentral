window.WalletModule = {
    data: {
        assets: [],
        settings: {
            apiKey: ''
        }
    },

    init() {
        this.loadData();
        // Add initial chart render
        setTimeout(() => this.renderSectorChart(), 500);
    },

    loadData() {
        const stored = localStorage.getItem('zenox_wallet_data');
        if (stored) {
            this.data = JSON.parse(stored);
        }
    },

    saveData() {
        localStorage.setItem('zenox_wallet_data', JSON.stringify(this.data));
    },

    render() {
        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Carteira Simulada</h2>
                        <p class="text-gray-500 dark:text-gray-400">Gerencie suas operações simuladas no S&P 500</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="WalletModule.openSettings()" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" title="Configurações">
                            <i class="fa-solid fa-gear"></i>
                        </button>
                        <button onclick="WalletModule.updateQuotes()" id="btn-update-quotes" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                            <i class="fa-solid fa-rotate"></i>
                            <span>Atualizar Cotações</span>
                        </button>
                        <button onclick="WalletModule.openAddModal()" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i>
                            <span>Novo Ativo</span>
                        </button>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex overflow-x-auto gap-4 pb-2 border-b border-gray-200 dark:border-white/5 no-scrollbar">
                    <button onclick="WalletModule.switchTab('portfolio')" id="tab-wallet-portfolio" class="px-6 py-2 rounded-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white shadow-sm whitespace-nowrap transition-all">
                        Carteira
                    </button>
                    <button onclick="WalletModule.switchTab('mosaic')" id="tab-wallet-mosaic" class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
                        Mosaico
                    </button>
                </div>

                <!-- Content -->
                <div id="wallet-content-portfolio" class="animate-fade-in">
                    ${this.renderPortfolio()}
                </div>
                <div id="wallet-content-mosaic" class="hidden animate-fade-in">
                    ${this.renderMosaic()}
                </div>

                <!-- Modals Container -->
                <div id="wallet-modals"></div>
            </div>
        `;
    },

    renderPortfolio() {
        if (this.data.assets.length === 0) {
            return `
                <div class="bg-white dark:bg-zenox-surface rounded-2xl p-12 text-center border border-gray-100 dark:border-white/5 shadow-card">
                    <div class="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fa-solid fa-wallet text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Sua carteira está vazia</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">Adicione ativos para começar a monitorar suas simulações.</p>
                    <button onclick="WalletModule.openAddModal()" class="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                        Adicionar Primeiro Ativo
                    </button>
                </div>
            `;
        }

        // Calculate total value for percentage
        const totalValue = this.data.assets.reduce((acc, asset) => {
            const price = asset.lastPrice || asset.entryPrice || 0;
            return acc + (price * asset.quantity);
        }, 0);

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Sector Chart Card -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Distribuição por Setor</h3>
                    <div class="h-64 relative">
                        <canvas id="sector-chart"></canvas>
                    </div>
                </div>

                <!-- Summary Card -->
                <div class="lg:col-span-2 bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Resumo da Carteira</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Patrimônio Total</div>
                            <div class="text-xl font-bold text-gray-800 dark:text-white">$${totalValue.toFixed(2)}</div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ativos</div>
                            <div class="text-xl font-bold text-gray-800 dark:text-white">${this.data.assets.length}</div>
                        </div>
                        <!-- Add more summary stats here if needed -->
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ativo</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Entrada</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Atual</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Alvo</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stop</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">P/L Estimado</th>
                                <th class="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            ${this.data.assets.map(asset => this.renderAssetRow(asset)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderSectorChart() {
        const ctx = document.getElementById('sector-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.sectorChart) {
            this.sectorChart.destroy();
        }

        // Aggregate data by sector
        const sectorData = {};

        this.data.assets.forEach(asset => {
            const value = (asset.lastPrice || asset.entryPrice || 0) * asset.quantity;
            if (value === 0) return; // Skip zero value assets

            let sector = 'Outros';

            // Find sector
            if (asset.type === 'stock') {
                for (const [secName, symbols] of Object.entries(window.MarketData.sectors)) {
                    if (symbols.includes(asset.symbol)) {
                        sector = secName;
                        break;
                    }
                }
            } else if (asset.type === 'crypto') {
                sector = 'Cripto';
            } else if (asset.type === 'currency') {
                sector = 'Moedas';
            } else if (asset.type === 'index') {
                sector = 'Índices';
            }

            sectorData[sector] = (sectorData[sector] || 0) + value;
        });

        const labels = Object.keys(sectorData);
        const data = Object.values(sectorData);

        // Zenox Theme Colors
        const colors = [
            '#06b6d4', // Cyan 500
            '#8b5cf6', // Violet 500
            '#f43f5e', // Rose 500
            '#10b981', // Emerald 500
            '#f59e0b', // Amber 500
            '#3b82f6', // Blue 500
            '#ec4899', // Pink 500
            '#6366f1', // Indigo 500
        ];

        this.sectorChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563',
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 11
                            },
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#18181b' : '#ffffff',
                        titleColor: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                        bodyColor: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563',
                        borderColor: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1) + '%';
                                return ` $${value.toFixed(2)} (${percentage})`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    },

    renderAssetRow(asset) {
        const currentPrice = asset.lastPrice || asset.entryPrice || 0;
        const isWatchlist = asset.type === 'WATCH';

        if (isWatchlist) {
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td class="p-4">
                        <div class="font-bold text-gray-800 dark:text-white">${asset.symbol}</div>
                        <div class="text-xs text-blue-500 font-medium">Monitorando</div>
                    </td>
                    <td class="p-4 text-gray-400 dark:text-gray-500">-</td>
                    <td class="p-4 font-medium text-gray-800 dark:text-white">$${currentPrice.toFixed(2)}</td>
                    <td class="p-4 text-gray-400 dark:text-gray-500">-</td>
                    <td class="p-4 text-gray-400 dark:text-gray-500">-</td>
                    <td class="p-4 text-gray-400 dark:text-gray-500">-</td>
                    <td class="p-4 text-right">
                        <button onclick="WalletModule.deleteAsset('${asset.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }

        const pl = (currentPrice - asset.entryPrice) * asset.quantity;
        const plPercent = ((currentPrice - asset.entryPrice) / asset.entryPrice) * 100;
        const isPositive = pl >= 0;
        const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td class="p-4">
                    <div class="font-bold text-gray-800 dark:text-white">${asset.symbol}</div>
                    <div class="text-xs text-gray-500">${asset.quantity} un.</div>
                </td>
                <td class="p-4 text-gray-600 dark:text-gray-300">$${asset.entryPrice.toFixed(2)}</td>
                <td class="p-4 font-medium text-gray-800 dark:text-white">$${currentPrice.toFixed(2)}</td>
                <td class="p-4 text-emerald-600 dark:text-emerald-400">$${asset.targetPrice.toFixed(2)}</td>
                <td class="p-4 text-red-600 dark:text-red-400">$${asset.stopLoss.toFixed(2)}</td>
                <td class="p-4">
                    <div class="font-bold ${colorClass}">$${pl.toFixed(2)}</div>
                    <div class="text-xs ${colorClass}">${plPercent.toFixed(2)}%</div>
                </td>
                <td class="p-4 text-right">
                    <button onclick="WalletModule.deleteAsset('${asset.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    renderMosaic() {
        if (this.data.assets.length === 0) {
            return this.renderPortfolio(); // Show empty state
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${this.data.assets.map(asset => this.renderMosaicCard(asset)).join('')}
            </div>
        `;
    },

    renderMosaicCard(asset) {
        const currentPrice = asset.lastPrice || asset.entryPrice || 0;
        const isWatchlist = asset.type === 'WATCH';

        if (isWatchlist) {
            return `
                <div class="bg-white dark:bg-zenox-surface rounded-xl p-4 shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white leading-tight">${asset.symbol}</h3>
                            <span class="text-[10px] text-blue-500 font-medium uppercase tracking-wider">Watchlist</span>
                        </div>
                        <div class="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs">
                            <i class="fa-solid fa-eye"></i>
                        </div>
                    </div>

                    <div>
                        <div class="text-2xl font-bold text-gray-800 dark:text-white">$${currentPrice.toFixed(2)}</div>
                        <div class="text-[10px] text-gray-400 dark:text-gray-500 truncate">Att: ${asset.lastUpdated ? new Date(asset.lastUpdated).toLocaleTimeString() : '-'}</div>
                    </div>
                </div>
            `;
        }

        const plPercent = ((currentPrice - asset.entryPrice) / asset.entryPrice) * 100;
        const isPositive = plPercent >= 0;
        const bgClass = isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20';
        const textClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

        return `
            <div class="bg-white dark:bg-zenox-surface rounded-xl p-4 shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:shadow-lg transition-all">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white leading-tight">${asset.symbol}</h3>
                        <span class="text-[10px] text-gray-500 dark:text-gray-400">${asset.quantity} un. @ $${asset.entryPrice}</span>
                    </div>
                    <div class="px-1.5 py-0.5 rounded-md ${bgClass} ${textClass} font-bold text-xs">
                        ${plPercent > 0 ? '+' : ''}${plPercent.toFixed(2)}%
                    </div>
                </div>

                <div class="mb-3">
                    <div class="text-2xl font-bold text-gray-800 dark:text-white">$${currentPrice.toFixed(2)}</div>
                    <div class="text-[10px] text-gray-400 dark:text-gray-500">Att: ${asset.lastUpdated ? new Date(asset.lastUpdated).toLocaleTimeString() : '-'}</div>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-gray-100 dark:border-white/5">
                    <div class="flex justify-between text-[10px]">
                        <span class="text-gray-500">Stop</span>
                        <span class="text-red-500 font-medium">$${asset.stopLoss}</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1">
                        <div class="bg-gray-300 dark:bg-gray-600 h-1 rounded-full" style="width: 50%"></div>
                    </div>
                    <div class="flex justify-between text-[10px]">
                        <span class="text-gray-500">Alvo</span>
                        <span class="text-emerald-500 font-medium">$${asset.targetPrice}</span>
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(tabName) {
        const tabs = ['portfolio', 'mosaic'];
        tabs.forEach(tab => {
            const content = document.getElementById(`wallet-content-${tab}`);
            const button = document.getElementById(`tab-wallet-${tab}`);

            if (tab === tabName) {
                content.classList.remove('hidden');
                button.className = 'px-6 py-2 rounded-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white shadow-sm whitespace-nowrap transition-all';
                // Render chart if switching to portfolio
                if (tab === 'portfolio') {
                    setTimeout(() => this.renderSectorChart(), 100);
                }
            } else {
                content.classList.add('hidden');
                button.className = 'px-6 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap transition-colors';
            }
        });
    },

    openAddModal() {
        const modalHtml = `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" id="add-asset-modal">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-6 m-4">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Adicionar Ativo</h3>
                        <button onclick="document.getElementById('add-asset-modal').remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <form onsubmit="WalletModule.handleAddSubmit(event)" class="space-y-4">
                        <!-- Watchlist Toggle -->
                        <div class="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Apenas Monitorar (Watchlist)</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="watchlist-toggle" name="isWatchlist" class="sr-only peer" onchange="WalletModule.toggleWatchlistFields()">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <!-- Asset Type -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Ativo</label>
                            <select id="asset-type-select" onchange="WalletModule.handleTypeChange()" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="stock">Ação (S&P 500)</option>
                                <option value="index">Índice / ETF</option>
                                <option value="currency">Moeda (Forex)</option>
                                <option value="crypto">Criptomoeda</option>
                            </select>
                        </div>

                        <!-- Sector Select (Hidden by default) -->
                        <div id="sector-container">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setor</label>
                            <select id="sector-select" onchange="WalletModule.handleSectorChange()" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Selecione um Setor</option>
                                ${Object.keys(window.MarketData.sectors).map(sector => `<option value="${sector}">${sector}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Asset Symbol Select -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ativo</label>
                            <select name="symbol" id="symbol-select" required class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Selecione primeiro o tipo/setor</option>
                            </select>
                        </div>
                        
                        <div id="trade-details-container" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Entrada ($)</label>
                                    <input type="number" step="0.01" name="entryPrice" id="input-entry" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                                    <input type="number" step="1" name="quantity" id="input-qty" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stop Loss ($)</label>
                                    <input type="number" step="0.01" name="stopLoss" id="input-stop" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alvo ($)</label>
                                    <input type="number" step="0.01" name="targetPrice" id="input-target" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all mt-4">
                            Salvar Ativo
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('wallet-modals').innerHTML = modalHtml;

        // Initialize state
        this.handleTypeChange();
        this.toggleWatchlistFields();
    },

    toggleWatchlistFields() {
        const isWatchlist = document.getElementById('watchlist-toggle').checked;
        const container = document.getElementById('trade-details-container');
        const inputs = container.querySelectorAll('input');

        if (isWatchlist) {
            container.classList.add('hidden');
            inputs.forEach(input => input.removeAttribute('required'));
        } else {
            container.classList.remove('hidden');
            inputs.forEach(input => input.setAttribute('required', 'true'));
        }
    },

    handleTypeChange() {
        const type = document.getElementById('asset-type-select').value;
        const sectorContainer = document.getElementById('sector-container');
        const symbolSelect = document.getElementById('symbol-select');

        symbolSelect.innerHTML = '<option value="">Selecione...</option>';

        if (type === 'stock') {
            sectorContainer.classList.remove('hidden');
            document.getElementById('sector-select').value = '';
        } else {
            sectorContainer.classList.add('hidden');

            let list = [];
            if (type === 'index') list = window.MarketData.indices;
            else if (type === 'currency') list = window.MarketData.currencies;
            else if (type === 'crypto') list = window.MarketData.crypto;

            if (list) {
                list.forEach(item => {
                    const value = typeof item === 'string' ? item : item.symbol;
                    const text = typeof item === 'string' ? item : item.name;
                    symbolSelect.innerHTML += `<option value="${value}">${text}</option>`;
                });
            }
        }
    },

    handleSectorChange() {
        const sector = document.getElementById('sector-select').value;
        const symbolSelect = document.getElementById('symbol-select');

        symbolSelect.innerHTML = '<option value="">Selecione...</option>';

        if (sector && window.MarketData.sectors[sector]) {
            window.MarketData.sectors[sector].forEach(symbol => {
                symbolSelect.innerHTML += `<option value="${symbol}">${symbol}</option>`;
            });
        }
    },

    handleAddSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const rawSymbol = formData.get('symbol');
        const isWatchlist = document.getElementById('watchlist-toggle').checked;

        const newAsset = {
            id: Date.now().toString(),
            symbol: rawSymbol,
            type: isWatchlist ? 'WATCH' : 'TRADE',
            entryPrice: isWatchlist ? 0 : parseFloat(formData.get('entryPrice')),
            quantity: isWatchlist ? 0 : parseInt(formData.get('quantity')),
            stopLoss: isWatchlist ? 0 : parseFloat(formData.get('stopLoss')),
            targetPrice: isWatchlist ? 0 : parseFloat(formData.get('targetPrice')),
            lastPrice: isWatchlist ? 0 : parseFloat(formData.get('entryPrice')),
            status: 'OPEN',
            lastUpdated: new Date().toISOString()
        };

        this.data.assets.push(newAsset);
        this.saveData();
        document.getElementById('add-asset-modal').remove();

        // Re-render current view
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        // Restore active tab
        this.switchTab('portfolio');
        this.renderSectorChart();
    },

    deleteAsset(id) {
        if (confirm('Tem certeza que deseja remover este ativo?')) {
            this.data.assets = this.data.assets.filter(a => a.id !== id);
            this.saveData();
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
            this.renderSectorChart();
        }
    },

    openSettings() {
        const modalHtml = `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" id="settings-modal">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-6 m-4">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Configurações da Carteira</h3>
                        <button onclick="document.getElementById('settings-modal').remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Finnhub API Key</label>
                            <input type="text" id="api-key-input" value="${this.data.settings.apiKey || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Insira sua chave API">
                            <p class="text-xs text-gray-500 mt-1">Obtenha sua chave gratuita em <a href="https://finnhub.io/" target="_blank" class="text-blue-500 underline">finnhub.io</a></p>
                        </div>

                        <button onclick="WalletModule.saveSettings()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                            Salvar Configurações
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('wallet-modals').innerHTML = modalHtml;
    },

    saveSettings() {
        const key = document.getElementById('api-key-input').value;
        this.data.settings.apiKey = key;
        this.saveData();
        document.getElementById('settings-modal').remove();
        alert('Configurações salvas com sucesso!');
    },

    async updateQuotes() {
        const apiKey = this.data.settings.apiKey;
        if (!apiKey) {
            alert('Por favor, configure sua API Key do Finnhub primeiro.');
            this.openSettings();
            return;
        }

        const btn = document.getElementById('btn-update-quotes');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Atualizando...</span>';
        btn.disabled = true;

        try {
            // Update each asset
            for (let asset of this.data.assets) {
                if (asset.status === 'CLOSED') continue;

                const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${asset.symbol}&token=${apiKey}`);
                const data = await response.json();

                if (data.c) { // 'c' is the current price in Finnhub response
                    asset.lastPrice = data.c;
                    asset.lastUpdated = new Date().toISOString();
                }
            }

            this.saveData();

            // Re-render to show new prices
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
            this.renderSectorChart();

        } catch (error) {
            console.error('Error updating quotes:', error);
            alert('Erro ao atualizar cotações. Verifique sua chave API e conexão.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

// Initialize on load
WalletModule.init();
