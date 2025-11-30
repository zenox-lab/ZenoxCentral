const TradesModule = {
    state: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    },

    render() {
        const trades = Store.getTrades();
        const stats = this.calculateStats(trades);

        return `
            <div class="space-y-8 animate-fade-in">
                <!-- Header -->
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard de Trading</h2>
                    <p class="text-gray-500 dark:text-gray-400">Acompanhe suas operações e resultados</p>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Lucro Hoje -->
                    <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <i class="fa-solid fa-dollar-sign text-white text-xl"></i>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Lucro Hoje</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">R$ ${Store.formatCurrency(stats.todayProfit)}</h3>
                    </div>

                    <!-- Lucro do Mês -->
                    <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                            <i class="fa-solid fa-chart-line text-white text-xl"></i>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Lucro do Mês</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">R$ ${Store.formatCurrency(stats.monthProfit)}</h3>
                    </div>

                    <!-- Total Acumulado -->
                    <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <i class="fa-solid fa-bullseye text-white text-xl"></i>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Acumulado</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">R$ ${Store.formatCurrency(stats.totalProfit)}</h3>
                    </div>

                    <!-- Win Rate -->
                    <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                            <i class="fa-solid fa-calendar-check text-white text-xl"></i>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Win Rate</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">${stats.winRate}%</h3>
                    </div>
                </div>

                <!-- Calendar Section -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-white capitalize">${this.getMonthName(this.state.currentMonth)} ${this.state.currentYear}</h3>
                            <p class="text-gray-500 dark:text-gray-400">Calendário de Trades</p>
                        </div>
                        
                        <div class="flex items-center gap-4">
                            <div class="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                                <button onclick="TradesModule.changeMonth(-1)" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </button>
                                <button onclick="TradesModule.changeMonth(1)" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                            
                            <button onclick="TradesModule.openModal()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                                <i class="fa-solid fa-plus"></i>
                                <span>Novo Trade</span>
                            </button>
                        </div>
                    </div>

                    <!-- Calendar Grid -->
                    <div class="grid grid-cols-7 gap-4 mb-4">
                        ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => `
                            <div class="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-white/5 rounded-lg">
                                ${day}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="grid grid-cols-7 gap-4">
                        ${this.renderCalendarDays(trades)}
                    </div>
                </div>
            </div>

            <!-- Modal Novo Trade -->
            <div id="trade-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-full max-w-2xl p-0 shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10 overflow-hidden" id="trade-modal-content">
                    
                    <!-- Header -->
                    <div class="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-blue-600 dark:text-blue-400">Nova Operação</h3>
                        <button onclick="TradesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <form id="trade-form" onsubmit="TradesModule.handleSubmit(event)" class="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                        
                        <!-- Tabs -->
                        <div class="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 mb-6">
                            <button type="button" onclick="TradesModule.switchTab('operation')" id="tab-operation" class="flex-1 py-2 rounded-md bg-white dark:bg-zenox-surface shadow-sm text-sm font-semibold text-gray-800 dark:text-white transition-all">Operação</button>
                            <button type="button" onclick="TradesModule.switchTab('risk')" id="tab-risk" class="flex-1 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-all">
                                <i class="fa-solid fa-shield-halved text-xs"></i> Gestão de Risco
                            </button>
                            <button type="button" onclick="TradesModule.switchTab('strategy')" id="tab-strategy" class="flex-1 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-all">
                                <i class="fa-solid fa-bullseye text-xs"></i> Estratégia & Análise
                            </button>
                        </div>

                        <!-- Tab Content: Operação -->
                        <div id="content-operation" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Data -->
                                <div class="space-y-2">
                                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Data</label>
                                    <div class="relative">
                                        <input type="date" name="date" required class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                    </div>
                                </div>

                                <!-- Ativo -->
                                <div class="space-y-2">
                                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Ativo</label>
                                    <select name="asset" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                        <option value="" disabled selected>Selecione o ativo</option>
                                        <option value="WIN">WIN (Índice)</option>
                                        <option value="WDO">WDO (Dólar)</option>
                                        <option value="BTC">Bitcoin</option>
                                        <option value="ETH">Ethereum</option>
                                        <option value="XAUUSD">Ouro</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Tipo de Operação -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo de Operação</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <input type="hidden" name="type" id="trade-type-input" value="Compra">
                                    <button type="button" onclick="TradesModule.setTradeType('Compra')" id="btn-compra" class="py-2.5 rounded-lg font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 border border-transparent">
                                        <i class="fa-solid fa-arrow-trend-up"></i> Compra
                                    </button>
                                    <button type="button" onclick="TradesModule.setTradeType('Venda')" id="btn-venda" class="py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-arrow-trend-down"></i> Venda
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Contratos -->
                                <div class="space-y-2">
                                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Contratos</label>
                                    <input type="number" name="contracts" value="1" min="1" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                </div>

                                <!-- Resultado -->
                                <div class="space-y-2">
                                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Resultado ($)</label>
                                    <input type="number" step="0.01" name="result" placeholder="Lucro (+) ou Prejuízo (-)" required class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                </div>
                            </div>

                            <!-- Timeframe -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Timeframe</label>
                                <select name="timeframe" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                    <option value="" disabled selected>Selecione o timeframe</option>
                                    <option value="1m">1 minuto</option>
                                    <option value="5m">5 minutos</option>
                                    <option value="15m">15 minutos</option>
                                    <option value="1h">1 hora</option>
                                    <option value="4h">4 horas</option>
                                    <option value="1D">Diário</option>
                                </select>
                            </div>

                            <!-- Print da Operação -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Print da Operação</label>
                                <div class="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-black/20">
                                    <i class="fa-regular fa-image text-3xl mb-2"></i>
                                    <span class="text-sm">Clique para adicionar print</span>
                                </div>
                            </div>

                            <!-- Observações -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Observações</label>
                                <textarea name="notes" rows="3" placeholder="Notas sobre o trade..." class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"></textarea>
                            </div>
                        </div>

                        <!-- Tab Content: Gestão de Risco -->
                        <div id="content-risk" class="space-y-6 hidden">
                            <!-- Saldo da Conta -->
                            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Saldo da Conta Prop</p>
                                <p class="text-2xl font-bold text-blue-800 dark:text-blue-300">$50.000</p>
                            </div>

                            <!-- Stop Loss -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Stop Loss ($)</label>
                                <input type="number" step="0.01" name="stop_loss" placeholder="Ex: 2050.00" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                            </div>

                            <!-- Take Profit -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Take Profit ($)</label>
                                <input type="number" step="0.01" name="take_profit" placeholder="Ex: 2100.00" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                            </div>

                            <!-- Dicas de Gestão -->
                            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-6">
                                <h4 class="text-blue-800 dark:text-blue-300 font-bold mb-3">Dicas de Gestão de Risco</h4>
                                <ul class="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                    <li class="flex items-start gap-2">
                                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        Nunca arrisque mais de 2% da conta por operação
                                    </li>
                                    <li class="flex items-start gap-2">
                                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        Mantenha uma relação risco/retorno de no mínimo 1:2
                                    </li>
                                    <li class="flex items-start gap-2">
                                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        Defina sempre stop loss antes de entrar na operação
                                    </li>
                                    <li class="flex items-start gap-2">
                                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        O risco % é calculado automaticamente ao definir SL e TP
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Tab Content: Estratégia & Análise -->
                        <div id="content-strategy" class="space-y-6 hidden">
                            <!-- Estratégia -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Estratégia Utilizada</label>
                                <select name="strategy" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                    <option value="" disabled selected>Selecione uma estratégia</option>
                                    <option value="pullback">Pullback de Média</option>
                                    <option value="breakout">Rompimento</option>
                                    <option value="reversal">Reversão</option>
                                    <option value="scalping">Scalping</option>
                                </select>
                            </div>

                            <!-- Checklist -->
                            <div class="space-y-2">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Checklist Seguido</label>
                                <select name="checklist" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                    <option value="" disabled selected>Selecione um checklist</option>
                                    <option value="padrao">Checklist Padrão</option>
                                    <option value="agressivo">Checklist Agressivo</option>
                                    <option value="conservador">Checklist Conservador</option>
                                </select>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Marque os passos que você seguiu nesta operação</p>
                            </div>

                            <!-- Sentimento -->
                            <div class="space-y-3">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Como você se sentiu durante a operação?</label>
                                <input type="hidden" name="emotion" id="trade-emotion-input">
                                <div class="grid grid-cols-2 gap-3">
                                    <button type="button" onclick="TradesModule.setEmotion('confiante')" id="btn-emotion-confiante" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">😎</span> <span class="font-medium">Confiante</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('calmo')" id="btn-emotion-calmo" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">😌</span> <span class="font-medium">Calmo</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('neutro')" id="btn-emotion-neutro" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">😐</span> <span class="font-medium">Neutro</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('ansioso')" id="btn-emotion-ansioso" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">😰</span> <span class="font-medium">Ansioso</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('medo')" id="btn-emotion-medo" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">😨</span> <span class="font-medium">Medo</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('euforico')" id="btn-emotion-euforico" class="p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-xl">🤩</span> <span class="font-medium">Eufórico</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Buttons -->
                        <div class="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <button type="button" onclick="TradesModule.closeModal()" class="px-8 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent">Cancelar</button>
                            <button type="submit" class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all">Salvar Trade</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    switchTab(tabName) {
        // Hide all contents
        ['operation', 'risk', 'strategy'].forEach(tab => {
            document.getElementById(`content-${tab}`).classList.add('hidden');

            // Reset tab styles
            const tabBtn = document.getElementById(`tab-${tab}`);
            tabBtn.className = 'flex-1 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-all';

            // Remove icons for text-only active state if needed, but keeping simple for now
        });

        // Show active content
        document.getElementById(`content-${tabName}`).classList.remove('hidden');

        // Set active tab style
        const activeBtn = document.getElementById(`tab-${tabName}`);
        activeBtn.className = 'flex-1 py-2 rounded-md bg-white dark:bg-zenox-surface shadow-sm text-sm font-semibold text-gray-800 dark:text-white transition-all flex items-center justify-center gap-2';
    },

    setTradeType(type) {
        const input = document.getElementById('trade-type-input');
        const btnCompra = document.getElementById('btn-compra');
        const btnVenda = document.getElementById('btn-venda');

        input.value = type;

        if (type === 'Compra') {
            btnCompra.className = 'py-2.5 rounded-lg font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 border border-transparent';
            btnVenda.className = 'py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2';
        } else {
            btnVenda.className = 'py-2.5 rounded-lg font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 border border-transparent';
            btnCompra.className = 'py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2';
        }
    },

    setEmotion(emotion) {
        // Update hidden input
        document.getElementById('trade-emotion-input').value = emotion;

        // Update UI
        const emotions = ['confiante', 'calmo', 'neutro', 'ansioso', 'medo', 'euforico'];
        emotions.forEach(e => {
            const btn = document.getElementById(`btn-emotion-${e}`);
            if (e === emotion) {
                btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
                btn.classList.remove('border-gray-200', 'dark:border-white/10', 'text-gray-600', 'dark:text-gray-400');
            } else {
                btn.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
                btn.classList.add('border-gray-200', 'dark:border-white/10', 'text-gray-600', 'dark:text-gray-400');
            }
        });
    },

    renderCalendarDays(trades) {
        const year = this.state.currentYear;
        const month = this.state.currentMonth;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let html = '';

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            html += `
                <div class="aspect-square p-2 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-600 flex flex-col items-center justify-center">
                    <span class="text-sm">${daysInPrevMonth - i}</span>
                </div>
            `;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrades = trades.filter(t => t.date === dateStr);
            const dayProfit = dayTrades.reduce((sum, t) => sum + parseFloat(t.result), 0);

            let content = `<span class="text-lg font-medium text-gray-700 dark:text-gray-300">${day}</span>`;
            let bgClass = "bg-white dark:bg-zenox-surface hover:border-blue-500 dark:hover:border-zenox-primary";

            if (dayTrades.length > 0) {
                const isProfit = dayProfit >= 0;
                const colorClass = isProfit ? 'text-emerald-500' : 'text-rose-500';
                const bgStatus = isProfit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

                content += `
                    <div class="mt-2 text-xs font-bold ${colorClass}">
                        ${isProfit ? '+' : ''}R$ ${Math.abs(dayProfit).toFixed(0)}
                    </div>
                    <div class="mt-1 text-[10px] text-gray-400">
                        ${dayTrades.length} ops
                    </div>
                `;
                bgClass = bgStatus;
            }

            html += `
                <div class="aspect-square p-2 border border-gray-100 dark:border-white/5 rounded-xl ${bgClass} transition-all cursor-pointer flex flex-col items-center justify-center group relative">
                    ${content}
                </div>
            `;
        }

        // Next month days (fill remaining grid)
        const totalCells = 42; // 6 rows * 7 cols
        const remainingCells = totalCells - (firstDay + daysInMonth);

        for (let i = 1; i <= remainingCells; i++) {
            html += `
                <div class="aspect-square p-2 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-600 flex flex-col items-center justify-center">
                    <span class="text-sm">${i}</span>
                </div>
            `;
        }

        return html;
    },

    calculateStats(trades) {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let todayProfit = 0;
        let monthProfit = 0;
        let totalProfit = 0;
        let wins = 0;
        let totalOps = trades.length;

        trades.forEach(trade => {
            const val = parseFloat(trade.result);
            const tradeDate = new Date(trade.date);

            // Total
            totalProfit += val;
            if (val > 0) wins++;

            // Today
            if (trade.date === today) {
                todayProfit += val;
            }

            // Month
            if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
                monthProfit += val;
            }
        });

        const winRate = totalOps > 0 ? ((wins / totalOps) * 100).toFixed(1) : 0;

        return { todayProfit, monthProfit, totalProfit, winRate };
    },

    getMonthName(monthIndex) {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[monthIndex];
    },

    changeMonth(delta) {
        this.state.currentMonth += delta;
        if (this.state.currentMonth > 11) {
            this.state.currentMonth = 0;
            this.state.currentYear++;
        } else if (this.state.currentMonth < 0) {
            this.state.currentMonth = 11;
            this.state.currentYear--;
        }
        router.handleRoute(); // Re-render
    },

    openModal() {
        const modal = document.getElementById('trade-modal');
        const content = document.getElementById('trade-modal-content');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Small delay for animation
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    },

    closeModal() {
        const modal = document.getElementById('trade-modal');
        const content = document.getElementById('trade-modal-content');
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    },

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const trade = {
            date: formData.get('date'),
            asset: formData.get('asset'),
            type: formData.get('type'),
            result: parseFloat(formData.get('result')),
            strategy: 'Manual', // Default for now
            contracts: 1,
            timeframe: '5m',
            notes: ''
        };

        Store.addTrade(trade);
        this.closeModal();
        router.handleRoute(); // Re-render to show new trade
    },

    afterRender() {
        // Any post-render logic
    }
};
