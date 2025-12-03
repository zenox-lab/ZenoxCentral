window.HabitsModule = {
    state: {
        weekOffset: 0
    },

    render() {
        const habits = Store.getHabits();
        const stats = this.calculateStats(habits);

        // Calculate Week Days (Mon-Sun)
        const weekDays = this.getWeekDays(this.state.weekOffset);
        const startOfWeek = weekDays[0];
        const endOfWeek = weekDays[6];

        const monthName = startOfWeek.toLocaleDateString('pt-BR', { month: 'long' });
        const year = startOfWeek.getFullYear();

        return `
            <div class="animate-fade-in space-y-4">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Hábitos</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Acompanhe sua rotina diária</p>
                    </div>
                    <button onclick="HabitsModule.openModal()" class="bg-zenox-secondary hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2 text-sm">
                        <i class="fa-solid fa-plus"></i> 
                        <span>Novo Hábito</span>
                    </button>
                </div>

                <!-- Stats Cards (Compact) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Completion Rate -->
                    <div class="bg-white dark:bg-zenox-surface p-4 rounded-xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-check-circle text-4xl text-emerald-500"></i>
                        </div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <i class="fa-solid fa-percent text-sm"></i>
                            </div>
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Taxa Hoje</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${stats.todayCompletion}%</h3>
                    </div>

                    <!-- Active Habits -->
                    <div class="bg-white dark:bg-zenox-surface p-4 rounded-xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-list-check text-4xl text-blue-500"></i>
                        </div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <i class="fa-solid fa-bullseye text-sm"></i>
                            </div>
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Ativos</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalActive}</h3>
                    </div>

                    <!-- Best Streak -->
                    <div class="bg-white dark:bg-zenox-surface p-4 rounded-xl shadow-card border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i class="fa-solid fa-fire text-4xl text-orange-500"></i>
                        </div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <i class="fa-solid fa-trophy text-sm"></i>
                            </div>
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Melhor Streak</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${stats.bestStreak} <span class="text-xs font-normal text-gray-500">dias</span></h3>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <!-- Habits Table (Weekly View) -->
                    <div class="lg:col-span-2 bg-white dark:bg-zenox-surface rounded-xl shadow-card border border-gray-100 dark:border-white/5 overflow-hidden">
                        <!-- Weekly Navigation -->
                        <div class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div class="flex items-center gap-2">
                                <button onclick="HabitsModule.changeWeek(-1)" class="w-8 h-8 rounded-lg bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors">
                                    <i class="fa-solid fa-chevron-left text-xs"></i>
                                </button>
                                <span class="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize min-w-[140px] text-center">
                                    ${monthName} ${year}
                                </span>
                                <button onclick="HabitsModule.changeWeek(1)" class="w-8 h-8 rounded-lg bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors">
                                    <i class="fa-solid fa-chevron-right text-xs"></i>
                                </button>
                            </div>
                            <div class="text-xs text-gray-400">
                                Semana ${this.getWeekNumber(startOfWeek)}
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="bg-white dark:bg-zenox-surface">
                                        <th class="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/4">Hábito</th>
                                        ${weekDays.map(date => {
            const isToday = date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
            return `
                                            <th class="p-2 text-center text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-zenox-secondary' : 'text-gray-400'}">
                                                ${date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                                                <br>
                                                <span class="text-xs ${isToday ? 'font-bold' : 'font-normal'}">${date.getDate()}</span>
                                            </th>
                                        `}).join('')}
                                        <th class="p-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Streak</th>
                                        <th class="w-8"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                    ${habits.map(habit => {
                const currentStreak = this.calculateStreak(habit);
                return `
                                        <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td class="p-3 font-semibold text-sm text-gray-800 dark:text-white border-r border-gray-100 dark:border-white/5">
                                                ${habit.name}
                                            </td>
                                            ${weekDays.map(date => {
                    const dateStr = date.toISOString().slice(0, 10);
                    const isDone = habit.history[dateStr];
                    const isFuture = date > new Date();

                    return `
                                                <td class="p-2 text-center">
                                                    ${!isFuture ? `
                                                        <button onclick="HabitsModule.toggleCheck('${habit.id}', '${dateStr}')" 
                                                            class="w-6 h-6 rounded-md flex items-center justify-center transition-all mx-auto ${isDone ? 'bg-zenox-secondary text-white shadow-sm shadow-violet-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-white/10'}">
                                                            <i class="fa-solid fa-check ${isDone ? 'opacity-100' : 'opacity-0'} transition-opacity text-[10px]"></i>
                                                        </button>
                                                    ` : `
                                                        <div class="w-6 h-6 mx-auto rounded-md border border-dashed border-gray-200 dark:border-white/10 opacity-50"></div>
                                                    `}
                                                </td>
                                            `}).join('')}
                                            <td class="p-3 text-center">
                                                <div class="flex items-center justify-center gap-1 font-bold text-xs ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}">
                                                    <i class="fa-solid fa-fire text-[10px]"></i> ${currentStreak}
                                                </div>
                                            </td>
                                            <td class="p-3 text-right">
                                                <button onclick="HabitsModule.deleteHabit('${habit.id}')" class="text-gray-400 hover:text-red-500 transition-all">
                                                    <i class="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                    ${habits.length === 0 ? '<tr><td colspan="10" class="p-6 text-center text-xs text-gray-500">Nenhum hábito cadastrado.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Weekly Progress Chart -->
                    <div class="bg-white dark:bg-zenox-surface p-4 rounded-xl shadow-card border border-gray-100 dark:border-white/5">
                        <h3 class="font-bold text-sm text-gray-800 dark:text-white mb-4">Progresso Semanal</h3>
                        <div class="h-48 relative">
                            <canvas id="habitsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div id="habit-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-sm rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform scale-95 transition-transform">
                    <div class="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Novo Hábito</h3>
                        <button onclick="HabitsModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    
                    <form id="habit-form" onsubmit="HabitsModule.saveHabit(event)" class="p-4 space-y-3">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Nome do Hábito</label>
                            <input type="text" name="name" placeholder="Ex: Ler 10 páginas..." required 
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-secondary outline-none transition-all text-sm">
                        </div>

                        <div class="pt-2 flex justify-end gap-2">
                            <button type="button" onclick="HabitsModule.closeModal()" class="px-4 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                            <button type="submit" class="px-4 py-2 rounded-lg bg-zenox-secondary text-white text-xs font-bold hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    afterRender() {
        this.renderChart();
    },

    getWeekDays(offset = 0) {
        const today = new Date();
        const day = today.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

        const monday = new Date(today.setDate(diff));
        monday.setDate(monday.getDate() + (offset * 7)); // Apply offset

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    },

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    },

    changeWeek(offset) {
        this.state.weekOffset += offset;
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.renderChart();
    },

    calculateStats(habits) {
        if (!habits || habits.length === 0) {
            return { todayCompletion: 0, totalActive: 0, bestStreak: 0 };
        }

        const today = new Date().toISOString().slice(0, 10);
        const completedToday = habits.filter(h => h.history[today]).length;
        const todayCompletion = Math.round((completedToday / habits.length) * 100);

        let bestStreak = 0;
        habits.forEach(h => {
            const streak = this.calculateStreak(h);
            if (streak > bestStreak) bestStreak = streak;
        });

        return {
            todayCompletion,
            totalActive: habits.length,
            bestStreak
        };
    },

    calculateStreak(habit) {
        let streak = 0;
        let d = new Date();
        if (!habit.history[d.toISOString().slice(0, 10)]) {
            d.setDate(d.getDate() - 1);
        }
        while (true) {
            const dateStr = d.toISOString().slice(0, 10);
            if (habit.history[dateStr]) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    },

    renderChart() {
        const ctx = document.getElementById('habitsChart');
        if (!ctx) return;

        const habits = Store.getHabits();
        const weekDays = this.getWeekDays(this.state.weekOffset);

        const labels = weekDays.map(d => d.toLocaleDateString('pt-BR', { weekday: 'short' }));
        const data = weekDays.map(d => {
            const dateStr = d.toISOString().slice(0, 10);
            return habits.filter(h => h.history[dateStr]).length;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Concluídos',
                    data: data,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4,
                    barThickness: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { displayColors: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: habits.length > 0 ? habits.length : 5,
                        grid: { color: 'rgba(128, 128, 128, 0.1)' },
                        ticks: { stepSize: 1, color: '#9ca3af', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 10 } }
                    }
                }
            }
        });
    },

    toggleCheck(id, date) {
        Store.toggleHabit(id, date);
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.renderChart();
    },

    openModal() {
        document.getElementById('habit-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('habit-modal').classList.add('hidden');
        document.getElementById('habit-form').reset();
    },

    saveHabit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const habit = Object.fromEntries(formData.entries());

        Store.addHabit(habit);
        this.closeModal();
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.renderChart();
    },

    deleteHabit(id) {
        console.log('Attempting to delete habit:', id);
        if (confirm('Deseja excluir este hábito?')) {
            Store.deleteHabit(id);
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
            this.renderChart();
        }
    }
};
