const ExpensesModule = {
    state: {
        activeTab: 'Fixa', // Fixa, Variável, Extra, Adicional
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        editingId: null
    },

    render() {
        const expenses = Store.getExpenses();
        const stats = this.calculateStats(expenses);

        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Orçamento Pessoal</h2>
                        <p class="text-gray-500 dark:text-gray-400">Gerencie suas finanças de forma inteligente</p>
                    </div>
                    
                    <!-- Month Selector -->
                    <div class="flex items-center gap-4">
                        <button onclick="ExpensesModule.clearAll()" class="text-xs text-rose-500 hover:text-rose-600 font-medium underline">
                            Limpar Tudo
                        </button>
                        <div class="flex items-center bg-white dark:bg-zenox-surface rounded-xl border border-gray-200 dark:border-white/10 p-1 shadow-sm">
                            <button onclick="ExpensesModule.changeMonth(-1)" class="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <div class="px-4 text-center">
                                <span class="block text-sm font-bold text-gray-800 dark:text-white capitalize">${this.getMonthName(this.state.currentMonth)}</span>
                                <span class="block text-xs text-gray-500 dark:text-gray-400">${this.state.currentYear}</span>
                            </div>
                            <button onclick="ExpensesModule.changeMonth(1)" class="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Receitas -->
                    <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div class="absolute top-4 right-4 text-emerald-500">
                            <i class="fa-solid fa-arrow-trend-up text-xl"></i>
                        </div>
                        <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Receitas</p>
                        <h3 class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">R$ ${this.formatCurrency(stats.income)}</h3>
                    </div>

                    <!-- Despesas -->
                    <div class="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div class="absolute top-4 right-4 text-rose-500">
                            <i class="fa-solid fa-arrow-trend-down text-xl"></i>
                        </div>
                        <p class="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Despesas</p>
                        <h3 class="text-2xl font-bold text-rose-700 dark:text-rose-300">R$ ${this.formatCurrency(stats.expense)}</h3>
                    </div>

                    <!-- Investimentos -->
                    <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div class="absolute top-4 right-4 text-blue-500">
                            <i class="fa-solid fa-piggy-bank text-xl"></i>
                        </div>
                        <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Investimentos</p>
                        <h3 class="text-2xl font-bold text-blue-700 dark:text-blue-300">R$ ${this.formatCurrency(stats.investment)}</h3>
                    </div>

                    <!-- Saldo -->
                    <div class="bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                        <div class="absolute top-4 right-4 text-gray-400">
                            <i class="fa-solid fa-wallet text-xl"></i>
                        </div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Saldo</p>
                        <h3 class="text-2xl font-bold ${stats.balance >= 0 ? 'text-gray-800 dark:text-white' : 'text-rose-500'}">R$ ${this.formatCurrency(stats.balance)}</h3>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Annual View -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-6">Visão Anual - ${this.state.currentYear}</h3>
                        <div class="h-64 w-full relative">
                            <canvas id="annualChart"></canvas>
                        </div>
                        <div class="flex justify-center gap-4 mt-4">
                            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Receitas
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span class="w-3 h-3 rounded-full bg-rose-500"></span> Despesas
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span class="w-3 h-3 rounded-full bg-blue-500"></span> Investimentos
                            </div>
                        </div>
                    </div>

                    <!-- Category View -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-6">Despesas por Categoria</h3>
                        <div class="h-64 w-full relative flex items-center justify-center">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Action Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Receitas Action -->
                    <div class="bg-white dark:bg-zenox-surface p-6 rounded-2xl shadow-card border border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <i class="fa-solid fa-arrow-trend-up text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 dark:text-white">Receitas</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Total: R$ ${this.formatCurrency(stats.income)}</p>
                            </div>
                        </div>
                        <button onclick="ExpensesModule.openModal('income')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i> Adicionar
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
                                <p class="text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(stats.investment)} (${stats.investmentPerc}% da receita)</p>
                            </div>
                        </div>
                        <button onclick="ExpensesModule.openModal('investment')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i> Adicionar
                        </button>
                    </div>
                </div>

                <!-- Expenses List -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
                                    <i class="fa-solid fa-arrow-trend-down text-sm"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-800 dark:text-white">Despesas</h3>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Total: R$ ${this.formatCurrency(stats.expense)}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="ExpensesModule.openModal('expense')" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i> Adicionar
                            </button>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="px-6 pt-4 flex gap-1 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar">
                        ${['Fixa', 'Variável', 'Extra', 'Adicional'].map(tab => `
                            <button onclick="ExpensesModule.switchTab('${tab}')" 
                                class="px-6 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${this.state.activeTab === tab ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
                                ${tab} (${this.getCountByTab(tab)})
                            </button>
                        `).join('')}
                    </div>

                    <!-- List Content -->
                    <div class="p-6">
                        <div class="flex items-center gap-2 mb-4">
                            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded">R$ ${this.formatCurrency(this.getTotalByTab(this.state.activeTab))}</span>
                            <span class="text-xs text-gray-400">(${this.getPercentageByTab(this.state.activeTab, stats.income)}% da receita)</span>
                        </div>

                        <div class="space-y-3">
                            ${this.renderExpenseList(expenses)}
                        </div>
                    </div>
                </div>
                
                <!-- Other Lists (Income/Investment) - Optional, but good for editing -->
                ${this.renderOtherLists(expenses)}
            </div>

            <!-- Modal -->
            <div id="expense-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-2xl w-full max-w-md shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10" id="expense-modal-content">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white" id="modal-title">Nova Transação</h3>
                        <button onclick="ExpensesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="expense-form" onsubmit="ExpensesModule.saveExpense(event)" class="p-6 space-y-4">
                        <input type="hidden" name="id" id="modal-id-input">
                        <input type="hidden" name="type" id="modal-type-input">
                        
                        <div class="space-y-1">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
                            <input type="text" name="description" required class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Valor (R$)</label>
                                <input type="number" step="0.01" name="amount" required class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all">
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Data</label>
                                <input type="date" name="date" required class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all">
                            </div>
                        </div>

                        <div class="space-y-1" id="category-field">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoria</label>
                            <select name="category" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all appearance-none">
                                <!-- Options will be populated dynamically -->
                            </select>
                        </div>

                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="ExpensesModule.closeModal()" class="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    afterRender() {
        this.renderCharts();
    },

    calculateStats(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;

        const monthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = monthlyExpenses.filter(e => e.type === 'income').reduce((acc, e) => acc + parseFloat(e.amount), 0);
        const expense = monthlyExpenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + parseFloat(e.amount), 0);
        const investment = monthlyExpenses.filter(e => e.type === 'investment').reduce((acc, e) => acc + parseFloat(e.amount), 0);

        const balance = income - expense - investment;
        const investmentPerc = income > 0 ? ((investment / income) * 100).toFixed(0) : 0;

        return { income, expense, investment, balance, investmentPerc };
    },

    renderExpenseList(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        const activeTab = this.state.activeTab;

        const filtered = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                e.type === 'expense' &&
                e.categoryType === activeTab;
        });

        if (filtered.length === 0) {
            return `
                <div class="text-center py-8 text-gray-400">
                    <i class="fa-regular fa-folder-open text-3xl mb-2 opacity-50"></i>
                    <p>Nenhuma despesa nesta categoria.</p>
                </div>
            `;
        }

        return filtered.map(e => this.renderListItem(e)).join('');
    },

    renderOtherLists(expenses) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;

        const incomes = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'income';
        });

        const investments = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'investment';
        });

        if (incomes.length === 0 && investments.length === 0) return '';

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Incomes List -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 p-6">
                    <h3 class="font-bold text-gray-800 dark:text-white mb-4">Receitas Recentes</h3>
                    <div class="space-y-3">
                        ${incomes.length > 0 ? incomes.map(e => this.renderListItem(e)).join('') : '<p class="text-gray-400 text-sm">Nenhuma receita.</p>'}
                    </div>
                </div>
                <!-- Investments List -->
                <div class="bg-white dark:bg-zenox-surface rounded-2xl shadow-card border border-gray-100 dark:border-white/5 p-6">
                    <h3 class="font-bold text-gray-800 dark:text-white mb-4">Investimentos Recentes</h3>
                    <div class="space-y-3">
                        ${investments.length > 0 ? investments.map(e => this.renderListItem(e)).join('') : '<p class="text-gray-400 text-sm">Nenhum investimento.</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    renderListItem(e) {
        let icon = 'fa-receipt';
        let colorClass = 'text-gray-500';

        if (e.type === 'income') { icon = 'fa-arrow-trend-up'; colorClass = 'text-emerald-500'; }
        else if (e.type === 'investment') { icon = 'fa-piggy-bank'; colorClass = 'text-blue-500'; }
        else { icon = 'fa-arrow-trend-down'; colorClass = 'text-rose-500'; }

        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center ${colorClass} shadow-sm">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 dark:text-white text-sm">${e.description}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(e.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-800 dark:text-white text-sm">R$ ${this.formatCurrency(e.amount)}</span>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="ExpensesModule.editExpense('${e.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="ExpensesModule.deleteExpense('${e.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors">
                            <i class="fa-solid fa-trash text-xs"></i>
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

    openModal(type, id = null) {
        const modal = document.getElementById('expense-modal');
        const content = document.getElementById('expense-modal-content');
        const title = document.getElementById('modal-title');
        const typeInput = document.getElementById('modal-type-input');
        const idInput = document.getElementById('modal-id-input');
        const categorySelect = document.querySelector('select[name="category"]');
        const categoryField = document.getElementById('category-field');

        typeInput.value = type;
        idInput.value = id || '';

        // Reset form
        document.getElementById('expense-form').reset();
        document.querySelector('#expense-form input[name="date"]').valueAsDate = new Date();

        // If editing, populate form
        if (id) {
            const expense = Store.getExpenses().find(e => e.id === id);
            if (expense) {
                document.querySelector('input[name="description"]').value = expense.description;
                document.querySelector('input[name="amount"]').value = expense.amount;
                document.querySelector('input[name="date"]').value = expense.date;
                type = expense.type; // Override type with existing
                typeInput.value = type;
            }
        }

        // Configure Modal based on Type
        if (type === 'income') {
            title.innerText = id ? 'Editar Receita' : 'Nova Receita';
            categoryField.classList.remove('hidden');
            categorySelect.innerHTML = `
                <option value="Salário">Salário</option>
                <option value="Freelance">Freelance</option>
                <option value="Dividendos">Dividendos</option>
                <option value="Outros">Outros</option>
            `;
        } else if (type === 'investment') {
            title.innerText = id ? 'Editar Investimento' : 'Novo Investimento';
            categoryField.classList.remove('hidden');
            categorySelect.innerHTML = `
                <option value="Ações">Ações</option>
                <option value="FIIs">FIIs</option>
                <option value="Renda Fixa">Renda Fixa</option>
                <option value="Cripto">Cripto</option>
            `;
        } else if (type === 'expense') {
            title.innerText = id ? 'Editar Despesa' : 'Nova Despesa';
            categoryField.classList.remove('hidden');
            categorySelect.innerHTML = `
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Moradia">Moradia</option>
                <option value="Lazer">Lazer</option>
                <option value="Saúde">Saúde</option>
                <option value="Educação">Educação</option>
                <option value="Outros">Outros</option>
            `;
        }

        // Set category value if editing
        if (id) {
            const expense = Store.getExpenses().find(e => e.id === id);
            if (expense && expense.category) {
                categorySelect.value = expense.category;
            }
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
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
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    },

    saveExpense(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const expense = Object.fromEntries(formData.entries());

        // If it's an expense, add the current active tab as categoryType (only if new)
        if (expense.type === 'expense' && !expense.id) {
            expense.categoryType = this.state.activeTab;
        } else if (expense.type === 'expense' && expense.id) {
            // Preserve existing categoryType if editing
            const existing = Store.getExpenses().find(e => e.id === expense.id);
            if (existing) expense.categoryType = existing.categoryType;
        }

        if (expense.id) {
            Store.updateExpense(expense);
        } else {
            delete expense.id; // Remove empty ID
            Store.addExpense(expense);
        }

        this.closeModal();
        router.handleRoute();
    },

    editExpense(id) {
        const expense = Store.getExpenses().find(e => e.id === id);
        if (expense) {
            this.openModal(expense.type, id);
        }
    },

    deleteExpense(id) {
        if (confirm('Tem certeza que deseja excluir?')) {
            Store.deleteExpense(id);
            router.handleRoute();
        }
    },

    clearAll() {
        if (confirm('Tem certeza que deseja apagar TODOS os registros financeiros? Esta ação não pode ser desfeita.')) {
            Store.clearExpenses();
            router.handleRoute();
        }
    },

    // Helpers
    formatCurrency(value) {
        return parseFloat(value).toFixed(2);
    },

    getMonthName(monthIndex) {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[monthIndex];
    },

    getCountByTab(tab) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        return Store.getExpenses().filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                e.type === 'expense' &&
                e.categoryType === tab;
        }).length;
    },

    getTotalByTab(tab) {
        const currentMonth = this.state.currentMonth;
        const currentYear = this.state.currentYear;
        return Store.getExpenses().filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                e.type === 'expense' &&
                e.categoryType === tab;
        }).reduce((acc, e) => acc + parseFloat(e.amount), 0);
    },

    getPercentageByTab(tab, totalIncome) {
        if (totalIncome === 0) return 0;
        const total = this.getTotalByTab(tab);
        return ((total / totalIncome) * 100).toFixed(0);
    },

    renderCharts() {
        const ctxAnnual = document.getElementById('annualChart');
        const ctxCategory = document.getElementById('categoryChart');

        if (!ctxAnnual || !ctxCategory) return;

        const expenses = Store.getExpenses();
        const currentYear = this.state.currentYear;

        // Annual Data
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

        new Chart(ctxAnnual, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [
                    { label: 'Receitas', data: monthlyData.map(d => d.income), backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Despesas', data: monthlyData.map(d => d.expense), backgroundColor: '#f43f5e', borderRadius: 4 },
                    { label: 'Investimentos', data: monthlyData.map(d => d.investment), backgroundColor: '#3b82f6', borderRadius: 4 }
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

        // Category Data (Current Month)
        const currentMonth = this.state.currentMonth;
        const categoryStats = {};
        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'expense') {
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
                    legend: { position: 'bottom', labels: { color: '#9ca3af', usePointStyle: true } }
                },
                cutout: '70%'
            }
        });
    }
};
