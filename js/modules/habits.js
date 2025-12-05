window.HabitsModule = {
    state: {
        weekOffset: 0
    },

    render() {
        const habits = Store.getHabits();
        const today = new Date().toISOString().slice(0, 10);
        const metrics = Store.getDailyMetrics()[today] || {};

        // Defaults
        const weight = metrics.weight || 0;
        const steps = metrics.steps || 0;
        const sleep = metrics.sleep || 0;
        const water = metrics.water || 0;
        const calories = metrics.calories || 0;

        // Date Info
        const dateObj = new Date();
        const dateDay = dateObj.getDate();
        const dateMonth = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
        const weekDay = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

        return `
            <div class="animate-fade-in space-y-6 pb-20">
                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                            <span class="capitalize">${weekDay}</span>, ${dateDay} de ${dateMonth}
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
                            Bem-vindo de volta! <span class="text-2xl">👋</span>
                        </h1>
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="HabitsModule.openModal()" 
                            class="bg-zenox-primary hover:bg-cyan-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i> Novo Hábito
                        </button>
                    </div>
                </div>

                <!-- Top Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <!-- Weight Card (Orange Theme) -->
                    <div class="bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-20">
                            <i class="fa-solid fa-weight-scale text-6xl"></i>
                        </div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <span class="font-medium opacity-90">Peso</span>
                                <div class="bg-white/20 p-1.5 rounded-lg cursor-pointer hover:bg-white/30 transition-colors" onclick="document.getElementById('weight-input').focus()">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </div>
                            </div>
                            <div class="flex items-baseline gap-1 mb-2">
                                <input type="number" id="weight-input" value="${weight}" 
                                    onchange="HabitsModule.saveMetric('weight', this.value)"
                                    class="bg-transparent text-4xl font-bold w-24 outline-none placeholder-white/50" placeholder="00.0">
                                <span class="text-lg opacity-80">kg</span>
                            </div>
                            <!-- Mini Sparkline Area -->
                            <div class="h-12 w-full mt-2">
                                <canvas id="weightSparkline"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Steps Card -->
                    <div class="bg-white dark:bg-zenox-surface rounded-3xl p-5 shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-gray-500 dark:text-gray-400 text-sm font-medium">Passos</span>
                                <div class="flex items-baseline gap-1 mt-1">
                                    <input type="number" value="${steps}" 
                                        onchange="HabitsModule.saveMetric('steps', this.value)"
                                        class="bg-transparent text-2xl font-bold text-gray-800 dark:text-white w-24 outline-none" placeholder="0">
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                <i class="fa-solid fa-shoe-prints"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div class="h-full bg-zenox-primary rounded-full" style="width: ${Math.min((steps / 10000) * 100, 100)}%"></div>
                            </div>
                            <div class="flex justify-between mt-2 text-xs text-gray-400">
                                <span>Meta: 10k</span>
                                <span>${Math.round((steps / 10000) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sleep Card -->
                    <div class="bg-white dark:bg-zenox-surface rounded-3xl p-5 shadow-card border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-gray-500 dark:text-gray-400 text-sm font-medium">Sono</span>
                                <div class="flex items-baseline gap-1 mt-1">
                                    <input type="number" value="${sleep}" step="0.1"
                                        onchange="HabitsModule.saveMetric('sleep', this.value)"
                                        class="bg-transparent text-2xl font-bold text-gray-800 dark:text-white w-20 outline-none" placeholder="0">
                                    <span class="text-sm text-gray-400">h</span>
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <i class="fa-solid fa-moon"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center gap-1">
                            ${this.renderSleepQuality(sleep)}
                        </div>
                    </div>

                    <!-- Water Card -->
                    <div class="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-5 shadow-card border border-blue-100 dark:border-blue-500/20 flex flex-col justify-between relative overflow-hidden">
                        <div class="absolute -right-4 -bottom-4 text-blue-200 dark:text-blue-800/20 text-8xl opacity-50">
                            <i class="fa-solid fa-droplet"></i>
                        </div>
                        <div class="relative z-10">
                            <span class="text-blue-600 dark:text-blue-400 text-sm font-bold">Água</span>
                            <div class="flex items-baseline gap-1 mt-1">
                                <input type="number" value="${water}" step="50"
                                    onchange="HabitsModule.saveMetric('water', this.value)"
                                    class="bg-transparent text-3xl font-bold text-blue-700 dark:text-blue-300 w-24 outline-none placeholder-blue-300" placeholder="0">
                                <span class="text-sm text-blue-500">ml</span>
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick="HabitsModule.addWater(250)" class="px-3 py-1 bg-white dark:bg-blue-900/30 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm hover:scale-105 transition-transform">+250ml</button>
                                <button onclick="HabitsModule.addWater(500)" class="px-3 py-1 bg-white dark:bg-blue-900/30 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm hover:scale-105 transition-transform">+500ml</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Middle Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- Nutrition & Vitals Column -->
                    <div class="space-y-6">
                        <!-- Nutrition Card -->
                        <div class="bg-white dark:bg-zenox-surface rounded-3xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                            <h3 class="font-bold text-gray-800 dark:text-white mb-4">Nutrição</h3>
                            <div class="flex items-center justify-center mb-6 relative">
                                <div class="w-32 h-32">
                                    <canvas id="nutritionChart"></canvas>
                                </div>
                                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span class="text-2xl font-bold text-gray-800 dark:text-white">${calories}</span>
                                    <span class="text-[10px] text-gray-400 uppercase tracking-wider">Kcal</span>
                                </div>
                            </div>
                            
                            <!-- Macros Inputs -->
                            <div class="grid grid-cols-3 gap-2">
                                <div class="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <span class="block text-[10px] text-gray-400 mb-1">Carb</span>
                                    <input type="number" value="${metrics.carbs || 0}" 
                                        onchange="HabitsModule.saveMetric('carbs', this.value)"
                                        class="w-full bg-transparent text-center font-bold text-sm text-gray-800 dark:text-white outline-none">
                                    <span class="text-[10px] text-gray-400">g</span>
                                </div>
                                <div class="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <span class="block text-[10px] text-gray-400 mb-1">Prot</span>
                                    <input type="number" value="${metrics.protein || 0}" 
                                        onchange="HabitsModule.saveMetric('protein', this.value)"
                                        class="w-full bg-transparent text-center font-bold text-sm text-gray-800 dark:text-white outline-none">
                                    <span class="text-[10px] text-gray-400">g</span>
                                </div>
                                <div class="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <span class="block text-[10px] text-gray-400 mb-1">Gord</span>
                                    <input type="number" value="${metrics.fat || 0}" 
                                        onchange="HabitsModule.saveMetric('fat', this.value)"
                                        class="w-full bg-transparent text-center font-bold text-sm text-gray-800 dark:text-white outline-none">
                                    <span class="text-[10px] text-gray-400">g</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <label class="text-xs text-gray-500 mb-1 block">Calorias Totais</label>
                                <input type="number" value="${calories}" 
                                    onchange="HabitsModule.saveMetric('calories', this.value)"
                                    class="w-full bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-zenox-primary/50">
                            </div>
                        </div>

                        <!-- Daily Vitals (Mood/Stress) -->
                        <div class="bg-white dark:bg-zenox-surface rounded-3xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                            <h3 class="font-bold text-gray-800 dark:text-white mb-4">Diário</h3>
                            <div class="space-y-4">
                                <div>
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-gray-500"><i class="fa-regular fa-face-smile text-purple-500 mr-1"></i> Humor</span>
                                        <span class="font-bold text-purple-500">${metrics.mood || '-'}</span>
                                    </div>
                                    <input type="range" min="0" max="10" value="${metrics.mood || 5}" 
                                        onchange="HabitsModule.saveMetric('mood', this.value)"
                                        class="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500">
                                </div>
                                <div>
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-gray-500"><i class="fa-solid fa-bolt text-rose-500 mr-1"></i> Stress</span>
                                        <span class="font-bold text-rose-500">${metrics.stress || '-'}</span>
                                    </div>
                                    <input type="range" min="0" max="10" value="${metrics.stress || 5}" 
                                        onchange="HabitsModule.saveMetric('stress', this.value)"
                                        class="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Habits List Column (Spans 2 cols) -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Habits Table Container -->
                        <div class="bg-white dark:bg-zenox-surface rounded-3xl shadow-card border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h3 class="font-bold text-gray-800 dark:text-white">Rastreador de Hábitos</h3>
                                <!-- Week Nav -->
                                <div class="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                                    <button onclick="HabitsModule.changeWeek(-1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-all shadow-sm">
                                        <i class="fa-solid fa-chevron-left text-xs"></i>
                                    </button>
                                    <span class="text-xs font-bold px-2 text-gray-600 dark:text-gray-300">Semana ${this.getWeekNumber(new Date()) + this.state.weekOffset}</span>
                                    <button onclick="HabitsModule.changeWeek(1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-all shadow-sm">
                                        <i class="fa-solid fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="overflow-x-auto">
                                ${this.renderHabitsTable(habits)}
                            </div>
                        </div>

                         <!-- Today's Plan (Simple List) -->
                         <div class="bg-white dark:bg-zenox-surface rounded-3xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                            <h3 class="font-bold text-gray-800 dark:text-white mb-4">Plano de Hoje</h3>
                            <div class="space-y-3">
                                ${this.renderTodaysPlan(habits, today)}
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div id="habit-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform scale-95 transition-transform">
                    <div class="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Novo Hábito</h3>
                        <button onclick="HabitsModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    
                    <form id="habit-form" onsubmit="HabitsModule.saveHabit(event)" class="p-6 space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Hábito</label>
                            <input type="text" name="name" placeholder="Ex: Ler 10 páginas..." required 
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-primary outline-none transition-all text-sm font-medium">
                        </div>

                        <div class="pt-2 flex justify-end gap-3">
                            <button type="button" onclick="HabitsModule.closeModal()" class="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-bold">Cancelar</button>
                            <button type="submit" class="px-5 py-2.5 rounded-xl bg-zenox-primary text-white text-sm font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20">Salvar Hábito</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    renderHabitsTable(habits) {
        const weekDays = this.getWeekDays(this.state.weekOffset);

        if (habits.length === 0) {
            return `<div class="p-8 text-center text-gray-400 text-sm">Nenhum hábito cadastrado ainda.</div>`;
        }

        return `
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-gray-50/50 dark:bg-white/5">
                        <th class="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Hábito</th>
                        ${weekDays.map(date => {
            const isToday = date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
            return `
                                <th class="p-2 text-center">
                                    <div class="flex flex-col items-center">
                                        <span class="text-[10px] font-bold uppercase ${isToday ? 'text-zenox-primary' : 'text-gray-400'}">${date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</span>
                                        <span class="text-xs ${isToday ? 'font-bold text-white bg-zenox-primary w-6 h-6 flex items-center justify-center rounded-full mt-1 shadow-md' : 'text-gray-500 mt-1'}">${date.getDate()}</span>
                                    </div>
                                </th>
                            `}).join('')}
                        <th class="w-10"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    ${habits.map(habit => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <td class="p-4 font-semibold text-sm text-gray-800 dark:text-white">
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
                                                class="w-8 h-8 rounded-xl flex items-center justify-center transition-all mx-auto ${isDone ? 'bg-zenox-primary text-white shadow-md shadow-cyan-500/20 scale-105' : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-white/10'}">
                                                <i class="fa-solid fa-check ${isDone ? 'opacity-100' : 'opacity-0'} transition-opacity text-xs"></i>
                                            </button>
                                        ` : `
                                            <div class="w-2 h-2 mx-auto rounded-full bg-gray-200 dark:bg-white/5"></div>
                                        `}
                                    </td>
                                `}).join('')}
                            <td class="p-4 text-right">
                                <button onclick="HabitsModule.deleteHabit('${habit.id}')" class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <i class="fa-solid fa-trash text-sm"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    renderTodaysPlan(habits, todayStr) {
        const todaysHabits = habits.map(h => ({
            ...h,
            done: !!h.history[todayStr]
        }));

        if (todaysHabits.length === 0) return '<div class="text-sm text-gray-400">Nada para hoje.</div>';

        return todaysHabits.map(h => `
            <div class="flex items-center gap-3 p-3 rounded-xl border ${h.done ? 'border-green-500/20 bg-green-500/5' : 'border-gray-100 dark:border-white/5'} transition-all">
                <button onclick="HabitsModule.toggleCheck('${h.id}', '${todayStr}')"
                    class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${h.done ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-zenox-primary'}">
                    <i class="fa-solid fa-check text-[10px]"></i>
                </button>
                <span class="text-sm font-medium ${h.done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}">${h.name}</span>
            </div>
        `).join('');
    },

    renderSleepQuality(hours) {
        let bars = '';
        for (let i = 0; i < 7; i++) {
            const height = Math.random() * 60 + 20; // Random visual for now
            bars += `<div class="w-1 bg-indigo-200 dark:bg-indigo-500/30 rounded-full" style="height: ${height}%"></div>`;
        }
        return `<div class="flex items-end gap-1 h-8">${bars}</div>`;
    },

    afterRender() {
        this.renderWeightSparkline();
        this.renderNutritionChart();
    },

    saveMetric(type, value) {
        const today = new Date().toISOString().slice(0, 10);
        Store.saveDailyMetric(today, type, value);

        // Re-render charts if needed without full page reload for better UX
        if (type === 'calories' || type === 'carbs' || type === 'protein' || type === 'fat') {
            this.renderNutritionChart();
        }
        if (type === 'weight') {
            this.renderWeightSparkline();
        }
    },

    addWater(amount) {
        const today = new Date().toISOString().slice(0, 10);
        const current = Store.getDailyMetrics()[today]?.water || 0;
        const newVal = parseFloat(current) + amount;
        this.saveMetric('water', newVal);
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.afterRender();
    },

    renderWeightSparkline() {
        const ctx = document.getElementById('weightSparkline');
        if (!ctx) return;
        if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();

        // Get last 7 days weight
        const metrics = Store.getDailyMetrics();
        const data = [];
        const labels = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            data.push(metrics[dateStr]?.weight || null);
            labels.push(dateStr);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    },

    renderNutritionChart() {
        const ctx = document.getElementById('nutritionChart');
        if (!ctx) return;
        if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();

        const today = new Date().toISOString().slice(0, 10);
        const metrics = Store.getDailyMetrics()[today] || {};

        // Simple breakdown: Carbs, Protein, Fat (defaulting to equal if 0 to show ring)
        const c = metrics.carbs || 0;
        const p = metrics.protein || 0;
        const f = metrics.fat || 0;

        const data = (c === 0 && p === 0 && f === 0) ? [1, 1, 1] : [c, p, f];
        const colors = (c === 0 && p === 0 && f === 0)
            ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']
            : ['#f59e0b', '#3b82f6', '#ef4444']; // Amber, Blue, Red

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Carb', 'Prot', 'Gord'],
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    cutout: '85%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    },

    // Helpers
    getWeekDays(offset = 0) {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setDate(monday.getDate() + (offset * 7));

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
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    changeWeek(offset) {
        this.state.weekOffset += offset;
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.afterRender();
    },

    toggleCheck(id, date) {
        Store.toggleHabit(id, date);
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        this.afterRender();
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
        this.afterRender();
    },

    deleteHabit(id) {
        if (confirm('Deseja excluir este hábito?')) {
            Store.deleteHabit(id);
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
            this.afterRender();
        }
    }
};
