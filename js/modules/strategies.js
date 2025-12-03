window.StrategiesModule = {
    render() {
        const strategies = Store.getStrategies();
        const sortedByWinRate = [...strategies].sort((a, b) => b.stats.winRate - a.stats.winRate);
        const bestStrategy = sortedByWinRate[0];

        return `
            <div class="animate-fade-in space-y-8">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Minhas Estratégias</h2>
                        <p class="text-gray-500 dark:text-gray-400">Gerencie e analise suas estratégias operacionais.</p>
                    </div>
                    <button onclick="window.StrategiesModule.openModal()" class="bg-zenox-primary hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> 
                        <span>Nova Estratégia</span>
                    </button>
                </header>

                <!-- Performance Overview -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Best Strategy Card -->
                    <div class="bg-gradient-to-br from-zenox-primary to-blue-600 rounded-2xl p-6 text-white shadow-card relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-4 opacity-20">
                            <i class="fa-solid fa-trophy text-8xl"></i>
                        </div>
                        <div class="relative z-10">
                            <p class="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Melhor Performance</p>
                            ${bestStrategy ? `
                                <h3 class="text-3xl font-bold mb-1">${bestStrategy.name}</h3>
                                <div class="flex items-center gap-3 mb-6">
                                    <span class="bg-white/20 px-2 py-1 rounded text-sm backdrop-blur-sm">
                                        <i class="fa-solid fa-crosshairs mr-1"></i> ${bestStrategy.stats.winRate}% Win Rate
                                    </span>
                                    <span class="bg-white/20 px-2 py-1 rounded text-sm backdrop-blur-sm">
                                        <i class="fa-solid fa-sack-dollar mr-1"></i> R$ ${Store.formatCurrency(bestStrategy.stats.profit)}
                                    </span>
                                </div>
                                <p class="text-white/90 text-sm line-clamp-2">${bestStrategy.description || 'Sem descrição.'}</p>
                            ` : `
                                <h3 class="text-2xl font-bold mb-2">Sem dados suficientes</h3>
                                <p class="text-white/80">Registre trades para ver sua melhor estratégia aqui.</p>
                            `}
                        </div>
                    </div>

                    <!-- Comparison Chart -->
                    <div class="lg:col-span-2 bg-white dark:bg-zenox-surface rounded-2xl p-6 shadow-card border border-gray-100 dark:border-white/5">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-4">Comparativo de Win Rate</h3>
                        <div class="h-48 relative">
                            <canvas id="strategiesChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Strategies Grid -->
                <div>
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Todas as Estratégias</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${strategies.map(strategy => `
                            <div onclick="window.StrategiesModule.viewStrategy('${strategy.id}')" class="bg-white dark:bg-zenox-surface rounded-2xl overflow-hidden shadow-card hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-100 dark:border-white/5 group relative">
                                <!-- Color Strip -->
                                <div class="h-1.5 w-full" style="background-color: ${strategy.color}"></div>
                                
                                <div class="p-6">
                                    <div class="flex justify-between items-start mb-4">
                                        <h3 class="text-lg font-bold text-gray-800 dark:text-white group-hover:text-zenox-primary transition-colors">${strategy.name}</h3>
                                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                                            <button onclick="window.StrategiesModule.deleteStrategy('${strategy.id}', event)" class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors">
                                                <i class="fa-solid fa-trash text-sm"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">${strategy.description || 'Sem descrição.'}</p>

                                    <div class="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <div class="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                                            <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">Win Rate</p>
                                            <p class="font-bold ${strategy.stats.winRate >= 50 ? 'text-emerald-500' : 'text-rose-500'}">${strategy.stats.winRate}%</p>
                                        </div>
                                        <div class="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                                            <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">Profit</p>
                                            <p class="font-bold ${strategy.stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'} text-sm">R$ ${Store.formatCurrency(strategy.stats.profit)}</p>
                                        </div>
                                        <div class="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                                            <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">Trades</p>
                                            <p class="font-bold text-gray-700 dark:text-gray-300">${strategy.stats.ops}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        <!-- Add New Card -->
                        <button onclick="window.StrategiesModule.openModal()" class="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-zenox-primary dark:hover:text-white hover:border-zenox-primary/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all min-h-[200px] group">
                            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-plus text-2xl"></i>
                            </div>
                            <span class="font-medium">Criar Nova Estratégia</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Create Modal -->
            <div id="strategy-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform scale-95 transition-transform max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Nova Estratégia</h3>
                        <button onclick="window.StrategiesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="strategy-form" onsubmit="window.StrategiesModule.saveStrategy(event)" class="p-6 space-y-5">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Estratégia</label>
                            <input type="text" name="name" placeholder="Ex: Rompimento de Pivô" required 
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-primary outline-none transition-all">
                        </div>

                        <!-- Image Upload -->
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Imagem/Diagrama (Opcional)</label>
                            <div class="relative group">
                                <input type="file" id="strategy-image" accept="image/*" onchange="window.StrategiesModule.handleImagePreview(event)" class="hidden">
                                <div id="image-dropzone" onclick="document.getElementById('strategy-image').click()" 
                                    class="w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zenox-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-all overflow-hidden bg-gray-50 dark:bg-black/10">
                                    <div id="upload-placeholder" class="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <i class="fa-regular fa-image text-3xl mb-2"></i>
                                        <span class="text-xs">Clique para adicionar imagem</span>
                                    </div>
                                    <img id="image-preview" src="" class="hidden w-full h-full object-cover">
                                    <button type="button" id="remove-image-btn" onclick="window.StrategiesModule.removeImage(event)" class="hidden absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-10">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                            <textarea name="description" rows="3" placeholder="Descreva os gatilhos de entrada e saída..." 
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-primary outline-none transition-all resize-none"></textarea>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Identificação</label>
                            <div class="flex gap-3 flex-wrap">
                                ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map((color, index) => `
                                    <label class="cursor-pointer">
                                        <input type="radio" name="color" value="${color}" class="peer hidden" ${index === 0 ? 'checked' : ''}>
                                        <div class="w-8 h-8 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-white dark:peer-checked:ring-offset-zenox-surface peer-checked:ring-[${color}] transition-all transform peer-checked:scale-110 shadow-sm" style="background-color: ${color}"></div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10">
                            <button type="button" onclick="window.StrategiesModule.closeModal()" class="px-6 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                            <button type="submit" class="px-6 py-2.5 rounded-xl bg-zenox-primary text-white font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20">Salvar Estratégia</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Modal -->
            <div id="view-strategy-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div class="bg-white dark:bg-zenox-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform scale-95 transition-transform max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div class="flex items-center gap-3">
                            <div id="view-strategy-color" class="w-3 h-8 rounded-full bg-gray-500"></div>
                            <h3 id="view-strategy-name" class="text-2xl font-bold text-gray-800 dark:text-white">Nome da Estratégia</h3>
                        </div>
                        <button onclick="window.StrategiesModule.closeViewModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Image Container -->
                        <div id="view-strategy-image-container" class="hidden w-full rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg bg-black/5">
                            <img id="view-strategy-image" src="" class="w-full h-auto object-contain max-h-[400px]">
                        </div>

                        <!-- Description -->
                        <div class="space-y-2">
                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</h4>
                            <div id="view-strategy-description" class="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5"></div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Win Rate</p>
                                <p id="view-strategy-winrate" class="text-2xl font-bold text-gray-800 dark:text-white">0%</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Profit Total</p>
                                <p id="view-strategy-profit" class="text-2xl font-bold text-gray-800 dark:text-white">R$ 0,00</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-center">
                                <p class="text-xs text-gray-500 uppercase font-bold mb-1">Operações</p>
                                <p id="view-strategy-ops" class="text-2xl font-bold text-gray-800 dark:text-white">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end bg-gray-50 dark:bg-white/5">
                        <button onclick="window.StrategiesModule.closeViewModal()" class="px-6 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm">Fechar</button>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        this.renderChart();
    },

    renderChart() {
        const ctx = document.getElementById('strategiesChart');
        if (!ctx) return;

        const strategies = Store.getStrategies();
        const labels = strategies.map(s => s.name);
        const data = strategies.map(s => s.stats.winRate);
        const colors = strategies.map(s => s.color);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Win Rate (%)',
                    data: data,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.raw}% Win Rate`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(128, 128, 128, 0.1)' },
                        ticks: { color: '#9ca3af' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
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
        winRateEl.className = `text-2xl font-bold ${strategy.stats.winRate >= 50 ? 'text-emerald-500' : 'text-rose-500'}`;

        const profitEl = document.getElementById('view-strategy-profit');
        profitEl.textContent = `R$ ${Store.formatCurrency(strategy.stats.profit)}`;
        profitEl.className = `text-2xl font-bold ${strategy.stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`;

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
    },

    deleteStrategy(id, event) {
        if (event) event.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta estratégia?')) {
            Store.deleteStrategy(id);
            router.handleRoute();
        }
    }
};
