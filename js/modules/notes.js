const NotesModule = {
    render() {
        const notes = Store.getNotes();

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-white">Notas</h2>
                        <p class="text-gray-400">Suas ideias e lembretes.</p>
                    </div>
                    <div class="flex gap-3">
                        <div class="relative">
                            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                            <input type="text" placeholder="Buscar notas..." class="pl-10 pr-4 py-2 rounded-xl zenox-input w-full md:w-64">
                        </div>
                        <button onclick="NotesModule.openModal()" class="bg-zenox-accent hover:bg-rose-400 text-white font-bold py-2 px-6 rounded-xl shadow-neon transition-all flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i> Nova Nota
                        </button>
                    </div>
                </header>

                <!-- Notes Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${notes.map(note => `
                        <div class="glass-card p-5 rounded-2xl hover:border-zenox-accent/50 transition-colors group cursor-pointer flex flex-col h-full">
                            <h3 class="font-bold text-white text-lg mb-2">${note.title}</h3>
                            <p class="text-gray-400 text-sm whitespace-pre-wrap mb-4 flex-1">${note.content}</p>
                            
                            <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <div class="flex gap-2">
                                    ${(note.tags || []).map(tag => `
                                        <span class="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-400">${tag}</span>
                                    `).join('')}
                                </div>
                                <span class="text-xs text-gray-600">${new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Add New Card (Empty State) -->
                    ${notes.length === 0 ? `
                        <div onclick="NotesModule.openModal()" class="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-zenox-accent/50 hover:bg-white/5 transition-all cursor-pointer h-48">
                            <i class="fa-solid fa-plus text-2xl mb-2"></i>
                            <span class="font-medium">Criar primeira nota</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Modal -->
            <div id="note-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div class="bg-zenox-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
                    <div class="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-white">Nova Nota</h3>
                        <button onclick="NotesModule.closeModal()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="note-form" onsubmit="NotesModule.saveNote(event)" class="p-6 space-y-4">
                        <div class="space-y-1">
                            <input type="text" name="title" placeholder="Título" required class="w-full p-3 rounded-xl zenox-input text-lg font-bold bg-transparent border-none focus:ring-0 px-0">
                        </div>
                        <div class="space-y-1">
                            <textarea name="content" rows="6" placeholder="Escreva sua nota aqui..." required class="w-full p-3 rounded-xl zenox-input bg-transparent border-none focus:ring-0 px-0 resize-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <input type="text" name="tags" placeholder="Tags (separadas por vírgula)" class="w-full p-3 rounded-xl zenox-input text-sm">
                        </div>

                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="NotesModule.closeModal()" class="px-6 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">Cancelar</button>
                            <button type="submit" class="px-6 py-2 rounded-xl bg-zenox-accent text-white font-bold hover:bg-rose-400 transition-colors shadow-neon">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    openModal() {
        document.getElementById('note-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('note-modal').classList.add('hidden');
        document.getElementById('note-form').reset();
    },

    saveNote(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const note = {
            title: formData.get('title'),
            content: formData.get('content'),
            tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
        };

        Store.addNote(note);
        this.closeModal();
        router.handleRoute();
    }
};
