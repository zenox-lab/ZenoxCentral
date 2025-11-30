const StrategiesModule = {
    render() {
        const strategies = Store.getStrategies();

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-white">Minhas Estratégias</h2>
                        <p class="text-gray-400">Gerencie e analise suas estratégias operacionais.</p>
                    </div>
                    <button onclick="StrategiesModule.openModal()" class="bg-zenox-primary hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-xl shadow-neon transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Nova Estratégia
                    </button>
                </header>

                <!-- Strategies Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${strategies.map(strategy => `
                        <div class="glass-card rounded-2xl overflow-hidden group hover:border-opacity-50 transition-all" style="border-color: ${strategy.color}">
                            <div class="p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-12 rounded-full" style="background-color: ${strategy.color}"></div>
                                        <h3 class="text-xl font-bold text-white">${strategy.name}</h3>
                                    </div>
                                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="text-gray-400 hover:text-white"><i class="fa-solid fa-pen"></i></button>
                                        <button class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                                
                                <p class="text-gray-400 text-sm mb-6 line-clamp-2 h-10">${strategy.description || 'Sem descrição.'}</p>

                                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">Win Rate</p>
                                        <p class="text-lg font-bold ${strategy.stats.winRate >= 50 ? 'text-zenox-success' : 'text-zenox-accent'}">${strategy.stats.winRate}%</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">Profit</p>
                                        <p class="text-lg font-bold ${strategy.stats.profit >= 0 ? 'text-zenox-success' : 'text-zenox-accent'}">R$ ${strategy.stats.profit}</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">Ops</p>
                                        <p class="text-lg font-bold text-white">${strategy.stats.ops}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Add New Card -->
                    <div onclick="StrategiesModule.openModal()" class="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-zenox-primary/50 hover:bg-white/5 transition-all cursor-pointer min-h-[200px]">
                        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-plus text-2xl"></i>
                        </div>
                        <span class="font-medium">Criar Nova Estratégia</span>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div id="strategy-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div class="bg-zenox-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
                    <div class="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-white">Nova Estratégia</h3>
                        <button onclick="StrategiesModule.closeModal()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="strategy-form" onsubmit="StrategiesModule.saveStrategy(event)" class="p-6 space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs text-gray-400 uppercase font-bold">Nome da Estratégia</label>
                            <input type="text" name="name" placeholder="Ex: Rompimento de Resistência" required class="w-full p-3 rounded-xl zenox-input">
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs text-gray-400 uppercase font-bold">Descrição</label>
                            <textarea name="description" rows="3" placeholder="Critérios de entrada e saída..." class="w-full p-3 rounded-xl zenox-input"></textarea>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs text-gray-400 uppercase font-bold">Cor de Identificação</label>
                            <div class="flex gap-3 flex-wrap">
                                ${['#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1'].map(color => `
                                    <label class="cursor-pointer">
                                        <input type="radio" name="color" value="${color}" class="peer hidden" ${color === '#06b6d4' ? 'checked' : ''}>
                                        <div class="w-8 h-8 rounded-full bg-[${color}] border-2 border-transparent peer-checked:border-white peer-checked:scale-110 transition-all shadow-lg" style="background-color: ${color}"></div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="StrategiesModule.closeModal()" class="px-6 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">Cancelar</button>
                            <button type="submit" class="px-6 py-2 rounded-xl bg-zenox-primary text-black font-bold hover:bg-cyan-400 transition-colors shadow-neon">Criar Estratégia</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    openModal() {
        document.getElementById('strategy-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('strategy-modal').classList.add('hidden');
        document.getElementById('strategy-form').reset();
    },

    saveStrategy(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const strategy = Object.fromEntries(formData.entries());

        Store.addStrategy(strategy);
        this.closeModal();
        router.handleRoute();
    }
};
