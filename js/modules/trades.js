window.TradesModule = {
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
                <div class="hidden md:block">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Dashboard de Trading</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Acompanhe suas operações e resultados</p>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Lucro Hoje -->
                    <!-- Lucro Hoje -->
                    <div class="bg-white dark:bg-zenox-surface rounded-xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group" style="padding: clamp(12px, 1.5vw, 20px);">
                        <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                            <i class="fa-solid fa-dollar-sign text-white text-sm"></i>
                        </div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide" style="font-size: clamp(10px, 1vw, 12px);">Lucro Hoje</p>
                        <h3 class="font-bold text-gray-800 dark:text-white mt-0.5" style="font-size: clamp(16px, 1.5vw, 20px);">$ ${Store.formatCurrency(stats.todayProfit)}</h3>
                    </div>

                    <!-- Lucro do Mês -->
                    <!-- Lucro do Mês -->
                    <div class="bg-white dark:bg-zenox-surface rounded-xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group" style="padding: clamp(12px, 1.5vw, 20px);">
                        <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
                            <i class="fa-solid fa-chart-line text-white text-sm"></i>
                        </div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide" style="font-size: clamp(10px, 1vw, 12px);">Lucro do Mês</p>
                        <h3 class="font-bold text-gray-800 dark:text-white mt-0.5" style="font-size: clamp(16px, 1.5vw, 20px);">$ ${Store.formatCurrency(stats.monthProfit)}</h3>
                    </div>

                    <!-- Total Acumulado -->
                    <!-- Total Acumulado -->
                    <div class="bg-white dark:bg-zenox-surface rounded-xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group" style="padding: clamp(12px, 1.5vw, 20px);">
                        <div class="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20">
                            <i class="fa-solid fa-bullseye text-white text-sm"></i>
                        </div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide" style="font-size: clamp(10px, 1vw, 12px);">Total Acumulado</p>
                        <h3 class="font-bold text-gray-800 dark:text-white mt-0.5" style="font-size: clamp(16px, 1.5vw, 20px);">$ ${Store.formatCurrency(stats.totalProfit)}</h3>
                    </div>

                    <!-- Win Rate -->
                    <!-- Win Rate -->
                    <div class="bg-white dark:bg-zenox-surface rounded-xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group" style="padding: clamp(12px, 1.5vw, 20px);">
                        <div class="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-orange-500/20">
                            <i class="fa-solid fa-calendar-check text-white text-sm"></i>
                        </div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide" style="font-size: clamp(10px, 1vw, 12px);">Win Rate</p>
                        <h3 class="font-bold text-gray-800 dark:text-white mt-0.5" style="font-size: clamp(16px, 1.5vw, 20px);">${stats.winRate}%</h3>
                    </div>
                </div>

                <!-- Calendar Section -->
                <div class="bg-white dark:bg-zenox-surface rounded-xl shadow-sm border border-gray-100 dark:border-white/5 max-w-5xl mx-auto" style="padding: clamp(16px, 2vw, 24px);">
                    <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 class="font-bold text-gray-800 dark:text-white capitalize" style="font-size: clamp(18px, 1.5vw, 24px);">${this.getMonthName(this.state.currentMonth)} ${this.state.currentYear}</h3>
                            <p class="text-gray-500 dark:text-gray-400" style="font-size: clamp(12px, 1vw, 14px);">Calendário de Trades</p>
                        </div>
                        
                        <div class="flex items-center gap-4">
                            <div class="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                                <button onclick="TradesModule.changeMonth(-1)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all text-sm">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </button>
                                <button onclick="TradesModule.changeMonth(1)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all text-sm">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                            
                            <button onclick="TradesModule.openModal()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                                <i class="fa-solid fa-plus"></i>
                                <span>Novo Trade</span>
                            </button>
                        </div>
                    </div>

                    <!-- Calendar Grid -->
                    <div class="grid grid-cols-7 gap-4 mb-4">
                        ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => `
                            <div class="text-center py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-white/5 rounded-md">
                                ${day}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 md:gap-2">
                        ${this.renderCalendarDays(trades)}
                    </div>
                </div>
            </div>

            <!-- Modal Novo Trade -->
            <div id="trade-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-full max-w-2xl p-0 shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10 overflow-hidden" id="trade-modal-content">
                    
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">Nova Operação</h3>
                        <button onclick="TradesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <form id="trade-form" onsubmit="TradesModule.handleSubmit(event)" class="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                        <input type="hidden" name="trade_id" id="trade-id-input">
                        
                        <!-- Tabs -->
                        <div class="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 mb-4">
                            <button type="button" onclick="TradesModule.switchTab('operation')" id="tab-operation" class="flex-1 py-1.5 rounded-md bg-white dark:bg-zenox-surface shadow-sm text-xs font-semibold text-gray-800 dark:text-white transition-all">Operação</button>
                            <button type="button" onclick="TradesModule.switchTab('risk')" id="tab-risk" class="flex-1 py-1.5 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-all">
                                <i class="fa-solid fa-shield-halved text-[10px]"></i> Gestão de Risco
                            </button>
                            <button type="button" onclick="TradesModule.switchTab('strategy')" id="tab-strategy" class="flex-1 py-1.5 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-all">
                                <i class="fa-solid fa-bullseye text-[10px]"></i> Estratégia & Análise
                            </button>
                        </div>

                        <!-- Tab Content: Operação -->
                        <div id="content-operation" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Data -->
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Data</label>
                                    <div class="relative">
                                        <input type="date" name="date" required class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                    </div>
                                </div>

                                <!-- Ativo -->
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Ativo</label>
                                    <div class="flex gap-2">
                                        <select name="asset" id="asset-select" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                            <option value="" disabled selected>Selecione</option>
                                            ${Store.getAssets().map(asset => `<option value="${asset}">${asset}</option>`).join('')}
                                        </select>
                                        <button type="button" onclick="TradesModule.manageAssets()" class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Gerenciar Ativos">
                                            <i class="fa-solid fa-gear text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Tipo de Operação -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Tipo de Operação</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <input type="hidden" name="type" id="trade-type-input" value="Compra">
                                    <button type="button" onclick="TradesModule.setTradeType('Compra')" id="btn-compra" class="py-2 rounded-lg font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 border border-transparent">
                                        <i class="fa-solid fa-arrow-trend-up"></i> Compra
                                    </button>
                                    <button type="button" onclick="TradesModule.setTradeType('Venda')" id="btn-venda" class="py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-arrow-trend-down"></i> Venda
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Contratos -->
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Contratos</label>
                                    <input type="number" name="contracts" value="1" min="1" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                </div>

                                <!-- Resultado -->
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Resultado ($)</label>
                                    <input type="number" step="0.01" name="result" placeholder="+/-" required class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                </div>
                            </div>

                            <!-- Timeframe -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Timeframe</label>
                                <div class="flex gap-2">
                                    <select name="timeframe" id="timeframe-select" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                        <option value="" disabled selected>Selecione</option>
                                        ${Store.getTimeframes().map(tf => `<option value="${tf}">${tf}</option>`).join('')}
                                    </select>
                                    <button type="button" onclick="TradesModule.manageTimeframes()" class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Gerenciar Timeframes">
                                        <i class="fa-solid fa-gear text-xs"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Print da Operação -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Print da Operação</label>
                                <div class="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-black/20">
                                    <i class="fa-regular fa-image text-xl mb-1"></i>
                                    <span class="text-xs">Adicionar print</span>
                                </div>
                            </div>

                            <!-- Observações -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Observações</label>
                                <textarea name="notes" rows="2" placeholder="Notas..." class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"></textarea>
                            </div>
                        </div>

                        <!-- Tab Content: Gestão de Risco -->
                        <div id="content-risk" class="space-y-4 hidden">
                            <!-- Stop Loss -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Stop Loss ($)</label>
                                <input type="number" step="0.01" name="stop_loss" placeholder="Ex: 2050.00" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                            </div>

                            <!-- Take Profit -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Take Profit ($)</label>
                                <input type="number" step="0.01" name="take_profit" placeholder="Ex: 2100.00" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                            </div>

                            <!-- Dicas de Gestão -->
                            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                <h4 class="text-blue-800 dark:text-blue-300 font-bold mb-2 text-sm">Dicas de Gestão de Risco</h4>
                                <ul class="space-y-1.5 text-xs text-blue-700 dark:text-blue-400">
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
                        <div id="content-strategy" class="space-y-4 hidden">
                            <!-- Estratégia -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Estratégia Utilizada</label>
                                <select name="strategy" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                    <option value="" disabled selected>Selecione</option>
                                    <option value="pullback">Pullback de Média</option>
                                    <option value="breakout">Rompimento</option>
                                    <option value="reversal">Reversão</option>
                                    <option value="scalping">Scalping</option>
                                </select>
                            </div>

                            <!-- Checklist -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Checklist Seguido</label>
                                <select name="checklist" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                    <option value="" disabled selected>Selecione</option>
                                    <option value="padrao">Checklist Padrão</option>
                                    <option value="agressivo">Checklist Agressivo</option>
                                    <option value="conservador">Checklist Conservador</option>
                                </select>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400">Marque os passos que você seguiu nesta operação</p>
                            </div>

                            <!-- Sentimento -->
                            <div class="space-y-2">
                                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Como você se sentiu durante a operação?</label>
                                <input type="hidden" name="emotion" id="trade-emotion-input">
                                <div class="grid grid-cols-2 gap-2">
                                    <button type="button" onclick="TradesModule.setEmotion('confiante')" id="btn-emotion-confiante" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">😎</span> <span class="text-xs font-medium">Confiante</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('calmo')" id="btn-emotion-calmo" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">😌</span> <span class="text-xs font-medium">Calmo</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('neutro')" id="btn-emotion-neutro" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">😐</span> <span class="text-xs font-medium">Neutro</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('ansioso')" id="btn-emotion-ansioso" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">😰</span> <span class="text-xs font-medium">Ansioso</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('medo')" id="btn-emotion-medo" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">😨</span> <span class="text-xs font-medium">Medo</span>
                                    </button>
                                    <button type="button" onclick="TradesModule.setEmotion('euforico')" id="btn-emotion-euforico" class="p-2 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400">
                                        <span class="text-lg">🤩</span> <span class="text-xs font-medium">Eufórico</span>
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

    manageAssets() {
        const action = prompt('Digite "add" para adicionar ou "del" para remover um ativo:');
        if (action === 'add') {
            const newAsset = prompt('Digite o código do novo ativo (ex: EURUSD):');
            if (newAsset && newAsset.trim()) {
                const added = Store.addAsset(newAsset.trim().toUpperCase());
                if (added) this.refreshSelects();
                else alert('Ativo já existe ou inválido.');
            }
        } else if (action === 'del') {
            const asset = prompt('Digite o código do ativo para remover:');
            if (asset) {
                Store.deleteAsset(asset.trim().toUpperCase());
                this.refreshSelects();
            }
        }
    },

    manageTimeframes() {
        const action = prompt('Digite "add" para adicionar ou "del" para remover um timeframe:');
        if (action === 'add') {
            const newTf = prompt('Digite o novo timeframe (ex: 2h):');
            if (newTf && newTf.trim()) {
                const added = Store.addTimeframe(newTf.trim());
                if (added) this.refreshSelects();
                else alert('Timeframe já existe ou inválido.');
            }
        } else if (action === 'del') {
            const tf = prompt('Digite o timeframe para remover:');
            if (tf) {
                Store.deleteTimeframe(tf.trim());
                this.refreshSelects();
            }
        }
    },

    refreshSelects() {
        const assetSelect = document.getElementById('asset-select');
        const timeframeSelect = document.getElementById('timeframe-select');

        if (assetSelect) {
            const currentAsset = assetSelect.value;
            assetSelect.innerHTML = '<option value="" disabled>Selecione</option>' +
                Store.getAssets().map(a => `<option value="${a}">${a}</option>`).join('');
            assetSelect.value = currentAsset;
        }

        if (timeframeSelect) {
            const currentTf = timeframeSelect.value;
            timeframeSelect.innerHTML = '<option value="" disabled>Selecione</option>' +
                Store.getTimeframes().map(t => `<option value="${t}">${t}</option>`).join('');
            timeframeSelect.value = currentTf;
        }
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
                <div class="aspect-square p-0.5 border border-gray-100 dark:border-white/5 rounded-md bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-600 flex flex-col items-center justify-center">
                    <span class="text-[10px]">${daysInPrevMonth - i}</span>
                </div>
            `;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrades = trades.filter(t => t.date === dateStr);
            const dayProfit = dayTrades.reduce((sum, t) => sum + parseFloat(t.result), 0);

            let content = `<span class="font-medium text-gray-700 dark:text-gray-300" style="font-size: clamp(10px, 1vw, 14px);">${day}</span>`;
            let bgClass = "bg-white dark:bg-zenox-surface hover:border-blue-500 dark:hover:border-zenox-primary";

            if (dayTrades.length > 0) {
                const isProfit = dayProfit >= 0;
                const colorClass = isProfit ? 'text-emerald-500' : 'text-rose-500';
                const bgStatus = isProfit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

                content += `
                    <div class="mt-1 font-bold ${colorClass}" style="font-size: clamp(9px, 0.8vw, 12px);">
                        ${isProfit ? '+' : ''}$ ${Math.abs(dayProfit).toFixed(0)}
                    </div>
                    <div class="text-gray-400 leading-none" style="font-size: clamp(8px, 0.7vw, 10px);">
                        ${dayTrades.length} ops
                    </div>
                `;
                bgClass = bgStatus;
            }

            html += `
                <div onclick="TradesModule.openModal('${dateStr}')" class="aspect-square p-0.5 border border-gray-100 dark:border-white/5 rounded-md ${bgClass} transition-all cursor-pointer flex flex-col items-center justify-center group relative hover:scale-[1.02]">
                    ${content}
                </div>
            `;
        }

        // Next month days (fill remaining grid)
        const totalCells = 42; // 6 rows * 7 cols
        const remainingCells = totalCells - (firstDay + daysInMonth);

        for (let i = 1; i <= remainingCells; i++) {
            html += `
                <div class="aspect-square p-0.5 border border-gray-100 dark:border-white/5 rounded-md bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-600 flex flex-col items-center justify-center">
                    <span class="text-[10px]">${i}</span>
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

    openModal(data = null) {
        const modal = document.getElementById('trade-modal');
        const content = document.getElementById('trade-modal-content');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Reset form
        const form = document.getElementById('trade-form');
        form.reset();
        document.getElementById('trade-id-input').value = '';

        // Small delay for animation
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);

        if (data && typeof data === 'object' && data.id) {
            // Edit Mode
            document.getElementById('trade-id-input').value = data.id;

            // Populate fields
            const setVal = (name, val) => {
                const input = form.querySelector(`[name="${name}"]`);
                if (input) input.value = val;
            };

            setVal('date', data.date);
            setVal('asset', data.asset);
            setVal('type', data.type);
            setVal('result', data.result);
            setVal('contracts', data.contracts || 1);
            setVal('timeframe', data.timeframe || '5m');
            setVal('notes', data.notes || '');

            // Set trade type button styles
            this.setTradeType(data.type);

            // Populate other tabs if data exists (future proofing)
            if (data.stop_loss) setVal('stop_loss', data.stop_loss);
            if (data.take_profit) setVal('take_profit', data.take_profit);
            if (data.strategy) setVal('strategy', data.strategy);
            if (data.checklist) setVal('checklist', data.checklist);
            if (data.emotion) this.setEmotion(data.emotion);

        } else if (typeof data === 'string') {
            // Date string passed
            const dateInput = document.querySelector('#trade-form input[name="date"]');
            if (dateInput) dateInput.value = data;
        } else {
            // Default to today if no date provided
            const dateInput = document.querySelector('#trade-form input[name="date"]');
            if (dateInput && !dateInput.value) {
                dateInput.valueAsDate = new Date();
            }
        }
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
        const tradeId = formData.get('trade_id');

        const trade = {
            id: tradeId || Date.now().toString(), // Keep ID if editing
            date: formData.get('date'),
            asset: formData.get('asset'),
            type: formData.get('type'),
            result: parseFloat(formData.get('result')),
            strategy: formData.get('strategy') || 'Manual',
            contracts: formData.get('contracts') || 1,
            timeframe: formData.get('timeframe') || '5m',
            notes: formData.get('notes') || '',
            stop_loss: formData.get('stop_loss'),
            take_profit: formData.get('take_profit'),
            checklist: formData.get('checklist'),
            emotion: formData.get('emotion')
        };

        if (tradeId) {
            Store.updateTrade(trade);
        } else {
            Store.addTrade(trade);
        }

        this.closeModal();
        router.handleRoute(); // Re-render to show new trade
    },

    afterRender() {
        const editingTrade = Store.consumeEditingTrade();
        if (editingTrade) {
            setTimeout(() => {
                this.openModal(editingTrade);
            }, 100);
        }
    }
};
