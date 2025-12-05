window.ExpensesModule = {
    state: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        isMonthPickerOpen: false,
        viewScope: 'month', // 'month', 'year'
        chartScope: 'monthly', // 'weekly', 'monthly', 'annual'
        activeTab: 'Todos', // 'Todos', 'Fixa', 'Variável', 'Extra', 'Adicional'
        listTab: 'expenses', // 'expenses', 'income', 'investments'
        investmentFilter: 'month', // 'month', 'all'
        isCategoryManagerOpen: false,
        categoryManagerType: 'expense',
        isShowingAllOpenExpenses: false // New feature toggle
    },

    init() {
        this.render();
        this.renderCharts();
    },

    calculateStats(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const viewScope = this.state.viewScope;
        const banks = Store.getBanks();

        let income = 0;
        let expense = 0;
        let investment = 0;

        // Accumulated Investment Logic (Rewind from Current Total)
        // Accumulated Investment Logic (Rewind from Current Total)
        // 1. Start with the CURRENT total invested (from Store)
        let accumulatedInvestment = 0;
        const bankDefs = Store.getBankDefinitions();
        bankDefs.forEach(def => {
            accumulatedInvestment += (banks[def.id]?.invested || 0);
        });

        // 2. Determine Cutoff Date (End of selected period)
        let cutoffDate;
        if (viewScope === 'year') {
            cutoffDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // End of selected year
        } else {
            cutoffDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999); // End of selected month
        }

        // 3. Iterate through expenses to:
        //    a) Calculate Flow (Income, Expense, Investment for the period)
        //    b) Adjust Accumulated (Rewind future investments, Add past unlinked investments)
        expenses.forEach(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            // --- Accumulated Logic ---
            if (e.type === 'investment') {
                if (d > cutoffDate) {
                    // Future Investment (relative to view): REVERSE its effect to get back to past state
                    // Future Investment (relative to view): REVERSE its effect to get back to past state
                    // If it's in Store.banks (has bankId), we must subtract it because Store has it included.
                    const isInternalBank = e.bankId && bankDefs.some(b => b.id === e.bankId);

                    if (isInternalBank) {
                        if (e.investmentOperation === 'withdrawal') {
                            accumulatedInvestment += parseFloat(e.amount); // Reverse withdrawal
                        } else {
                            accumulatedInvestment -= parseFloat(e.amount); // Reverse deposit
                        }
                    }
                } else {
                    // Past/Current Investment (relative to view)
                    // Past/Current Investment (relative to view)
                    // If it's NOT in Store.banks (no bankId), we must ADD it manually because Store doesn't have it.
                    const isInternalBank = e.bankId && bankDefs.some(b => b.id === e.bankId);

                    if (!isInternalBank) {
                        if (e.investmentOperation === 'withdrawal') {
                            accumulatedInvestment -= parseFloat(e.amount);
                        } else {
                            accumulatedInvestment += parseFloat(e.amount);
                        }
                    }
                }
            }

            // --- Flow Logic (Stats for the period) ---
            if (isScopeMatch) {
                if (e.type === 'income') income += parseFloat(e.amount);
                if (e.type === 'expense') expense += parseFloat(e.amount);
                if (e.type === 'investment') investment += parseFloat(e.amount);
            }
        });

        // Balance = Income + Investment - Expense (User requested: soma da receita + investimentos)
        const balance = income + investment - expense;

        return { income, expense, investment, balance, accumulatedInvestment };
    },

    renderExpenseList(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const activeTab = this.state.activeTab;
        const viewScope = this.state.viewScope;

        const filtered = expenses.filter(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            // Feature: Show All Open Expenses (Global)
            // If toggle is ON, show ALL expenses that are NOT paid, effectively ignoring date scope
            if (this.state.isShowingAllOpenExpenses && e.type === 'expense' && !e.paid) {
                return true;
            }

            if (activeTab === 'Todos') {
                return isScopeMatch && e.type === 'expense';
            }
            return isScopeMatch &&
                e.type === 'expense' &&
                e.categoryType === activeTab;
        });

        // Sort: If showing global open debts, prioritize oldest first
        if (this.state.isShowingAllOpenExpenses) {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        if (filtered.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fa-solid fa-receipt text-3xl mb-2 opacity-50"></i>
                    <p>Nenhuma despesa nesta categoria.</p>
                </div>
            `;
        }

        return filtered.map(e => this.renderListItem(e)).join('');
    },

    renderInvestmentList(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const viewScope = this.state.viewScope;

        // --- Multi-source Data Gathering ---

        // 1. Manual Bank Investments (Static Balance)
        // These are not transaction-based, so we show them regardless of date/filter?
        // Or maybe just show them always at the top since they represent "Current State".
        let bankRows = '';
        const banks = Store.getBanks();
        const bankDefs = Store.getBankDefinitions();

        bankDefs.forEach(def => {
            const bankData = banks[def.id];
            if (bankData && bankData.invested > 0) {
                bankRows += this.renderBankInvestmentRow(def, bankData);
            }
        });

        // 2. Investment Transactions (History)

        const filtered = expenses.filter(e => {
            // Robust Date Parsing
            let d = new Date(e.date);
            if (isNaN(d.getTime())) {
                const parts = e.date.split('-');
                if (parts.length === 3) {
                    d = new Date(parts[0], parts[1] - 1, parts[2]);
                }
            }

            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;

            if (this.state.investmentFilter === 'all') {
                return e.type === 'investment';
            }

            // Default: Month view
            return e.type === 'investment' && isYearMatch && isMonthMatch;
        });

        if (filtered.length === 0 && bankRows === '') {
            return `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fa-solid fa-piggy-bank text-3xl mb-2 opacity-50"></i>
                    <p>Nenhum investimento encontrado.</p>
                </div>
            `;
        }

        return bankRows + filtered.map(e => this.renderListItem(e)).join('');
    },

    renderBankInvestmentRow(def, data) {
        return `
            <div class="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:translate-x-1 transition-transform mb-3">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        <i class="fa-solid fa-building-columns"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 dark:text-white capitalize">${def.name}</h4>
                        <div class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <i class="fa-solid fa-lock"></i> Saldo Investido (Manual)
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-emerald-600 dark:text-emerald-500">R$ ${Store.formatCurrency(data.invested)}</div>
                    </div>
                     <div class="flex gap-2 ml-2">
                        <button onclick="ExpensesModule.openBankModal('${def.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getCategoryStyle(category) {
        const styles = {
            'Alimentação': { icon: 'fa-utensils', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
            'Supermercado': { icon: 'fa-cart-shopping', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
            'Restaurante': { icon: 'fa-utensils', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },

            'Transporte': { icon: 'fa-car', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
            'Combustível': { icon: 'fa-gas-pump', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
            'Uber': { icon: 'fa-taxi', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },

            'Moradia': { icon: 'fa-house', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
            'Casa': { icon: 'fa-house', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
            'Aluguel': { icon: 'fa-key', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },

            'Saúde': { icon: 'fa-heart-pulse', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
            'Farmácia': { icon: 'fa-pills', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
            'Médico': { icon: 'fa-user-doctor', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },

            'Educação': { icon: 'fa-graduation-cap', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
            'Faculdade': { icon: 'fa-graduation-cap', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
            'Curso': { icon: 'fa-book', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },

            'Lazer': { icon: 'fa-gamepad', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/20' },
            'Viagem': { icon: 'fa-plane', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/20' },
            'Cinema': { icon: 'fa-film', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/20' },

            'Compras': { icon: 'fa-bag-shopping', color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/20' },
            'Shopping': { icon: 'fa-bag-shopping', color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/20' },
            'Roupas': { icon: 'fa-shirt', color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/20' },

            'Serviços': { icon: 'fa-bolt', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
            'Assinaturas': { icon: 'fa-file-signature', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
            'Internet': { icon: 'fa-wifi', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' }
        };

        return styles[category] || { icon: 'fa-tag', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-white/5' };
    },

    renderListItem(e) {
        const isInvestment = e.type === 'investment';
        const isIncome = e.type === 'income';

        let icon = 'fa-tag';
        let colorClass = 'text-rose-500';
        let bgClass = 'bg-gray-100 dark:bg-white/5';
        let iconColorClass = 'text-gray-500 dark:text-gray-400';
        let amountSign = '-';

        if (isInvestment) {
            icon = 'fa-chart-line';
            colorClass = 'text-emerald-600 dark:text-emerald-500';
            bgClass = 'bg-blue-100 dark:bg-blue-900/20';
            iconColorClass = 'text-blue-600 dark:text-blue-400';

            if (e.investmentOperation === 'withdrawal') {
                amountSign = '-';
                colorClass = 'text-rose-600 dark:text-rose-500';
                bgClass = 'bg-emerald-100 dark:bg-emerald-900/20';
                iconColorClass = 'text-emerald-600 dark:text-emerald-400';
                icon = 'fa-money-bill-transfer';
            } else {
                amountSign = '';
            }
        } else if (isIncome) {
            icon = 'fa-arrow-trend-up';
            colorClass = 'text-emerald-600 dark:text-emerald-500';
            bgClass = 'bg-emerald-100 dark:bg-emerald-900/20';
            iconColorClass = 'text-emerald-600 dark:text-emerald-400';
            amountSign = '';
        } else {
            // Expense - Use Category Style
            const style = this.getCategoryStyle(e.category);
            icon = style.icon;
            bgClass = style.bg;
            iconColorClass = style.color.replace('text-', 'text-'); // Ensure it's a text color class
        }

        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center ${iconColorClass} shadow-sm">
                        <i class="fa-solid ${icon} text-lg"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-sm text-gray-800 dark:text-white">${e.description}</h4>
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>${new Date(e.date).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>${e.category}</span>
                            ${e.paymentMode === 'parcelado' ? '<span class="text-orange-500">• Parcelado</span>' : ''}
                            ${e.isRecurring ? '<span class="text-blue-500">• Recorrente</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-semibold text-sm ${colorClass}">${amountSign} R$ ${Store.formatCurrency(e.amount)}</span>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="ExpensesModule.editExpense('${e.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="ExpensesModule.deleteExpense('${e.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderIncomeList(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const viewScope = this.state.viewScope;

        const filtered = expenses.filter(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            return isScopeMatch && e.type === 'income';
        });

        if (filtered.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fa-solid fa-sack-dollar text-3xl mb-2 opacity-50"></i>
                    <p>Nenhuma receita encontrada.</p>
                </div>
            `;
        }

        return filtered.map(e => this.renderListItem(e)).join('');
    },

    render() {
        const expenses = Store.getExpenses();
        const stats = this.calculateStats(expenses);
        const banks = Store.getBanks();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        return `
            <div class="space-y-6 animate-fade-in" onclick="ExpensesModule.handleOutsideClick(event)">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-105 transition-all group">
                            <i class="fa-solid fa-shield-halved text-xl group-hover:rotate-12 transition-transform"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 dark:text-white tracking-tighter" style="font-family: 'Outfit', sans-serif;">Controle Financeiro</h2>
                        </div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="flex items-center gap-4 relative">
                        <button onclick="ExpensesModule.clearAll()" class="text-xs text-rose-500 hover:text-rose-600 font-medium underline">
                            Limpar Tudo
                        </button>

                        <!-- View Scope Toggle -->
                        <div class="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                            <button onclick="ExpensesModule.setViewScope('month')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-all ${this.state.viewScope === 'month' ? 'bg-white dark:bg-zenox-surface text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                Mês
                            </button>
                            <button onclick="ExpensesModule.setViewScope('year')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-all ${this.state.viewScope === 'year' ? 'bg-white dark:bg-zenox-surface text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                Ano
                            </button>
                        </div>

                        <!-- Month Picker -->
                        <div class="flex items-center bg-white dark:bg-zenox-surface rounded-xl border border-gray-200 dark:border-white/10 p-1 shadow-sm relative z-20">
                            <button onclick="ExpensesModule.changeMonth(-1)" class="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <div class="px-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onclick="ExpensesModule.toggleMonthPicker(event)">
                                <span class="block text-sm font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                                    ${this.getMonthName(this.state.currentMonth)}
                                    <i class="fa-solid fa-caret-down text-xs opacity-50"></i>
                                </span>
                                <span class="block text-xs text-gray-500 dark:text-gray-400">${this.state.currentYear}</span>
                            </div>
                            <button onclick="ExpensesModule.changeMonth(1)" class="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>

                        <!-- Mini Calendar Dropdown -->
                        ${this.state.isMonthPickerOpen ? `
                            <div class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zenox-surface rounded-xl shadow-xl border border-gray-100 dark:border-white/10 p-4 z-30 animate-fade-in" onclick="event.stopPropagation()">
                                <div class="grid grid-cols-3 gap-2">
                                    ${months.map((m, i) => `
                                        <button onclick="ExpensesModule.selectMonth(${i})" 
                                            class="p-2 text-sm rounded-lg transition-colors ${i === this.state.currentMonth ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}">
                                            ${m}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Main Content (Left Column) -->
                    <div class="lg:col-span-3 space-y-6">
                        <!-- Summary Cards Row -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Saldo em Conta -->
                            <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden hover:scale-[1.02] transition-transform">
                                <div class="absolute top-4 right-4 text-emerald-500">
                                    <i class="fa-solid fa-building-columns text-xl"></i>
                                </div>
                                <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Saldo em Conta</p>
                                <h3 class="text-xl font-bold text-emerald-700 dark:text-emerald-300">R$ ${Store.formatCurrency((banks.nubank?.balance || 0) + (banks.mercadoPago?.balance || 0) + (banks.other?.balance || 0))}</h3>
                            </div>

                            <!-- Despesas -->
                            <div onclick="ExpensesModule.setListTab('expenses')" class="cursor-pointer bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-5 relative overflow-hidden hover:scale-[1.02] transition-transform">
                                <div class="absolute top-4 right-4 text-rose-500">
                                    <i class="fa-solid fa-arrow-trend-down text-xl"></i>
                                </div>
                                <p class="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Despesas</p>
                                <h3 class="text-xl font-bold text-rose-700 dark:text-rose-300">R$ ${Store.formatCurrency(stats.expense)}</h3>
                            </div>

                            <!-- Investimentos -->
                            <div onclick="ExpensesModule.setListTab('investments')" class="cursor-pointer bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 relative overflow-hidden hover:scale-[1.02] transition-transform">
                                <div class="absolute top-4 right-4 text-blue-500">
                                    <i class="fa-solid fa-piggy-bank text-xl"></i>
                                </div>
                                <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Investimentos (${this.state.viewScope === 'year' ? 'Ano' : 'Mês'})</p>
                                <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300">R$ ${Store.formatCurrency(stats.investment)}</h3>
                                <p class="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Acumulado: R$ ${Store.formatCurrency(stats.accumulatedInvestment)}</p>
                            </div>
                        </div>

                        <!-- Main Chart Section -->
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="font-bold text-gray-800 dark:text-white">
                                    ${this.state.chartScope === 'annual' ? `Visão Anual - ${this.state.currentYear}` :
                this.state.chartScope === 'monthly' ? `Visão Mensal - ${this.getMonthName(this.state.currentMonth)}` :
                    'Visão Semanal'}
                                </h3>
                                <div class="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                                    <button onclick="ExpensesModule.setChartScope('annual')" class="px-3 py-1 text-xs font-medium rounded-md transition-all ${this.state.chartScope === 'annual' ? 'bg-white dark:bg-zenox-surface text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">Anual</button>
                                    <button onclick="ExpensesModule.setChartScope('monthly')" class="px-3 py-1 text-xs font-medium rounded-md transition-all ${this.state.chartScope === 'monthly' ? 'bg-white dark:bg-zenox-surface text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">Mensal</button>
                                    <button onclick="ExpensesModule.setChartScope('weekly')" class="px-3 py-1 text-xs font-medium rounded-md transition-all ${this.state.chartScope === 'weekly' ? 'bg-white dark:bg-zenox-surface text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">Semanal</button>
                                </div>
                            </div>
                            <div class="h-64 w-full relative">
                                <canvas id="mainChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar (Right Column) -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Saldo -->
                        <div class="bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-sm h-full">
                            <div class="absolute top-4 right-4 text-gray-400">
                                <i class="fa-solid fa-wallet text-xl"></i>
                            </div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Saldo Total</p>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">R$ ${Store.formatCurrency(stats.balance)}</h3>
                            
                            <div class="space-y-3">
                                <!-- Nubank (Roxo) -->
                                <div class="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-500/20">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="font-semibold text-sm text-gray-800 dark:text-white">Nubank</span>
                                        </div>
                                        <button onclick="ExpensesModule.openBankModal('nubank')" class="text-xs text-gray-500 hover:text-purple-600 dark:text-gray-400">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-end">
                                        <div>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                                            <p class="font-bold text-gray-800 dark:text-white">R$ ${Store.formatCurrency(banks.nubank?.balance || 0)}</p>
                                        </div>
                                        ${this.getDebt('nubank') > 0 ? `
                                            <div class="text-right">
                                                <p class="text-xs text-rose-500">Fatura</p>
                                                <p class="font-bold text-rose-500">- R$ ${Store.formatCurrency(this.getDebt('nubank'))}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${(banks.nubank?.invested || 0) > 0 ? `
                                        <div class="mt-2 pt-2 border-t border-purple-200 dark:border-purple-500/20 flex justify-between">
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Investido</p>
                                            <p class="text-xs font-bold text-blue-600 dark:text-blue-400">R$ ${Store.formatCurrency(banks.nubank?.invested || 0)}</p>
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- Mercado Pago (Azul) -->
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="font-semibold text-sm text-gray-800 dark:text-white">Mercado Pago</span>
                                        </div>
                                        <button onclick="ExpensesModule.openBankModal('mercadoPago')" class="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-end">
                                        <div>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                                            <p class="font-bold text-gray-800 dark:text-white">R$ ${Store.formatCurrency(banks.mercadoPago?.balance || 0)}</p>
                                        </div>
                                        ${this.getDebt('mercadoPago') > 0 ? `
                                            <div class="text-right">
                                                <p class="text-xs text-rose-500">Fatura</p>
                                                <p class="font-bold text-rose-500">- R$ ${Store.formatCurrency(this.getDebt('mercadoPago'))}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${(banks.mercadoPago?.invested || 0) > 0 ? `
                                        <div class="mt-2 pt-2 border-t border-blue-200 dark:border-blue-500/20 flex justify-between">
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Investido</p>
                                            <p class="text-xs font-bold text-blue-600 dark:text-blue-400">R$ ${Store.formatCurrency(banks.mercadoPago?.invested || 0)}</p>
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- Outros (Preto/Cinza Escuro) -->
                                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="font-semibold text-sm text-gray-800 dark:text-white">Outros / Carteira</span>
                                        </div>
                                        <button onclick="ExpensesModule.openBankModal('other')" class="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-end">
                                        <div>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                                            <p class="font-bold text-gray-800 dark:text-white">R$ ${Store.formatCurrency(banks.other?.balance || 0)}</p>
                                        </div>
                                        ${this.getDebt('other') > 0 ? `
                                            <div class="text-right">
                                                <p class="text-xs text-rose-500">Dívida</p>
                                                <p class="font-bold text-rose-500">- R$ ${Store.formatCurrency(this.getDebt('other'))}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${(banks.other?.invested || 0) > 0 ? `
                                        <div class="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 flex justify-between">
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Investido</p>
                                            <p class="text-xs font-bold text-blue-600 dark:text-blue-400">R$ ${Store.formatCurrency(banks.other?.invested || 0)}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Combined Section: Actions & Category Chart -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Action Cards -->
                    <div class="space-y-6 lg:col-span-1">
                        <!-- Receitas Action -->
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <i class="fa-solid fa-arrow-trend-up text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800 dark:text-white">Receitas</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Total: R$ ${Store.formatCurrency(stats.income)}</p>
                                </div>
                            </div>
                            <button onclick="ExpensesModule.openModal('income')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>

                        <!-- Despesas Action -->
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                    <i class="fa-solid fa-arrow-trend-down text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800 dark:text-white">Despesas</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Total: R$ ${Store.formatCurrency(stats.expense)}</p>
                                </div>
                            </div>
                            <button onclick="ExpensesModule.openModal('expense')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>

                        <!-- Investimentos Action -->
                        <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <i class="fa-solid fa-piggy-bank text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800 dark:text-white">Investimentos</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">R$ ${Store.formatCurrency(stats.investment)}</p>
                                </div>
                            </div>
                            <button onclick="ExpensesModule.openModal('investment')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Right Column: Category Chart -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 lg:col-span-2">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-6">Despesas por Categoria</h3>
                        <div class="h-64 w-full relative flex items-center justify-center">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Lists Section -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div class="p-4 md:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-4">
                                <button onclick="ExpensesModule.setListTab('income')" class="flex items-center gap-2 pb-2 border-b-2 transition-colors ${this.state.listTab === 'income' ? 'border-emerald-500 text-gray-800 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}">
                                    <h3 class="font-bold">Receitas</h3>
                                </button>
                                <button onclick="ExpensesModule.setListTab('expenses')" class="flex items-center gap-2 pb-2 border-b-2 transition-colors ${this.state.listTab === 'expenses' ? 'border-rose-500 text-gray-800 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}">
                                    <h3 class="font-bold">Despesas</h3>
                                </button>
                                <button onclick="ExpensesModule.setListTab('investments')" class="flex items-center gap-2 pb-2 border-b-2 transition-colors ${this.state.listTab === 'investments' ? 'border-blue-500 text-gray-800 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}">
                                    <h3 class="font-bold">Investimentos</h3>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                            <button onclick="ExpensesModule.openCloseMonthModal()" class="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-check-double"></i> Fechar Mês
                            </button>
                            <button onclick="ExpensesModule.openModal('expense')" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i> Adicionar
                            </button>
                        </div>
                    </div>
                    <!-- Tabs (Only for Expenses) -->
                    ${this.state.listTab === 'expenses' ? `
                        <div class="px-4 md:px-6 pt-4 flex gap-1 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar items-center">
                            ${['Todos', 'Fixa', 'Variável', 'Extra', 'Adicional'].map(tab => `
                                <button onclick="ExpensesModule.switchTab('${tab}')" 
                                    class="px-6 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${this.state.activeTab === tab ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                    ${tab} (${this.getCountByTab(tab)})
                                </button>
                            `).join('')}

                            <!-- Global Open Debts Toggle -->
                            <button onclick="ExpensesModule.toggleShowAllOpen()" 
                                class="ml-auto px-4 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 whitespace-nowrap ${this.state.isShowingAllOpenExpenses
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }">
                                <i class="fa-solid fa-filter-circle-dollar"></i>
                                ${this.state.isShowingAllOpenExpenses ? 'Mostrando Dívidas (Todas)' : 'Ver Dívidas em Aberto'}
                            </button>
                        </div>
                    ` : ''}

                    <!-- Tabs (Only for Investments) -->
                    ${this.state.listTab === 'investments' ? `
                        <div class="px-4 md:px-6 pt-4 flex gap-1 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar">
                            <button onclick="ExpensesModule.setInvestmentFilter('month')" 
                                class="px-6 py-2 text-sm font-medium border-b-2 transition-colors ${this.state.investmentFilter === 'month' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                Mês Atual
                            </button>
                            <button onclick="ExpensesModule.setInvestmentFilter('all')" 
                                class="px-6 py-2 text-sm font-medium border-b-2 transition-colors ${this.state.investmentFilter === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                Todos
                            </button>
                        </div>
                    ` : ''}

                    <!-- List Content -->
                    <div class="p-6">
                        ${this.state.listTab === 'expenses' ? `
                            <div class="flex items-center gap-2 mb-4">
                                <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded">R$ ${Store.formatCurrency(this.getTotalByTab(this.state.activeTab))}</span>
                                <span class="text-xs text-gray-400">(${this.getPercentageByTab(this.state.activeTab, stats.income)}% da receita)</span>
                            </div>
                            <div class="space-y-3">
                                ${this.renderExpenseList(expenses)}
                            </div>
                        ` : this.state.listTab === 'income' ? `
                            <div class="space-y-3">
                                ${this.renderIncomeList(expenses)}
                            </div>
                        ` : `
                            <div class="space-y-3">
                                ${this.renderInvestmentList(expenses)}
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            <!-- Modals (Expense & Category) -->
            <div id="expense-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-[95%] md:w-full max-w-lg shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto" id="expense-modal-content">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white" id="modal-title">Nova Despesa</h3>
                        <button onclick="ExpensesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="expense-form" onsubmit="ExpensesModule.saveExpense(event)" class="p-6 space-y-5">
                        <input type="hidden" id="modal-type-input" name="type">
                        <input type="hidden" id="modal-id-input" name="id">
                        <input type="hidden" id="modal-payment-mode" name="paymentMode" value="unico">
                        
                        <!-- Payment Source (Bank) -->
                        <div class="space-y-1">
                            <div class="flex justify-between items-center">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Fonte / Destino</label>
                                <button type="button" onclick="ExpensesModule.openCategoryManager('bank')" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                    <i class="fa-solid fa-gear"></i> Gerenciar
                                </button>
                            </div>
                            <select name="bankId" class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                                <!-- Populated by JS -->
                            </select>
                        </div>

                        <!-- Investment Operation (Aporte/Resgate) -->
                        <div id="investment-operation-field" class="hidden space-y-2 mb-4">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Operação</label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="cursor-pointer relative">
                                    <input type="radio" name="investmentOperation" value="deposit" class="peer sr-only" checked onchange="ExpensesModule.toggleInvestmentOperation()">
                                    <div class="p-3 rounded-xl border border-gray-200 dark:border-white/10 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:dark:bg-blue-900/20 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 peer-checked:text-blue-600 dark:peer-checked:text-blue-400">
                                        <i class="fa-solid fa-arrow-up-right-dots"></i>
                                        <span class="font-medium">Aporte</span>
                                    </div>
                                </label>
                                <label class="cursor-pointer relative">
                                    <input type="radio" name="investmentOperation" value="withdrawal" class="peer sr-only" onchange="ExpensesModule.toggleInvestmentOperation()">
                                    <div class="p-3 rounded-xl border border-gray-200 dark:border-white/10 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:dark:bg-emerald-900/20 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400">
                                        <i class="fa-solid fa-arrow-down-left-dots"></i>
                                        <span class="font-medium">Resgate</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
                            <input type="text" name="description" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400" placeholder="Ex: Supermercado">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300" id="amount-label">Valor (R$)</label>
                                <input type="number" name="amount" step="0.01" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400" placeholder="0,00">
                            </div>
                            <div class="space-y-1" id="date-container">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Data</label>
                                <input type="date" name="date" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                            </div>
                        </div>

                        <!-- Payment Mode (Only for Expense) -->
                        <div id="payment-mode-container" class="space-y-2">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Modo de Pagamento</label>
                            <div class="grid grid-cols-3 gap-2">
                                <button type="button" id="btn-mode-unico" onclick="ExpensesModule.setPaymentMode('unico')" class="payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-all">
                                    <i class="fa-solid fa-money-bill-1"></i>
                                    <span class="text-xs font-medium">Único</span>
                                </button>
                                <button type="button" id="btn-mode-parcelado" onclick="ExpensesModule.setPaymentMode('parcelado')" class="payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all">
                                    <i class="fa-solid fa-credit-card"></i>
                                    <span class="text-xs font-medium">Parcelado</span>
                                </button>
                                <button type="button" id="btn-mode-recorrente" onclick="ExpensesModule.setPaymentMode('recorrente')" class="payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all">
                                    <i class="fa-solid fa-arrows-rotate"></i>
                                    <span class="text-xs font-medium">Fixo</span>
                                </button>
                            </div>
                        </div>

                        <!-- Installments (Parcelado) -->
                        <div id="installments-container" class="hidden space-y-1 animate-fade-in">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Número de Parcelas</label>
                            <select name="installments" class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white" onchange="ExpensesModule.updateSubmitButton()">
                                ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}x</option>`).join('')}
                                ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 13}">${i + 13}x</option>`).join('')}
                            </select>
                        </div>

                        <!-- Recurring Months (Recorrente) -->
                        <div id="months-container" class="hidden space-y-1 animate-fade-in">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Repetir por quantos meses?</label>
                            <select name="recurringMonths" class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                                <option value="12">12 meses (1 ano)</option>
                                <option value="24">24 meses (2 anos)</option>
                                <option value="indefinite">Indefinido</option>
                            </select>
                        </div>

                        <!-- Category Selection -->
                        <div class="space-y-1">
                            <div class="flex justify-between items-center">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoria</label>
                                <button type="button" onclick="ExpensesModule.openCategoryManager('category')" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                    <i class="fa-solid fa-gear"></i> Gerenciar
                                </button>
                            </div>
                            <select name="category" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                                <!-- Populated by JS -->
                            </select>
                        </div>

                        <!-- Category Type (Fixa/Variável/etc) - Only for Expense -->
                        <div id="category-type-field" class="space-y-1">
                            <div class="flex justify-between items-center">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</label>
                                <button type="button" onclick="ExpensesModule.openCategoryManager('type')" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                    <i class="fa-solid fa-gear"></i> Gerenciar
                                </button>
                            </div>
                            <select name="categoryType" class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                                <option value="Fixa">Fixa</option>
                                <option value="Variável">Variável</option>
                                <option value="Extra">Extra</option>
                                <option value="Adicional">Adicional</option>
                            </select>
                        </div>

                        <!-- Income Recurring Option -->
                        <div id="income-recurring-field" class="hidden space-y-2 animate-fade-in">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="income-is-recurring" name="isRecurring" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" onchange="ExpensesModule.toggleIncomeRecurring()">
                                <span class="text-sm text-gray-700 dark:text-gray-300">Receita Recorrente (Mensal)</span>
                            </label>
                            <div id="income-months-container" class="hidden pl-6">
                                <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Repetir por:</label>
                                <select name="incomeRecurringMonths" class="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none text-gray-800 dark:text-white">
                                    <option value="12">12 meses</option>
                                    <option value="indefinite">Indefinido</option>
                                </select>
                            </div>
                        </div>

                        <div class="pt-4">
                            <button type="submit" id="submit-btn" class="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all transform active:scale-[0.98]">
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Category Manager Modal -->
            <div id="category-manager-modal" class="fixed inset-0 z-[60] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-[95%] md:w-full max-w-md shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10" id="category-manager-content">
                    <div class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white" id="category-manager-title">Gerenciar Categorias</h3>
                        <button onclick="ExpensesModule.closeCategoryManager()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="flex gap-2">
                            <input type="text" id="new-category-input" placeholder="Nova categoria..." class="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none text-gray-800 dark:text-white text-sm">
                            <button onclick="ExpensesModule.addCategory()" class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <div class="max-h-60 overflow-y-auto space-y-2" id="category-list-container">
                            <!-- List populated by JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Close Month Modal -->
            <div id="close-month-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-[95%] md:w-full max-w-md shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10" id="close-month-content">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Fechar Mês</h3>
                        <button onclick="ExpensesModule.closeCloseMonthModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20 text-center">
                            <p class="text-sm text-rose-600 dark:text-rose-400 mb-1">Total de Despesas</p>
                            <h3 class="text-2xl font-bold text-rose-700 dark:text-rose-300" id="close-month-total">R$ 0,00</h3>
                        </div>
                        
                        <div class="space-y-3">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Como você pagou essas despesas?</p>
                            <div id="payment-sources-container" class="space-y-3">
                                <!-- Dynamic inputs injected by openCloseMonthModal -->
                            </div>
                        </div>

                        <button onclick="ExpensesModule.confirmCloseMonth()" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all mt-4">
                            Confirmar Fechamento
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(tab) {
        this.state.activeTab = tab;
        router.handleRoute();
    },

    setListTab(tab) {
        this.state.listTab = tab;
        router.handleRoute();
    },

    toggleShowAllOpen() {
        this.state.isShowingAllOpenExpenses = !this.state.isShowingAllOpenExpenses;
        router.handleRoute(); // Refresh UI
    },

    setViewScope(scope) {
        this.state.viewScope = scope;
        router.handleRoute();
    },

    setChartScope(scope) {
        this.state.chartScope = scope;
        router.handleRoute();
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
        router.handleRoute();
    },

    toggleMonthPicker(event) {
        if (event) event.stopPropagation();
        this.state.isMonthPickerOpen = !this.state.isMonthPickerOpen;
        router.handleRoute();
    },

    handleOutsideClick(event) {
        if (this.state.isMonthPickerOpen) {
            this.state.isMonthPickerOpen = false;
            router.handleRoute();
        }
    },

    selectMonth(index) {
        this.state.currentMonth = index;
        this.state.isMonthPickerOpen = false;
        router.handleRoute();
    },

    setPaymentMode(mode) {
        document.getElementById('modal-payment-mode').value = mode;

        const amountLabel = document.getElementById('amount-label');
        const dateContainer = document.getElementById('date-container');
        const installmentsContainer = document.getElementById('installments-container');
        const monthsContainer = document.getElementById('months-container');
        const submitBtn = document.getElementById('submit-btn');

        // Reset Styles
        ['unico', 'recorrente', 'parcelado'].forEach(m => {
            const btn = document.getElementById(`btn-mode-${m}`);
            if (btn) {
                btn.className = 'payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all';
            }
        });

        // Apply Active Style
        const activeBtn = document.getElementById(`btn-mode-${mode}`);

        // Reset Visibility
        if (installmentsContainer) installmentsContainer.classList.add('hidden');
        if (monthsContainer) monthsContainer.classList.add('hidden');
        // Date container is now always visible
        if (dateContainer) dateContainer.classList.remove('hidden');

        if (mode === 'parcelado') {
            if (activeBtn) activeBtn.className = 'payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';

            if (amountLabel) amountLabel.innerText = 'Valor da Parcela (R$)';
            if (installmentsContainer) installmentsContainer.classList.remove('hidden');

            this.updateSubmitButton();
        } else if (mode === 'recorrente') {
            if (activeBtn) activeBtn.className = 'payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';

            if (amountLabel) amountLabel.innerText = 'Valor (R$)';
            if (monthsContainer) monthsContainer.classList.remove('hidden');

            if (submitBtn) {
                submitBtn.innerText = 'Salvar Recorrência';
                submitBtn.className = 'px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all';
            }
        } else {
            // Unico
            if (activeBtn) activeBtn.className = 'payment-mode-btn flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400';

            if (amountLabel) amountLabel.innerText = 'Valor (R$)';

            if (submitBtn) {
                submitBtn.innerText = 'Salvar';
                submitBtn.className = 'px-8 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/20 transition-all';
            }
        }
    },

    updateSubmitButton() {
        const mode = document.getElementById('modal-payment-mode').value;
        const submitBtn = document.getElementById('submit-btn');
        if (mode === 'parcelado' && submitBtn) {
            const installments = document.querySelector('select[name="installments"]').value;
            submitBtn.innerText = `Criar ${installments} parcelas`;
            submitBtn.className = 'px-8 py-2.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/20 transition-all';
        }
    },

    toggleIncomeRecurring() {
        const isChecked = document.getElementById('income-is-recurring').checked;
        const monthsContainer = document.getElementById('income-months-container');
        if (isChecked) {
            monthsContainer.classList.remove('hidden');
        } else {
            monthsContainer.classList.add('hidden');
        }
    },

    toggleInvestmentOperation() {
        // Just for visual feedback if needed, currently handled by CSS peer-checked
    },

    openModal(type, id = null) {
        const modal = document.getElementById('expense-modal');
        const content = document.getElementById('expense-modal-content');
        const title = document.getElementById('modal-title');
        const typeInput = document.getElementById('modal-type-input');
        const idInput = document.getElementById('modal-id-input');
        const categorySelect = document.querySelector('select[name="category"]');
        const categoryTypeSelect = document.querySelector('select[name="categoryType"]');
        const paymentModeContainer = document.getElementById('payment-mode-container');
        const categoryTypeField = document.getElementById('category-type-field');
        const incomeRecurringField = document.getElementById('income-recurring-field');
        const investmentOperationField = document.getElementById('investment-operation-field');

        typeInput.value = type;
        idInput.value = id || '';

        // Reset form
        document.getElementById('expense-form').reset();
        const dateInput = document.querySelector('#expense-form input[name="date"]');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }

        // Default Visibility
        if (paymentModeContainer) paymentModeContainer.classList.add('hidden');
        if (categoryTypeField) categoryTypeField.classList.add('hidden');
        if (incomeRecurringField) incomeRecurringField.classList.add('hidden');
        if (investmentOperationField) investmentOperationField.classList.add('hidden');

        // Populate Categories
        let categories = [];
        if (type === 'expense') {
            categories = Store.getCategories('expense');
            title.innerText = id ? 'Editar Despesa' : 'Nova Despesa';
            if (paymentModeContainer) paymentModeContainer.classList.remove('hidden');
            if (categoryTypeField) categoryTypeField.classList.remove('hidden');

            // Populate Types
            if (categoryTypeSelect) {
                const types = Store.getExpenseTypes();
                categoryTypeSelect.innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
            }

            this.setPaymentMode('unico');
        } else if (type === 'income') {
            categories = Store.getCategories('income');
            title.innerText = id ? 'Editar Receita' : 'Nova Receita';
            if (incomeRecurringField) incomeRecurringField.classList.remove('hidden');
        } else if (type === 'investment') {
            categories = Store.getCategories('investment');
            title.innerText = id ? 'Editar Investimento' : 'Novo Investimento';
            if (investmentOperationField) investmentOperationField.classList.remove('hidden');
        }



        // Populate Banks
        const bankSelect = document.querySelector('select[name="bankId"]');
        if (bankSelect) {
            const banks = Store.getBankDefinitions();
            bankSelect.innerHTML = banks.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }

        categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

        // Edit Mode
        if (id) {
            const expense = Store.getExpenses().find(e => e.id === id);
            if (expense) {
                document.querySelector('input[name="description"]').value = expense.description;
                document.querySelector('input[name="amount"]').value = expense.amount;
                document.querySelector('input[name="date"]').value = expense.date;
                categorySelect.value = expense.category;

                if (type === 'expense') {
                    if (categoryTypeSelect) categoryTypeSelect.value = expense.categoryType || 'Variável';
                    this.setPaymentMode(expense.paymentMode || 'unico');
                    if (expense.paymentMode === 'parcelado') {
                        document.querySelector('select[name="installments"]').value = expense.installments || 1;
                        this.updateSubmitButton();
                    } else if (expense.paymentMode === 'recorrente') {
                        document.querySelector('select[name="recurringMonths"]').value = expense.recurringMonths || 12;
                    }
                } else if (type === 'income') {
                    if (expense.isRecurring) {
                        document.getElementById('income-is-recurring').checked = true;
                        this.toggleIncomeRecurring();
                        document.querySelector('select[name="incomeRecurringMonths"]').value = expense.recurringMonths || 12;
                    }
                } else if (type === 'investment') {
                    const op = expense.investmentOperation || 'deposit';
                    const radio = document.querySelector(`input[name = "investmentOperation"][value = "${op}"]`);
                    if (radio) radio.checked = true;
                }
            }
        }

        modal.classList.remove('hidden');
        // Small delay for transition
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    },

    closeModal() {
        const modal = document.getElementById('expense-modal');
        const content = document.getElementById('expense-modal-content');

        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    saveExpense(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Handle checkboxes
        data.isRecurring = document.getElementById('income-is-recurring')?.checked || false;

        // Calculate Bank Balance Updates
        // If editing, revert previous impact first
        if (data.id) {
            const oldExpense = Store.getExpenses().find(e => e.id === data.id);
            if (oldExpense && oldExpense.bankId) {
                const oldAmount = parseFloat(oldExpense.amount);
                const oldBankId = oldExpense.bankId;

                // Revert logic (same as delete)
                if (oldExpense.type === 'expense') {
                    // Expense: No balance change to revert (new logic)
                } else if (oldExpense.type === 'income') {
                    Store.updateBankBalance(oldBankId, -oldAmount, 'balance');
                } else if (oldExpense.type === 'investment') {
                    if (oldExpense.investmentOperation === 'deposit') {
                        if (oldBankId !== 'other') Store.updateBankBalance(oldBankId, oldAmount, 'balance');
                        Store.updateBankBalance(oldBankId, -oldAmount, 'invested');
                    } else if (oldExpense.investmentOperation === 'withdrawal') {
                        if (oldBankId !== 'other') Store.updateBankBalance(oldBankId, -oldAmount, 'balance');
                        Store.updateBankBalance(oldBankId, oldAmount, 'invested');
                    }
                }
            }
        }

        // Apply new impact (for both new and edited)
        const amount = parseFloat(data.amount);
        const bankId = data.bankId;

        if (bankId) {
            if (data.type === 'expense') {
                // Expense: Do NOT deduct from Balance immediately.
            } else if (data.type === 'income') {
                Store.updateBankBalance(bankId, amount, 'balance');
            } else if (data.type === 'investment') {
                if (data.investmentOperation === 'deposit') {
                    if (bankId !== 'other') {
                        Store.updateBankBalance(bankId, -amount, 'balance');
                    }
                    Store.updateBankBalance(bankId, amount, 'invested');
                } else if (data.investmentOperation === 'withdrawal') {
                    if (bankId !== 'other') {
                        Store.updateBankBalance(bankId, amount, 'balance');
                    }
                    Store.updateBankBalance(bankId, -amount, 'invested');
                }
            }
        }

        if (data.id) {
            Store.updateExpense(data);
        } else {
            Store.addExpense(data);
        }

        this.closeModal();
        router.handleRoute();
    },

    deleteExpense(id) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            Store.deleteExpense(id);
            this.render();
            this.renderCharts();
        }
    },

    setInvestmentFilter(filter) {
        this.state.investmentFilter = filter;
        router.handleRoute();
    },

    openCategoryManager(type) {
        this.state.isCategoryManagerOpen = true;

        if (type === 'expenseType') {
            document.getElementById('category-manager-title').innerText = 'Gerenciar Tipos de Despesa';
            this.state.categoryManagerType = 'expenseType';
        } else if (type === 'bank') {
            document.getElementById('category-manager-title').innerText = 'Gerenciar Fontes (Bancos)';
            this.state.categoryManagerType = 'bank';
        } else {
            document.getElementById('category-manager-title').innerText = 'Gerenciar Categorias';
            const currentModalType = document.getElementById('modal-type-input').value || 'expense';
            this.state.categoryManagerType = currentModalType === 'expense' ? 'expense' : currentModalType;
        }

        this.renderCategoryList();

        const modal = document.getElementById('category-manager-modal');
        const content = document.getElementById('category-manager-content');
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    },

    closeCategoryManager() {
        this.state.isCategoryManagerOpen = false;
        const modal = document.getElementById('category-manager-modal');
        const content = document.getElementById('category-manager-content');

        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);

        // Refresh main modal category list if open
        const type = document.getElementById('modal-type-input').value;
        if (type) {
            const categorySelect = document.querySelector('select[name="category"]');
            const categoryTypeSelect = document.querySelector('select[name="categoryType"]');

            if (this.state.categoryManagerType === 'expenseType' && categoryTypeSelect) {
                const types = Store.getExpenseTypes();
                categoryTypeSelect.innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
            } else if (this.state.categoryManagerType === 'bank') {
                const bankSelect = document.querySelector('select[name="bankId"]');
                if (bankSelect) {
                    const banks = Store.getBankDefinitions();
                    bankSelect.innerHTML = banks.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
                }
            } else if (categorySelect) {
                if (['expense', 'income', 'investment'].includes(this.state.categoryManagerType)) {
                    const categories = Store.getCategories(this.state.categoryManagerType);
                    categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
                }
            }
        }
    },

    renderCategoryList() {
        const container = document.getElementById('category-list-container');
        if (!container) return;

        let items = [];
        if (this.state.categoryManagerType === 'expenseType') {
            items = Store.getExpenseTypes();
        } else if (this.state.categoryManagerType === 'bank') {
            items = Store.getBankDefinitions().map(b => b.name);
        } else {
            items = Store.getCategories(this.state.categoryManagerType);
        }

        container.innerHTML = items.map(item => `
            <div class="flex justify-between items-center p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <span class="text-gray-800 dark:text-white text-sm">${item}</span>
                ${(this.state.categoryManagerType === 'bank' && item === 'Outros / Carteira') ? '' : `
                <button onclick="ExpensesModule.deleteCategory('${item}')" class="text-rose-500 hover:text-rose-600">
                    <i class="fa-solid fa-trash"></i>
                </button>`}
            </div>
        `).join('');
    },

    addCategory() {
        const input = document.getElementById('new-category-input');
        const value = input.value.trim();
        if (value) {
            if (this.state.categoryManagerType === 'expenseType') {
                Store.addExpenseType(value);
            } else if (this.state.categoryManagerType === 'bank') {
                Store.addBankDefinition(value);
            } else {
                Store.addCategory(this.state.categoryManagerType, value);
            }
            input.value = '';
            this.renderCategoryList();
        }
    },

    deleteCategory(item) {
        if (confirm(`Excluir "${item}"?`)) {
            if (this.state.categoryManagerType === 'expenseType') {
                Store.deleteExpenseType(item);
            } else if (this.state.categoryManagerType === 'bank') {
                const bankDef = Store.getBankDefinitions().find(b => b.name === item);
                if (bankDef) Store.deleteBankDefinition(bankDef.id);
            } else {
                Store.deleteCategory(this.state.categoryManagerType, item);
            }
            this.renderCategoryList();
        }
    },

    getDebt(bankId) {
        const expenses = Store.getExpenses();
        return expenses
            .filter(e => e.bankId === bankId && e.type === 'expense' && !e.paid)
            .reduce((acc, e) => acc + parseFloat(e.amount), 0);
    },

    openCloseMonthModal() {
        const modal = document.getElementById('close-month-modal');
        const content = document.getElementById('close-month-content');
        const totalEl = document.getElementById('close-month-total');
        const sourcesContainer = document.getElementById('payment-sources-container');

        const expenses = Store.getExpenses();
        const stats = this.calculateStats(expenses);
        const banks = Store.getBanks();

        if (totalEl) totalEl.innerText = `R$ ${Store.formatCurrency(stats.expense)} `;

        // Dynamically generate inputs for each bank balance and investment
        if (sourcesContainer) {
            sourcesContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Balances -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-white/10 pb-1">Usar Saldo em Conta</h4>
                        ${Store.getBankDefinitions().map(bank => `
                        <div>
                            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">${bank.name} (Disp: R$ ${Store.formatCurrency(banks[bank.id]?.balance || 0)})</label>
                            <input type="number" id="pay-balance-${bank.id}" step="0.01" placeholder="0,00" class="payment-input w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none transition-all text-gray-800 dark:text-white">
                        </div>
                        `).join('')}
                    </div>

                    <!--Investments -->
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-white/10 pb-1">Resgatar Investimentos</h4>
                ${Store.getBankDefinitions().map(bank => `
                        <div>
                            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">${bank.name} (Inv: R$ ${Store.formatCurrency(banks[bank.id]?.invested || 0)})</label>
                            <input type="number" id="pay-invest-${bank.id}" step="0.01" placeholder="0,00" class="payment-input w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none transition-all text-gray-800 dark:text-white">
                        </div>
                        `).join('')}
            </div>
                </div >
            `;

            // Add event listeners to update remaining total
            const inputs = sourcesContainer.querySelectorAll('.payment-input');
            const initialTotal = stats.expense;

            const updateTotal = () => {
                let totalPaid = 0;
                inputs.forEach(input => {
                    totalPaid += parseFloat(input.value) || 0;
                });

                const remaining = initialTotal - totalPaid;
                const remainingFormatted = Store.formatCurrency(remaining > 0 ? remaining : 0);

                if (totalEl) {
                    totalEl.innerText = `R$ ${remainingFormatted} `;
                    // Optional: Change color if fully paid
                    if (remaining <= 0.01) {
                        totalEl.classList.remove('text-rose-700', 'dark:text-rose-300');
                        totalEl.classList.add('text-emerald-600', 'dark:text-emerald-400');
                        totalEl.innerText = "Total Pago!";
                    } else {
                        totalEl.classList.add('text-rose-700', 'dark:text-rose-300');
                        totalEl.classList.remove('text-emerald-600', 'dark:text-emerald-400');
                    }
                }
            };

            inputs.forEach(input => input.addEventListener('input', updateTotal));
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    },

    closeCloseMonthModal() {
        const modal = document.getElementById('close-month-modal');
        const content = document.getElementById('close-month-content');

        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    confirmCloseMonth() {
        // 1. Process Balance Deductions & 2. Process Investment Deductions
        const bankDefinitions = Store.getBankDefinitions();

        bankDefinitions.forEach(bank => {
            const balanceAmount = parseFloat(document.getElementById(`pay - balance - ${bank.id} `)?.value) || 0;
            const investAmount = parseFloat(document.getElementById(`pay - invest - ${bank.id} `)?.value) || 0;

            if (balanceAmount > 0) {
                Store.updateBankBalance(bank.id, -balanceAmount, 'balance');
            }

            if (investAmount > 0) {
                // Deduct from invested amount in store
                Store.updateBankBalance(bank.id, -investAmount, 'invested');

                // Create withdrawal record
                const withdrawal = {
                    description: `Pagamento Fatura(${bank.name}) - ${this.getMonthName(this.state.currentMonth)} `,
                    amount: -Math.abs(investAmount), // Negative for withdrawal
                    type: 'investment',
                    date: new Date().toISOString().split('T')[0],
                    investmentOperation: 'withdrawal',
                    bankId: bank.id
                };
                Store.addExpense(withdrawal);
            }
        });

        // 3. Mark expenses as paid
        const expenses = Store.getExpenses();
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;

        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'expense' && !e.paid) {
                e.paid = true;
                Store.updateExpense(e);
            }
        });

        alert(`Mês fechado com sucesso!\nTotal Pago: R$ ${Store.formatCurrency(totalPaid)} `);
        this.closeCloseMonthModal();
        router.handleRoute();
    },

    clearAll() {
        if (confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
            Store.clearAll();
            router.handleRoute();
        }
    },

    formatCurrency(value) {
        return Store.formatCurrency(value);
    },

    getMonthName(monthIndex) {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[monthIndex];
    },

    getCountByTab(tab) {
        const expenses = Store.getExpenses();
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const viewScope = this.state.viewScope;

        return expenses.filter(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            if (tab === 'Todos') {
                return isScopeMatch && e.type === 'expense';
            }
            return isScopeMatch && e.type === 'expense' && e.categoryType === tab;
        }).length;
    },

    getTotalByTab(tab) {
        const expenses = Store.getExpenses();
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const viewScope = this.state.viewScope;

        return expenses.filter(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            if (tab === 'Todos') {
                return isScopeMatch && e.type === 'expense';
            }
            return isScopeMatch && e.type === 'expense' && e.categoryType === tab;
        }).reduce((acc, e) => acc + parseFloat(e.amount), 0);
    },

    getPercentageByTab(tab, totalIncome) {
        if (totalIncome === 0) return 0;
        const total = this.getTotalByTab(tab);
        return ((total / totalIncome) * 100).toFixed(1);
    },

    renderCharts() {
        const ctxMain = document.getElementById('mainChart');
        const ctxCategory = document.getElementById('categoryChart');

        if (!ctxMain || !ctxCategory) return;

        // Destroy existing charts if any
        if (Chart.getChart(ctxMain)) Chart.getChart(ctxMain).destroy();
        if (Chart.getChart(ctxCategory)) Chart.getChart(ctxCategory).destroy();

        const expenses = Store.getExpenses();
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const chartScope = this.state.chartScope;

        // --- Main Chart Logic ---
        let labels = [];
        let dataIncome = [];
        let dataExpense = [];
        let dataInvestment = [];

        if (chartScope === 'annual') {
            labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const monthlyData = Array(12).fill(0).map(() => ({ income: 0, expense: 0, investment: 0 }));

            expenses.forEach(e => {
                const d = new Date(e.date);
                if (d.getFullYear() === currentYear) {
                    const m = d.getMonth();
                    if (e.type === 'income') monthlyData[m].income += parseFloat(e.amount);
                    if (e.type === 'expense') monthlyData[m].expense += parseFloat(e.amount);
                    if (e.type === 'investment') monthlyData[m].investment += parseFloat(e.amount);
                }
            });
            dataIncome = monthlyData.map(d => d.income);
            dataExpense = monthlyData.map(d => d.expense);
            dataInvestment = monthlyData.map(d => d.investment);

        } else if (chartScope === 'monthly') {
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const dailyData = Array(daysInMonth).fill(0).map(() => ({ income: 0, expense: 0, investment: 0 }));

            expenses.forEach(e => {
                const d = new Date(e.date);
                if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
                    const day = d.getDate() - 1;
                    if (e.type === 'income') dailyData[day].income += parseFloat(e.amount);
                    if (e.type === 'expense') dailyData[day].expense += parseFloat(e.amount);
                    if (e.type === 'investment') dailyData[day].investment += parseFloat(e.amount);
                }
            });
            dataIncome = dailyData.map(d => d.income);
            dataExpense = dailyData.map(d => d.expense);
            dataInvestment = dailyData.map(d => d.investment);

        } else if (chartScope === 'weekly') {
            // Get current week (Mon-Sun)
            const today = new Date();
            const day = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(today.setDate(diff));

            labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            const weeklyData = Array(7).fill(0).map(() => ({ income: 0, expense: 0, investment: 0 }));

            expenses.forEach(e => {
                const d = new Date(e.date);
                // Simple check if date is within the week range
                const timeDiff = d.getTime() - monday.getTime();
                const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                if (dayDiff >= 0 && dayDiff < 7) {
                    if (e.type === 'income') weeklyData[dayDiff].income += parseFloat(e.amount);
                    if (e.type === 'expense') weeklyData[dayDiff].expense += parseFloat(e.amount);
                    if (e.type === 'investment') weeklyData[dayDiff].investment += parseFloat(e.amount);
                }
            });
            dataIncome = weeklyData.map(d => d.income);
            dataExpense = weeklyData.map(d => d.expense);
            dataInvestment = weeklyData.map(d => d.investment);
        }

        new Chart(ctxMain, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Receitas', data: dataIncome, backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Despesas', data: dataExpense, backgroundColor: '#f43f5e', borderRadius: 4 },
                    { label: 'Investimentos', data: dataInvestment, backgroundColor: '#3b82f6', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(128, 128, 128, 0.1)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                }
            }
        });

        // --- Category Chart Logic (Respects View Scope) ---
        const viewScope = this.state.viewScope;
        const categoryStats = {};
        expenses.forEach(e => {
            const d = new Date(e.date);
            const isYearMatch = d.getFullYear() === currentYear;
            const isMonthMatch = d.getMonth() === currentMonth;
            const isScopeMatch = viewScope === 'year' ? isYearMatch : (isYearMatch && isMonthMatch);

            if (isScopeMatch && e.type === 'expense') {
                categoryStats[e.category] = (categoryStats[e.category] || 0) + parseFloat(e.amount);
            }
        });

        new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryStats),
                datasets: [{
                    data: Object.values(categoryStats),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#9ca3af', usePointStyle: true } }
                },
                cutout: '70%'
            }
        });
    },

    // --- Bank Management ---
    openBankModal(bankId) {
        const banks = Store.getBanks();
        const bankData = banks[bankId];
        let bankName = '';
        if (bankId === 'nubank') bankName = 'Nubank';
        else if (bankId === 'mercadoPago') bankName = 'Mercado Pago';
        else bankName = 'Outros Investimentos';

        // Create modal if not exists
        if (!document.getElementById('bank-modal')) {
            const modalHtml = `
            <div id="bank-modal" class="fixed inset-0 z-[70] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-[95%] md:w-full max-w-md shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white" id="bank-modal-title">Editar Banco</h3>
                        <button onclick="ExpensesModule.closeBankModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    <form id="bank-form" onsubmit="ExpensesModule.saveBankData(event)" class="p-6 space-y-5">
                        <input type="hidden" id="bank-modal-id" name="bankId">

                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Saldo em Conta (R$)</label>
                                <input type="number" name="balance" step="0.01" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                            </div>

                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Adicionar ao Saldo (+)</label>
                                <input type="number" name="incrementBalance" step="0.01" placeholder="Ex: 200,00" class="w-full px-4 py-2.5 text-sm rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800 dark:text-white placeholder-emerald-700/30 dark:placeholder-emerald-500/30">
                                <p class="text-[10px] text-gray-400 mt-1">Valor digitado aqui será SOMADO ao saldo atual.</p>
                            </div>

                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Investido (R$)</label>
                                <input type="number" name="invested" step="0.01" required class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 dark:text-white">
                            </div>

                            <div class="flex gap-2">
                                <button type="button" onclick="ExpensesModule.resetBank(document.getElementById('bank-modal-id').value)" class="px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-bold transition-all border border-rose-200 dark:border-rose-500/20">
                                    Zerar
                                </button>
                                <button type="submit" class="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all">
                                    Salvar Alterações
                                </button>
                            </div>
                    </form>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const modal = document.getElementById('bank-modal');
        const title = document.getElementById('bank-modal-title');
        const idInput = document.getElementById('bank-modal-id');
        const balanceInput = document.querySelector('#bank-form input[name="balance"]');
        const incrementInput = document.querySelector('#bank-form input[name="incrementBalance"]');
        const investedInput = document.querySelector('#bank-form input[name="invested"]');

        title.innerText = `Editar ${bankName}`;
        idInput.value = bankId;
        balanceInput.value = bankData.balance;
        if (incrementInput) incrementInput.value = ''; // Reset increment field
        investedInput.value = bankData.invested;

        modal.classList.remove('hidden');
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    },

    closeBankModal() {
        const modal = document.getElementById('bank-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    },

    saveBankData(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const bankId = formData.get('bankId');
        let balance = parseFloat(formData.get('balance'));
        const increment = parseFloat(formData.get('incrementBalance'));
        const invested = parseFloat(formData.get('invested'));

        if (!isNaN(increment) && increment !== 0) {
            balance += increment;
        }

        Store.setBankData(bankId, { balance, invested });
        this.closeBankModal();
        this.render(); // Re-render to show updates
    },

    resetBank(bankId) {
        if (confirm('Tem certeza que deseja zerar o saldo e investimentos deste banco?')) {
            const banks = Store.getBanks();
            if (banks[bankId]) {
                banks[bankId].balance = 0;
                banks[bankId].invested = 0;
                Store.save();
                this.render();
                this.closeBankModal();
            }
        }
    },

    resetToCurrentMonth() {
        const now = new Date();
        this.state.currentMonth = now.getMonth();
        this.state.currentYear = now.getFullYear();
        router.handleRoute();
    },

    afterRender() {
        this.renderCharts();
    }
};

window.ExpensesModule = ExpensesModule;
