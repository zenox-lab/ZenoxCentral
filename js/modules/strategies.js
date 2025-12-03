window.StrategiesModule = {
    render() {
        const strategies = Store.getStrategies();

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Minhas Estratégias</h2>
                        <p class="text-gray-500 dark:text-gray-400">Gerencie e analise suas estratégias operacionais.</p>
                    </div>
                    <button onclick="window.StrategiesModule.openModal()" class="bg-zenox-primary hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-zenox-primary/30 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Nova Estratégia
                    </button>
                </header>

                <!-- Strategies Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${strategies.map(strategy => `
                        <div onclick="window.StrategiesModule.viewStrategy('${strategy.id}')" class="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer relative border border-gray-200 dark:border-white/5" style="border-top: 4px solid ${strategy.color}">
                            <div class="p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex items-center gap-3">
                                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">${strategy.name}</h3>
                                    </div>
                                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                                        <button class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                                
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 h-14">${strategy.description || 'Sem descrição.'}</p>

                                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
                                    <div class="flex flex-col items-center">
                                        <p class="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">Win Rate</p>
                                        <p class="text-base font-bold ${strategy.stats.winRate >= 50 ? 'text-zenox-success' : 'text-zenox-accent'}">${strategy.stats.winRate}%</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <p class="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">Profit</p>
                                        <p class="text-base font-bold ${strategy.stats.profit >= 0 ? 'text-zenox-success' : 'text-zenox-accent'}">R$ ${Store.formatCurrency(strategy.stats.profit)}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <p class="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">Ops</p>
                                        <p class="text-base font-bold text-gray-700 dark:text-white">${strategy.stats.ops}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Add New Card -->
                    <div onclick="window.StrategiesModule.openModal()" class="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-zenox-primary dark:hover:text-white hover:border-zenox-primary/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[200px]">
                        <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-plus text-2xl"></i>
                        </div>
                        <span class="font-medium">Criar Nova Estratégia</span>
                    </div>
                </div>
            </div>

            <!-- Create Modal -->
            <div id="strategy-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-all">
                <div class="bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in transition-colors max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-zenox-surface z-10">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nova Estratégia</h3>
                        <button onclick="window.StrategiesModule.closeModal()" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="strategy-form" onsubmit="window.StrategiesModule.saveStrategy(event)" class="p-6 space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Nome da Estratégia</label>
                            <input type="text" name="name" placeholder="Ex: Rompimento de Resistência" required class="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:border-zenox-primary focus:ring-1 focus:ring-zenox-primary outline-none transition-all">
                        </div>

                        <!-- Image Upload -->
                        <div class="space-y-1">
                            <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Imagem/Diagrama da Estratégia</label>
                            <div class="relative group">
                                <input type="file" id="strategy-image" accept="image/*" onchange="window.StrategiesModule.handleImagePreview(event)" class="hidden">
                                <div id="image-dropzone" onclick="document.getElementById('strategy-image').click()" 
                                    class="w-full h-40 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zenox-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-all overflow-hidden">
                                    <div id="upload-placeholder" class="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <i class="fa-regular fa-image text-4xl mb-2"></i>
                                        <span class="text-sm">Clique para adicionar imagem</span>
                                        <span class="text-xs opacity-70">Ajuda a visualizar melhor a estratégia</span>
                                    </div>
                                    <img id="image-preview" src="" class="hidden w-full h-full object-cover">
                                    <button type="button" id="remove-image-btn" onclick="window.StrategiesModule.removeImage(event)" class="hidden absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-10">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Descrição</label>
                            <textarea name="description" rows="3" placeholder="Descreva os critérios de entrada, saída, condições de mercado..." class="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:border-zenox-primary focus:ring-1 focus:ring-zenox-primary outline-none transition-all"></textarea>
                            <p class="text-xs text-gray-400 dark:text-gray-500">Descreva a estratégia em detalhes</p>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Cor de Identificação</label>
                            <div class="flex gap-3 flex-wrap">
                                ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map((color, index) => `
                                    <label class="cursor-pointer">
                                        <input type="radio" name="color" value="${color}" class="peer hidden" ${index === 0 ? 'checked' : ''}>
                                        <div class="w-10 h-10 rounded-lg peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-white dark:peer-checked:ring-offset-zenox-surface peer-checked:ring-[${color}] transition-all transform peer-checked:scale-110" style="background-color: ${color}"></div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-white/10 mt-4">
                            <button type="button" onclick="window.StrategiesModule.closeModal()" class="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                            <button type="submit" class="px-6 py-2.5 rounded-xl bg-zenox-primary text-white font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-zenox-primary/20">Criar Estratégia</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Modal -->
            <div id="view-strategy-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-all">
                <div class="bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in transition-colors max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-zenox-surface z-10">
                        <div class="flex items-center gap-3">
                            <div id="view-strategy-color" class="w-4 h-10 rounded-full bg-gray-500"></div>
                            <h3 id="view-strategy-name" class="text-2xl font-bold text-gray-900 dark:text-white">Nome da Estratégia</h3>
                        </div>
                        <button onclick="window.StrategiesModule.closeViewModal()" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Image Container -->
                        <div id="view-strategy-image-container" class="hidden w-full rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
                            <img id="view-strategy-image" src="" class="w-full h-auto object-contain max-h-[400px] bg-gray-50 dark:bg-black/20">
                        </div>

                        <!-- Description -->
                        <div class="space-y-2">
                            <h4 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</h4>
                            <div id="view-strategy-description" class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5"></div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Win Rate</p>
                                <p id="view-strategy-winrate" class="text-2xl font-bold text-gray-900 dark:text-white">0%</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Profit Total</p>
                                <p id="view-strategy-profit" class="text-2xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Operações</p>
                                <p id="view-strategy-ops" class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
                        <button onclick="window.StrategiesModule.closeViewModal()" class="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Fechar</button>
                    </div>
                </div>
            </div>
        `;
    },

    openModal() {
        const modal = document.getElementById('strategy-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeModal() {
        const modal = document.getElementById('strategy-modal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('strategy-form');
        if (form) form.reset();
        this.removeImage();
    },

    viewStrategy(id) {
        const strategies = Store.getStrategies();
        const strategy = strategies.find(s => s.id === id);
        if (!strategy) return;

        // Populate View Modal
        document.getElementById('view-strategy-name').textContent = strategy.name;
        document.getElementById('view-strategy-color').style.backgroundColor = strategy.color;

        const descEl = document.getElementById('view-strategy-description');
        descEl.textContent = strategy.description || 'Nenhuma descrição fornecida.';

        // Image
        const imgContainer = document.getElementById('view-strategy-image-container');
        const imgEl = document.getElementById('view-strategy-image');
        if (strategy.image) {
            imgEl.src = strategy.image;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
            imgEl.src = '';
        }

        // Stats
        const winRateEl = document.getElementById('view-strategy-winrate');
        winRateEl.textContent = `${strategy.stats.winRate}%`;
        winRateEl.className = `text-2xl font-bold ${strategy.stats.winRate >= 50 ? 'text-zenox-success' : 'text-zenox-accent'}`;

        const profitEl = document.getElementById('view-strategy-profit');
        profitEl.textContent = `R$ ${Store.formatCurrency(strategy.stats.profit)}`;
        profitEl.className = `text-2xl font-bold ${strategy.stats.profit >= 0 ? 'text-zenox-success' : 'text-zenox-accent'}`;

        document.getElementById('view-strategy-ops').textContent = strategy.stats.ops;

        // Open Modal
        document.getElementById('view-strategy-modal').classList.remove('hidden');
    },

    closeViewModal() {
        document.getElementById('view-strategy-modal').classList.add('hidden');
    },

    handleImagePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                const placeholder = document.getElementById('upload-placeholder');
                const removeBtn = document.getElementById('remove-image-btn');

                preview.src = e.target.result;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
                removeBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    removeImage(event) {
        if (event) event.stopPropagation();

        const input = document.getElementById('strategy-image');
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const removeBtn = document.getElementById('remove-image-btn');

        input.value = '';
        preview.src = '';
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        removeBtn.classList.add('hidden');
    },

    saveStrategy(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const strategy = Object.fromEntries(formData.entries());

        const imagePreview = document.getElementById('image-preview');
        if (!imagePreview.classList.contains('hidden')) {
            strategy.image = imagePreview.src;
        }

        try {
            Store.addStrategy(strategy);
            this.closeModal();
            router.handleRoute();
        } catch (error) {
            console.error('Error saving strategy:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                alert('Erro: A imagem é muito grande para ser salva. Tente uma imagem menor ou remova-a.');
            } else {
                alert('Erro ao salvar estratégia: ' + error.message);
            }
        }
    }
};
