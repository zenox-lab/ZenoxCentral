window.Store = {
    STORAGE_KEY: 'zenox_data',
    state: {
        theme: 'dark',
        trades: [],
        expenses: [],
        habits: [],
        notes: [],
        strategies: [],
        checklists: [],
        categories: {
            income: ['Salário', 'Freelance', 'Dividendos', 'Presente', 'Outros'],
            expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Dívidas', 'Outros'],
            investment: ['Ações', 'FIIs', 'Renda Fixa', 'Cripto', 'Reserva', 'Outros']
        },
        assets: ['SP500', 'NASDAQ', 'XAUUSD', 'WIN', 'WDO', 'BTC', 'ETH'],
        expenseTypes: ['Fixa', 'Variável', 'Extra', 'Adicional'],
        banks: {
            nubank: { balance: 0, invested: 0 },
            mercadoPago: { balance: 0, invested: 0 }
        },
        dailyMetrics: {}
    },

    async init() {
        // Attach Sync Listener immediately
        const syncEl = document.getElementById('sync-status');
        if (syncEl) {
            syncEl.style.cursor = 'pointer';
            syncEl.onclick = () => this.handleSyncClick();
            syncEl.innerHTML = '<i class="fa-solid fa-cloud text-gray-400"></i>'; // Default state
        }

        return new Promise((resolve) => {
            // Check if Firebase is initialized
            if (typeof auth !== 'undefined') {
                auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        this.currentUser = user;
                        console.log('User logged in:', user.email);
                        this.setSyncStatus('online'); // Show online status
                        await this.loadFromFirestore(user.uid);

                        // Update UI button
                        const btnText = document.getElementById('auth-btn-text');
                        const btnIcon = document.getElementById('auth-btn-icon');
                        if (btnText) btnText.textContent = 'Logout';
                        if (btnIcon) btnIcon.className = 'fa-solid fa-right-from-bracket text-red-500 text-base w-5 text-center';
                    } else {
                        this.currentUser = null;
                        console.log('User logged out');
                        this.setSyncStatus('offline'); // Show offline status
                        this.loadFromLocalStorage();

                        // Update UI button
                        const btnText = document.getElementById('auth-btn-text');
                        const btnIcon = document.getElementById('auth-btn-icon');
                        if (btnText) btnText.textContent = 'Login';
                        if (btnIcon) btnIcon.className = 'fa-solid fa-right-to-bracket text-gray-400 group-hover:text-zenox-primary transition-colors text-base w-5 text-center';
                    }
                    resolve();
                });
            } else {
                console.warn('Firebase Auth not available, using LocalStorage only');
                this.setSyncStatus('error');
                alert("ERRO CRÍTICO: Firebase não foi carregado. Verifique sua conexão.");
                this.loadFromLocalStorage();
                resolve();
            }
        });
    },

    handleSyncClick() {
        if (!this.currentUser) {
            alert('Você NÃO está logado. Clique em "Login" no menu para entrar.');
            return;
        }
        if (typeof db === 'undefined') {
            alert('Erro: Banco de dados não conectado.');
            return;
        }
        alert('Tentando forçar sincronização agora...');
        this.saveToFirestore();
    },

    loadFromLocalStorage() {
        if (localStorage.getItem(this.STORAGE_KEY)) {
            this.state = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            this.runMigrations();
        } else {
            this.setDefaultState();
        }
    },

    async loadFromFirestore(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.state = doc.data();
                this.runMigrations();
                console.log('Data loaded from Firestore');
            } else {
                console.log('No data in Firestore, migrating LocalStorage...');
                this.loadFromLocalStorage(); // Load local first
                this.saveToFirestore(); // Then upload to cloud
            }
        } catch (error) {
            console.error('Error loading from Firestore:', error);
            this.loadFromLocalStorage(); // Fallback
        }
    },

    setDefaultState() {
        this.state = {
            theme: 'dark',
            trades: [],
            expenses: [],
            habits: [],
            notes: [],
            strategies: [],
            checklists: [],
            categories: {
                income: ['Salário', 'Freelance', 'Dividendos', 'Presente', 'Outros'],
                expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Dívidas', 'Outros'],
                investment: ['Ações', 'FIIs', 'Renda Fixa', 'Cripto', 'Reserva', 'Outros']
            },
            expenseTypes: ['Fixa', 'Variável', 'Extra', 'Adicional'],
            assets: ['SP500', 'NASDAQ', 'XAUUSD', 'WIN', 'WDO', 'BTC', 'ETH'],
            timeframes: ['1m', '5m', '15m', '1h', '4h', '1D'],
            banks: {
                nubank: { balance: 0, invested: 0 },
                mercadoPago: { balance: 0, invested: 0 }
            }
        };
        this.save();
    },

    runMigrations() {
        // Migration: Add assets if missing
        if (!this.state.assets) {
            this.state.assets = ['SP500', 'NASDAQ', 'XAUUSD', 'WIN', 'WDO', 'BTC', 'ETH'];
        }

        // Migration: Add timeframes if missing
        if (!this.state.timeframes) {
            this.state.timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];
        }

        // Migration: Add checklists if missing
        if (!this.state.checklists) {
            this.state.checklists = [];
        }

        // Auto-cleanup demo expenses
        if (this.state.expenses && this.state.expenses.some(e => ['1', '2', '3'].includes(e.id))) {
            this.state.expenses = this.state.expenses.filter(e => !['1', '2', '3'].includes(e.id));
        }

        this.save();
    },

    save() {
        // Save to LocalStorage (Always backup)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));

        // Save to Firestore (Debounced)
        if (this.currentUser) {
            if (typeof db !== 'undefined') {
                this.setSyncStatus('saving');
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    this.saveToFirestore();
                }, 1000); // 1s debounce
            } else {
                console.error("Firestore DB not initialized");
                this.setSyncStatus('error');
            }
        }
    },

    async saveToFirestore() {
        if (!this.currentUser) {
            if (window.logToScreen) window.logToScreen('Tentativa de salvar sem usuário logado', 'error');
            return;
        }

        if (window.logToScreen) window.logToScreen('Iniciando salvamento no Firestore...', 'info');
        this.setSyncStatus('saving');

        // Create a timeout promise
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout: Conexão lenta ou bloqueada (30s)")), 30000)
        );

        try {
            if (window.logToScreen) window.logToScreen('Enviando dados...', 'info');

            // Race between save and timeout
            await Promise.race([
                db.collection('users').doc(this.currentUser.uid).set(this.state, { merge: true }),
                timeout
            ]);

            console.log('Data saved to Firestore');
            if (window.logToScreen) window.logToScreen('SUCESSO: Dados salvos na nuvem!', 'success');
            this.setSyncStatus('saved');
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            if (window.logToScreen) window.logToScreen(`ERRO: ${error.message} (${error.code || 'N/A'})`, 'error');
            this.setSyncStatus('error');
            alert(`ERRO AO SALVAR:\n${error.message}\n\nCódigo: ${error.code || 'N/A'}`);
        }
    },

    setSyncStatus(status) {
        const el = document.getElementById('sync-status');
        if (!el) return;

        // Ensure click listener is preserved (though init sets it, this is safe)
        el.onclick = () => this.handleSyncClick();
        el.style.cursor = 'pointer';
        el.title = 'Clique para verificar status';

        if (status === 'saving') {
            el.innerHTML = '<i class="fa-solid fa-cloud-arrow-up animate-bounce"></i> <span class="text-xs">Salvando...</span>';
            el.className = 'flex items-center gap-2 text-yellow-500';
        } else if (status === 'saved') {
            el.innerHTML = '<i class="fa-solid fa-cloud-check"></i> <span class="text-xs">Salvo</span>';
            el.className = 'flex items-center gap-2 text-emerald-500';
            setTimeout(() => {
                this.setSyncStatus('online'); // Revert to online state
            }, 3000);
        } else if (status === 'error') {
            el.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span class="text-xs">Erro</span>';
            el.className = 'flex items-center gap-2 text-red-500';
        } else if (status === 'online') {
            el.innerHTML = '<i class="fa-solid fa-wifi"></i> <span class="text-xs">Online</span>';
            el.className = 'flex items-center gap-2 text-blue-500';
        } else if (status === 'offline') {
            el.innerHTML = '<i class="fa-solid fa-user-slash"></i> <span class="text-xs">Offline</span>';
            el.className = 'flex items-center gap-2 text-gray-500';
        }
    },

    getCategories(type) {
        return this.state.categories[type] || [];
    },

    addCategory(type, name) {
        if (this.state.categories[type] && !this.state.categories[type].includes(name)) {
            this.state.categories[type].push(name);
            this.save();
            return true;
        }
        return false;
    },

    deleteCategory(type, name) {
        if (this.state.categories[type]) {
            this.state.categories[type] = this.state.categories[type].filter(c => c !== name);
            this.save();
        }
    },

    // --- Assets ---
    getAssets() {
        return this.state.assets || [];
    },

    addAsset(asset) {
        if (this.state.assets && !this.state.assets.includes(asset)) {
            this.state.assets.push(asset);
            this.save();
            return true;
        }
        return false;
    },

    deleteAsset(asset) {
        if (this.state.assets) {
            this.state.assets = this.state.assets.filter(a => a !== asset);
            this.save();
        }
    },

    // --- Timeframes ---
    getTimeframes() {
        return this.state.timeframes || [];
    },

    addTimeframe(tf) {
        if (this.state.timeframes && !this.state.timeframes.includes(tf)) {
            this.state.timeframes.push(tf);
            this.save();
            return true;
        }
        return false;
    },

    deleteTimeframe(tf) {
        if (this.state.timeframes) {
            this.state.timeframes = this.state.timeframes.filter(t => t !== tf);
            this.save();
        }
    },

    // --- Expense Types ---
    getExpenseTypes() {
        return this.state.expenseTypes || [];
    },

    addExpenseType(name) {
        if (this.state.expenseTypes && !this.state.expenseTypes.includes(name)) {
            this.state.expenseTypes.push(name);
            this.save();
            return true;
        }
        return false;
    },

    deleteExpenseType(name) {
        if (this.state.expenseTypes) {
            this.state.expenseTypes = this.state.expenseTypes.filter(t => t !== name);
            this.save();
        }
    },

    // --- Banks ---
    getBanks() {
        const defaults = {
            nubank: { balance: 0, invested: 0 },
            mercadoPago: { balance: 0, invested: 0 },
            other: { balance: 0, invested: 0 }
        };

        if (!this.state.banks) {
            return defaults;
        }

        // Ensure 'other' exists if banks already exists
        if (!this.state.banks.other) {
            this.state.banks.other = { balance: 0, invested: 0 };
            this.save();
        }

        return this.state.banks;
    },

    setBankData(bankId, data) {
        if (this.state.banks && this.state.banks[bankId]) {
            this.state.banks[bankId] = { ...this.state.banks[bankId], ...data };
            this.save();
            return true;
        }
        return false;
    },

    updateBankBalance(bankId, amount, type = 'balance') {
        if (this.state.banks && this.state.banks[bankId]) {
            // amount can be negative
            const current = parseFloat(this.state.banks[bankId][type] || 0);
            this.state.banks[bankId][type] = current + parseFloat(amount);
            this.save();
            return true;
        }
        return false;
    },

    // --- Trades ---
    getTrades() { return this.state.trades || []; },
    addTrade(trade) {
        trade.id = Date.now().toString();
        this.state.trades.unshift(trade);
        this.save();
        return trade;
    },

    // --- Expenses ---
    addExpense(expense) {
        if (expense.paymentMode === 'parcelado' && expense.installments > 1) {
            const installments = parseInt(expense.installments);
            const baseDate = new Date(expense.date);
            const baseDescription = expense.description;

            for (let i = 0; i < installments; i++) {
                const newExpense = { ...expense };
                newExpense.id = Date.now().toString() + '-' + i; // Unique ID for each installment

                // Calculate date for this installment
                const date = new Date(baseDate);
                date.setMonth(date.getMonth() + i);
                newExpense.date = date.toISOString().split('T')[0];

                // Update description
                newExpense.description = `${baseDescription} (${i + 1}/${installments})`;

                this.state.expenses.unshift(newExpense);
            }
        } else {
            expense.id = Date.now().toString();
            this.state.expenses.unshift(expense);
        }
        this.save();
        return expense;
    },
    updateExpense(updatedExpense) {
        const index = this.state.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            this.state.expenses[index] = updatedExpense;
            this.save();
        }
    },
    deleteExpense(id) {
        this.state.expenses = this.state.expenses.filter(e => e.id !== id);
        this.save();
    },
    clearExpenses() {
        this.state.expenses = [];
        this.save();
    },
    getExpenses() { return this.state.expenses || []; },

    // --- Habits ---
    addHabit(habit) {
        habit.id = Date.now().toString();
        habit.history = {}; // date string -> boolean
        this.state.habits.push(habit);
        this.save();
        return habit;
    },
    toggleHabit(id, date) {
        const habit = this.state.habits.find(h => h.id === id);
        if (habit) {
            if (habit.history[date]) {
                delete habit.history[date];
            } else {
                habit.history[date] = true;
            }
            this.save();
        }
    },
    getHabits() { return this.state.habits || []; },
    deleteHabit(id) {
        this.state.habits = this.state.habits.filter(h => h.id !== id);
        this.save();
    },

    // --- Strategies ---
    addStrategy(strategy) {
        if (!strategy.id) {
            strategy.id = Date.now().toString();
        }
        // Initialize stats if not present
        if (!strategy.stats) {
            strategy.stats = { winRate: 0, profit: 0, ops: 0 };
        }
        this.state.strategies.push(strategy);
        this.save();
        return strategy;
    },
    getStrategies() { return this.state.strategies || []; },
    deleteStrategy(id) {
        this.state.strategies = this.state.strategies.filter(s => s.id !== id);
        this.save();
    },

    // --- Checklists ---
    getChecklists() {
        return this.state.checklists || [];
    },

    addChecklist(checklist) {
        if (!checklist.id) {
            checklist.id = Date.now().toString();
        }
        this.state.checklists.push(checklist);
        this.save();
    },

    deleteChecklist(id) {
        this.state.checklists = this.state.checklists.filter(c => c.id !== id);
        this.save();
    },

    toggleChecklistStep(checklistId, stepIndex) {
        const checklist = this.state.checklists.find(c => c.id === checklistId);
        if (checklist && checklist.steps && checklist.steps[stepIndex]) {
            checklist.steps[stepIndex].completed = !checklist.steps[stepIndex].completed;
            this.save();
        }
    },

    // --- Daily Wellness Metrics ---
    getDailyMetrics() {
        return this.state.dailyMetrics || {};
    },

    saveDailyMetric(date, type, value) {
        if (!this.state.dailyMetrics) {
            this.state.dailyMetrics = {};
        }
        if (!this.state.dailyMetrics[date]) {
            this.state.dailyMetrics[date] = {};
        }
        this.state.dailyMetrics[date][type] = parseFloat(value);
        this.save();
    },

    // --- Notes ---
    addNote(note) {
        note.id = Date.now().toString();
        note.updatedAt = new Date().toISOString();
        if (!note.color) note.color = 'default'; // Default color
        if (note.isPinned === undefined) note.isPinned = false;

        // New fields for Checklist/Task
        if (!note.type) note.type = 'text'; // 'text' or 'checklist'
        if (!note.items) note.items = []; // Array of {id, text, completed}
        if (!note.status) note.status = 'todo'; // 'todo', 'in_progress', 'done'
        if (!note.dueDate) note.dueDate = null;

        this.state.notes.unshift(note);
        this.save();
        return note;
    },
    updateNote(updatedNote) {
        const index = this.state.notes.findIndex(n => n.id === updatedNote.id);
        if (index !== -1) {
            this.state.notes[index] = { ...this.state.notes[index], ...updatedNote, updatedAt: new Date().toISOString() };
            this.save();
        }
    },
    deleteNote(id) {
        this.state.notes = this.state.notes.filter(n => n.id !== id);
        this.save();
    },
    getNotes() { return this.state.notes || []; },

    // --- Demo Data Helpers ---
    getDemoHabits() {
        return [
            { id: '1', name: 'Leitura (30min)', history: { '2025-11-28': true, '2025-11-29': true } },
            { id: '2', name: 'Academia', history: { '2025-11-27': true, '2025-11-29': true } },
        ];
    },

    getDemoNotes() {
        return [
            { id: '1', title: 'Ideias de Projeto', content: 'Criar um dashboard unificado para trades e finanças.', tags: ['Dev', 'Ideia'], updatedAt: '2025-11-29T10:00:00Z' },
            { id: '2', title: 'Lista de Compras', content: '- Café\n- Leite\n- Pão integral', tags: ['Pessoal'], updatedAt: '2025-11-28T18:30:00Z' },
        ];
    },

    // --- Helpers ---
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }
};

// Initialize Store at the end of the file is NOT needed anymore
// because we will call it from app.js
// Store.init();
