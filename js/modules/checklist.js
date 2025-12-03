window.ChecklistModule = {
    render() {
        const checklists = Store.getChecklists();
        const strategies = Store.getStrategies();

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Checklists Operacionais</h2>
                        <p class="text-gray-500 dark:text-gray-400">Padronize suas operações e evite erros emocionais.</p>
                    </div>
                    <button onclick="window.ChecklistModule.openModal()" class="bg-zenox-primary hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-zenox-primary/30 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Novo Checklist
                    </button>
                </header>

                <!-- Checklists Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${checklists.length === 0 ? `
                        <div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                            <i class="fa-solid fa-list-check text-4xl mb-4 opacity-50"></i>
                            <p>Nenhum checklist criado ainda.</p>
                        </div>
                    ` : checklists.map(checklist => {
            const strategy = strategies.find(s => s.id === checklist.strategyId);
            const completedSteps = checklist.steps.filter(s => s.completed).length;
            const totalSteps = checklist.steps.length;
            const progress = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

            return `
                        <div class="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all border border-gray-200 dark:border-white/5 relative">
                            ${strategy ? `<div class="absolute top-0 left-0 w-full h-1" style="background-color: ${strategy.color}"></div>` : ''}
                            <div class="p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">${checklist.name}</h3>
                                    <button onclick="window.ChecklistModule.deleteChecklist('${checklist.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">${checklist.description || 'Sem descrição.'}</p>
                                
                                ${strategy ? `
                                    <div class="mb-4 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                        <div class="w-2 h-2 rounded-full" style="background-color: ${strategy.color}"></div>
                                        ${strategy.name}
                                    </div>
                                ` : ''}

                                <!-- Progress Bar -->
                                <div class="mb-4">
                                    <div class="flex justify-between text-xs mb-1 text-gray-500">
                                        <span>Progresso</span>
                                        <span>${progress}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                                        <div class="bg-zenox-success h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                                    </div>
                                </div>

                                <!-- Steps Preview -->
                                <div class="space-y-2">
                                    ${checklist.steps.map((step, index) => `
                                        <div onclick="window.ChecklistModule.toggleStep('${checklist.id}', ${index})" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                            <div class="w-5 h-5 rounded border ${step.completed ? 'bg-zenox-success border-zenox-success' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center transition-colors">
                                                ${step.completed ? '<i class="fa-solid fa-check text-white text-xs"></i>' : ''}
                                            </div>
                                            <span class="text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}">${step.text}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>

                <!-- Create Modal -->
                <div id="checklist-modal" class="fixed inset-0 z-50 hidden">
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="window.ChecklistModule.closeModal()"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zenox-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
                        
                        <!-- Header -->
                        <div class="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Novo Checklist</h3>
                            <button onclick="window.ChecklistModule.closeModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                                <i class="fa-solid fa-times text-xl"></i>
                            </button>
                        </div>

                        <!-- Scrollable Content -->
                        <div class="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                            <!-- Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Checklist</label>
                                <input type="text" id="checklist-name" placeholder="Ex: Setup Padrão de Entrada"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-zenox-primary transition-colors">
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                <textarea id="checklist-desc" rows="2" placeholder="Breve descrição..."
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-zenox-primary transition-colors resize-none"></textarea>
                            </div>

                            <!-- Strategy Select -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estratégia Relacionada (Opcional)</label>
                                <select id="checklist-strategy" 
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-zenox-primary transition-colors">
                                    <option value="">Selecione uma estratégia...</option>
                                    ${strategies.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                </select>
                            </div>

                            <!-- Steps Builder -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passos do Checklist</label>
                                
                                <div class="flex gap-2 mb-3">
                                    <input type="text" id="step-input" placeholder="Ex: Tocar na LTA/LTB"
                                        class="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-zenox-primary transition-colors"
                                        onkeypress="if(event.key === 'Enter') window.ChecklistModule.addStep()">
                                    <button onclick="window.ChecklistModule.addStep()" 
                                        class="bg-zenox-surfaceHighlight hover:bg-zenox-primary text-white w-12 rounded-xl flex items-center justify-center transition-colors">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                </div>

                                <!-- Steps List -->
                                <div id="steps-list" class="space-y-2">
                                    <!-- Steps will be added here -->
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-black/20 rounded-b-2xl">
                            <button onclick="window.ChecklistModule.closeModal()" 
                                class="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-medium">
                                Cancelar
                            </button>
                            <button onclick="window.ChecklistModule.saveChecklist()" 
                                class="px-6 py-2 rounded-xl bg-zenox-primary hover:bg-cyan-400 text-white font-bold shadow-lg shadow-zenox-primary/20 transition-all transform hover:scale-105">
                                Criar Checklist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    currentSteps: [],

    openModal() {
        const modal = document.getElementById('checklist-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.currentSteps = [];
            this.renderStepsList();
        }
    },

    closeModal() {
        const modal = document.getElementById('checklist-modal');
        if (modal) {
            modal.classList.add('hidden');
            // Reset form
            document.getElementById('checklist-name').value = '';
            document.getElementById('checklist-desc').value = '';
            document.getElementById('checklist-strategy').value = '';
            document.getElementById('step-input').value = '';
            this.currentSteps = [];
            this.renderStepsList();
        }
    },

    addStep() {
        const input = document.getElementById('step-input');
        const text = input.value.trim();

        if (text) {
            this.currentSteps.push({ text, completed: false });
            input.value = '';
            this.renderStepsList();
            input.focus();
        }
    },

    removeStep(index) {
        this.currentSteps.splice(index, 1);
        this.renderStepsList();
    },

    renderStepsList() {
        const container = document.getElementById('steps-list');
        if (!container) return;

        container.innerHTML = this.currentSteps.map((step, index) => `
            <div class="flex items-center justify-between bg-white dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/5 animate-fade-in">
                <span class="text-sm text-gray-700 dark:text-gray-300">${index + 1}. ${step.text}</span>
                <button onclick="window.ChecklistModule.removeStep(${index})" class="text-gray-400 hover:text-red-500 transition-colors">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    saveChecklist() {
        const name = document.getElementById('checklist-name').value.trim();
        const description = document.getElementById('checklist-desc').value.trim();
        const strategyId = document.getElementById('checklist-strategy').value;

        if (!name) {
            alert('Por favor, dê um nome ao checklist.');
            return;
        }

        if (this.currentSteps.length === 0) {
            alert('Adicione pelo menos um passo ao checklist.');
            return;
        }

        const checklist = {
            name,
            description,
            strategyId,
            steps: this.currentSteps,
            createdAt: new Date().toISOString()
        };

        try {
            Store.addChecklist(checklist);
            this.closeModal();
            // Re-render the page
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
        } catch (error) {
            console.error('Error saving checklist:', error);
            alert('Erro ao salvar checklist. Tente novamente.');
        }
    },

    deleteChecklist(id) {
        if (confirm('Tem certeza que deseja excluir este checklist?')) {
            Store.deleteChecklist(id);
            // Re-render
            const container = document.getElementById('app-container');
            container.innerHTML = this.render();
        }
    },

    toggleStep(checklistId, stepIndex) {
        Store.toggleChecklistStep(checklistId, stepIndex);
        // Re-render to show updated state
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
    }
};
