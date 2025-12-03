window.HabitsModule = {
    render() {
        const habits = Store.getHabits();

        // Generate last 7 days
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
        }

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-white">Hábitos</h2>
                        <p class="text-gray-400">Construa sua disciplina diária.</p>
                    </div>
                    <button onclick="HabitsModule.openModal()" class="bg-zenox-secondary hover:bg-violet-400 text-white font-bold py-2 px-6 rounded-xl shadow-neon transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Novo Hábito
                    </button>
                </header>

                <div class="glass-card rounded-2xl overflow-hidden p-6">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr>
                                    <th class="p-4 text-gray-400 font-medium">Hábito</th>
                                    ${dates.map(date => `
                                        <th class="p-4 text-center text-gray-400 text-xs font-mono">
                                            ${date.slice(8, 10)}/${date.slice(5, 7)}
                                        </th>
                                    `).join('')}
                                    <th class="p-4 text-center text-gray-400">Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${habits.map(habit => {
            // Calculate streak
            let streak = 0;
            // Simple streak logic (not robust, just demo)
            const today = new Date().toISOString().slice(0, 10);
            if (habit.history[today]) streak++;

            return `
                                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td class="p-4 font-bold text-white">${habit.name}</td>
                                        ${dates.map(date => `
                                            <td class="p-4 text-center">
                                                <button onclick="HabitsModule.toggleCheck('${habit.id}', '${date}')" 
                                                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-all ${habit.history[date] ? 'bg-zenox-secondary text-white shadow-neon' : 'bg-white/5 text-gray-600 hover:bg-white/10'}">
                                                    <i class="fa-solid fa-check ${habit.history[date] ? 'opacity-100' : 'opacity-0'}"></i>
                                                </button>
                                            </td>
                                        `).join('')}
                                        <td class="p-4 text-center font-bold text-zenox-secondary">
                                            <i class="fa-solid fa-fire mr-1"></i> ${streak}
                                        </td>
                                    </tr>
                                `}).join('')}
                                ${habits.length === 0 ? '<tr><td colspan="9" class="p-8 text-center text-gray-500">Nenhum hábito cadastrado.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div id="habit-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div class="bg-zenox-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                    <div class="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-white">Novo Hábito</h3>
                        <button onclick="HabitsModule.closeModal()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="habit-form" onsubmit="HabitsModule.saveHabit(event)" class="p-6 space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs text-gray-400 uppercase font-bold">Nome do Hábito</label>
                            <input type="text" name="name" placeholder="Ex: Ler 10 páginas" required class="w-full p-3 rounded-xl zenox-input">
                        </div>

                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="HabitsModule.closeModal()" class="px-6 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">Cancelar</button>
                            <button type="submit" class="px-6 py-2 rounded-xl bg-zenox-secondary text-white font-bold hover:bg-violet-400 transition-colors shadow-neon">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    toggleCheck(id, date) {
        Store.toggleHabit(id, date);
        router.handleRoute(); // Re-render to show update
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
        router.handleRoute();
    }
};
