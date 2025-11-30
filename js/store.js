const Store = {
    STORAGE_KEY: 'zenox_data',
    state: {
        theme: 'dark',
        trades: [],
        expenses: [],
        habits: [],
        notes: [],
        strategies: []
    },

    init() {
        if (localStorage.getItem(this.STORAGE_KEY)) {
            this.state = JSON.parse(localStorage.getItem(this.STORAGE_KEY));

            // Auto-cleanup demo expenses (IDs 1, 2, 3) if they exist
            if (this.state.expenses && this.state.expenses.some(e => ['1', '2', '3'].includes(e.id))) {
                this.state.expenses = this.state.expenses.filter(e => !['1', '2', '3'].includes(e.id));
                this.save();
            }
        } else {
            this.state = {
                theme: 'dark',
                trades: [],
                expenses: [],
                habits: this.getDemoHabits(),
                notes: this.getDemoNotes(),
                strategies: []
            };
            this.save();
        }
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
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
        expense.id = Date.now().toString();
        this.state.expenses.unshift(expense);
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

    // --- Strategies ---
    addStrategy(strategy) {
        strategy.id = Date.now().toString();
        strategy.stats = { ops: 0, winRate: 0, profit: 0 }; // Init stats
        this.state.strategies.push(strategy);
        this.save();
        return strategy;
    },
    getStrategies() { return this.state.strategies || []; },

    // --- Notes ---
    addNote(note) {
        note.id = Date.now().toString();
        note.updatedAt = new Date().toISOString();
        this.state.notes.unshift(note);
        this.save();
        return note;
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
    }
};

Store.init();
