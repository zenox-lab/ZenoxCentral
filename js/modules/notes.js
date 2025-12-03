window.NotesModule = {
    state: {
        searchQuery: '',
        editingId: null,
        selectedColor: 'default',
        noteType: 'text', // 'text' or 'checklist'
        checklistItems: [] // Array of {id, text, completed}
    },

    colors: {
        default: { bg: 'bg-gray-50 dark:bg-zenox-surface', border: 'border-gray-200 dark:border-white/5', dot: 'bg-zinc-500' },
        red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-500/20', dot: 'bg-red-500' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-500/20', dot: 'bg-orange-500' },
        yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-500/20', dot: 'bg-yellow-500' },
        green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-500/20', dot: 'bg-blue-500' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-500/20', dot: 'bg-purple-500' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-500/20', dot: 'bg-pink-500' },
    },

    render() {
        const allNotes = Store.getNotes();
        // Always create a shallow copy to avoid mutating the store when sorting
        const filteredNotes = [...this.filterNotes(allNotes)];

        // Sort: Pinned first, then by date
        filteredNotes.sort((a, b) => {
            if (a.isPinned === b.isPinned) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
            return a.isPinned ? -1 : 1;
        });

        return `
            <div class="animate-fade-in space-y-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Notas</h2>
                        <p class="text-gray-500 dark:text-gray-400">Suas ideias e lembretes.</p>
                    </div>
                    <div class="flex gap-3">
                        <div class="relative">
                            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                            <input type="text" 
                                value="${this.state.searchQuery}"
                                oninput="NotesModule.handleSearch(this.value)"
                                placeholder="Buscar notas..." 
                                class="pl-10 pr-4 py-2 rounded-xl zenox-input w-full md:w-64 focus:ring-2 focus:ring-zenox-primary/50 transition-all bg-white dark:bg-zenox-surfaceHighlight border-gray-200 dark:border-white/5 text-gray-900 dark:text-white">
                        </div>
                        <button onclick="NotesModule.openModal()" class="bg-zenox-accent hover:bg-rose-400 text-white font-bold py-2 px-6 rounded-xl shadow-neon transition-all flex items-center gap-2">
                            <i class="fa-solid fa-plus"></i> Nova Nota
                        </button>
                    </div>
                </header>

                <!-- Kanban Board -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4">
                    <!-- Column: A Fazer -->
                    <div class="flex flex-col gap-2 min-w-[220px]">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 text-xs">
                                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                                A Fazer
                                <span class="bg-gray-200 dark:bg-white/10 text-[9px] px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">${filteredNotes.filter(n => !n.status || n.status === 'todo').length}</span>
                            </h3>
                        </div>
                        <div class="space-y-2 h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                            ${filteredNotes.filter(n => !n.status || n.status === 'todo').map(note => this.renderNoteCard(note)).join('')}
                            ${filteredNotes.filter(n => !n.status || n.status === 'todo').length === 0 ? `
                                <div onclick="NotesModule.openModal()" class="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 hover:border-zenox-accent/50 transition-all cursor-pointer h-20 opacity-60 hover:opacity-100">
                                    <i class="fa-solid fa-plus mb-0.5 text-xs"></i>
                                    <span class="text-[10px] font-medium">Adicionar</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Column: Em Andamento -->
                    <div class="flex flex-col gap-2 min-w-[220px]">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-xs">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                Em Andamento
                                <span class="bg-blue-100 dark:bg-blue-900/30 text-[9px] px-1.5 py-0.5 rounded-full text-blue-600 dark:text-blue-400">${filteredNotes.filter(n => n.status === 'in_progress').length}</span>
                            </h3>
                        </div>
                        <div class="space-y-2 h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                            ${filteredNotes.filter(n => n.status === 'in_progress').map(note => this.renderNoteCard(note)).join('')}
                        </div>
                    </div>

                    <!-- Column: Concluído -->
                    <div class="flex flex-col gap-2 min-w-[220px]">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                Concluído
                                <span class="bg-green-100 dark:bg-green-900/30 text-[9px] px-1.5 py-0.5 rounded-full text-green-600 dark:text-green-400">${filteredNotes.filter(n => n.status === 'done').length}</span>
                            </h3>
                        </div>
                        <div class="space-y-2 h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                            ${filteredNotes.filter(n => n.status === 'done').map(note => this.renderNoteCard(note)).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div id="note-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div class="bg-gray-50 dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                    <div class="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">Nova Nota</h3>
                        <button onclick="NotesModule.closeModal()" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form id="note-form" onsubmit="NotesModule.saveNote(event)" class="p-6 space-y-4">
                        <!-- Type Selector -->
                        <div class="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="text" checked onchange="NotesModule.setNoteType('text')" class="accent-zenox-primary">
                                <span class="text-gray-700 dark:text-gray-300">Texto</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="checklist" onchange="NotesModule.setNoteType('checklist')" class="accent-zenox-primary">
                                <span class="text-gray-700 dark:text-gray-300">Checklist</span>
                            </label>
                        </div>

                        <div class="space-y-1">
                            <input type="text" name="title" id="note-title" placeholder="Título" required class="w-full p-3 rounded-xl zenox-input text-lg font-bold bg-transparent border-none focus:ring-0 px-0 placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white">
                        </div>

                        <!-- Content Area (Text Mode) -->
                        <div id="text-content-area" class="space-y-1">
                            <textarea name="content" id="note-content" rows="6" placeholder="Escreva sua nota aqui..." class="w-full p-3 rounded-xl zenox-input bg-transparent border-none focus:ring-0 px-0 resize-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"></textarea>
                        </div>

                        <!-- Checklist Area (Checklist Mode) -->
                        <div id="checklist-content-area" class="space-y-3 hidden">
                            <div class="flex gap-2">
                                <input type="text" id="new-item-input" placeholder="Adicionar item..." class="flex-1 p-2 rounded-lg zenox-input bg-gray-50 dark:bg-white/5 border-none text-gray-900 dark:text-white placeholder-gray-500" onkeypress="if(event.key === 'Enter') { event.preventDefault(); NotesModule.addChecklistItem(); }">
                                <button type="button" onclick="NotesModule.addChecklistItem()" class="bg-zenox-primary/20 text-zenox-primary hover:bg-zenox-primary/30 px-3 rounded-lg"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <div id="checklist-items-container" class="space-y-2 max-h-48 overflow-y-auto pr-2">
                                <!-- Items will be rendered here -->
                            </div>
                        </div>

                        <!-- Metadata -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-xs text-gray-500 uppercase font-bold">Vencimento</label>
                                <input type="date" name="dueDate" id="note-dueDate" class="w-full p-2 rounded-lg zenox-input bg-gray-50 dark:bg-white/5 border-none text-gray-900 dark:text-white text-sm">
                            </div>
                            <div class="space-y-1">
                                <label class="text-xs text-gray-500 uppercase font-bold">Status</label>
                                <select name="status" id="note-status" class="w-full p-2 rounded-lg zenox-input bg-gray-50 dark:bg-white/5 border-none text-gray-900 dark:text-white text-sm">
                                    <option value="todo">A Fazer</option>
                                    <option value="in_progress">Em Andamento</option>
                                    <option value="done">Concluído</option>
                                </select>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <input type="text" name="tags" id="note-tags" placeholder="Tags (separadas por vírgula)" class="w-full p-3 rounded-xl zenox-input text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white">
                        </div>

                        <!-- Color Picker -->
                        <div class="flex gap-2 pt-2">
                            ${Object.entries(this.colors).map(([key, value]) => `
                                <button type="button" 
                                    onclick="NotesModule.selectColor('${key}')"
                                    class="w-6 h-6 rounded-full ${value.dot} hover:scale-110 transition-transform ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zenox-surface ${this.state.selectedColor === key ? 'ring-gray-900 dark:ring-white' : 'ring-transparent'}">
                                </button>
                            `).join('')}
                        </div>

                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="NotesModule.closeModal()" class="px-6 py-2 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                            <button type="submit" class="px-6 py-2 rounded-xl bg-zenox-accent text-white font-bold hover:bg-rose-400 transition-colors shadow-neon">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    renderNoteCard(note) {
        const colorTheme = this.colors[note.color] || this.colors.default;
        const isChecklist = note.type === 'checklist';

        // Status Badge Colors
        const statusColors = {
            todo: 'bg-gray-500/20 text-gray-500 dark:text-gray-400',
            in_progress: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
            done: 'bg-green-500/20 text-green-600 dark:text-green-400'
        };
        const statusLabels = {
            todo: 'A Fazer',
            in_progress: 'Em Andamento',
            done: 'Concluído'
        };

        return `
            <div class="${colorTheme.bg} border ${colorTheme.border} p-2.5 rounded-lg hover:border-zenox-accent/50 transition-all group relative flex flex-col h-full shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <!-- Actions (Hidden by default, shown on hover) -->
                <div class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 p-0.5 rounded backdrop-blur-sm z-10">
                    <button onclick="NotesModule.togglePin('${note.id}')" class="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors" title="${note.isPinned ? 'Desafixar' : 'Fixar'}">
                        <i class="fa-solid fa-thumbtack text-[10px] ${note.isPinned ? 'text-zenox-primary' : ''}"></i>
                    </button>
                    <button onclick="NotesModule.editNote('${note.id}')" class="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors" title="Editar">
                        <i class="fa-solid fa-pen text-[10px]"></i>
                    </button>
                    <button onclick="NotesModule.deleteNote('${note.id}')" class="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors" title="Excluir">
                        <i class="fa-solid fa-trash text-[10px]"></i>
                    </button>
                </div>

                <!-- Pin Indicator (Always visible if pinned) -->
                ${note.isPinned ? `
                    <div class="absolute top-1.5 right-1.5 text-zenox-primary group-hover:opacity-0 transition-opacity">
                        <i class="fa-solid fa-thumbtack transform rotate-45 text-[10px]"></i>
                    </div>
                ` : ''}

                <div class="mb-1.5 pr-6">
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm leading-tight">${note.title}</h3>
                    ${note.status && note.status !== 'todo' ? `
                        <span class="inline-block mt-0.5 text-[8px] uppercase font-bold px-1 py-0 rounded ${statusColors[note.status]}">${statusLabels[note.status]}</span>
                    ` : ''}
                </div>

                <div class="flex-1 mb-2">
                    ${isChecklist ? `
                        <div class="space-y-0.5">
                            ${(note.items || []).slice(0, 3).map(item => `
                                <div class="flex items-start gap-1.5 group/item cursor-pointer" onclick="NotesModule.toggleChecklistItem('${note.id}', '${item.id}')">
                                    <div class="mt-0.5 w-3 h-3 rounded border ${item.completed ? 'bg-zenox-success border-zenox-success' : 'border-gray-400 dark:border-gray-500'} flex items-center justify-center transition-colors">
                                        ${item.completed ? '<i class="fa-solid fa-check text-white text-[6px]"></i>' : ''}
                                    </div>
                                    <span class="text-[10px] text-gray-600 dark:text-gray-300 ${item.completed ? 'line-through opacity-50' : ''}">${item.text}</span>
                                </div>
                            `).join('')}
                            ${(note.items || []).length > 3 ? `<p class="text-[9px] text-gray-400 italic">+${note.items.length - 3} itens...</p>` : ''}
                        </div>
                    ` : `
                        <p class="text-gray-800 dark:text-gray-300 text-[10px] whitespace-pre-wrap font-medium leading-relaxed">${note.content}</p>
                    `}
                </div>
                
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-200 dark:border-white/5">
                    <div class="flex gap-1 flex-wrap">
                        ${(note.tags || []).map(tag => `
                            <span class="text-[8px] uppercase font-bold px-1 py-0.5 rounded bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-300">${tag}</span>
                        `).join('')}
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-[9px] text-gray-400 dark:text-gray-500 font-mono">${new Date(note.updatedAt).toLocaleDateString()}</span>
                        ${note.dueDate ? `
                            <span class="text-[8px] font-bold ${new Date(note.dueDate) < new Date() ? 'text-red-500' : 'text-blue-500'}">
                                <i class="fa-regular fa-clock mr-0.5"></i>${new Date(note.dueDate).toLocaleDateString()}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    handleSearch(query) {
        this.state.searchQuery = query.toLowerCase();
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
        // Restore focus to input
        const input = container.querySelector('input[type="text"]');
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    },

    filterNotes(notes) {
        if (!this.state.searchQuery) return notes;
        return notes.filter(note =>
            note.title.toLowerCase().includes(this.state.searchQuery) ||
            note.content.toLowerCase().includes(this.state.searchQuery) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(this.state.searchQuery)))
        );
    },

    openModal(noteId = null) {
        const modal = document.getElementById('note-modal');
        const form = document.getElementById('note-form');
        const modalTitle = document.getElementById('modal-title');

        if (noteId) {
            // Edit Mode
            const note = Store.getNotes().find(n => n.id === noteId);
            if (note) {
                this.state.editingId = noteId;
                this.state.selectedColor = note.color || 'default';
                this.state.noteType = note.type || 'text';
                this.state.checklistItems = note.items ? [...note.items] : [];

                modalTitle.textContent = 'Editar Nota';
                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content || '';
                document.getElementById('note-tags').value = (note.tags || []).join(', ');
                document.getElementById('note-dueDate').value = note.dueDate || '';
                document.getElementById('note-status').value = note.status || 'todo';

                // Set Type Radio
                const typeRadio = form.querySelector(`input[name="type"][value="${this.state.noteType}"]`);
                if (typeRadio) typeRadio.checked = true;
            }
        } else {
            // Create Mode
            this.state.editingId = null;
            this.state.selectedColor = 'default';
            this.state.noteType = 'text';
            this.state.checklistItems = [];

            modalTitle.textContent = 'Nova Nota';
            form.reset();
            // Reset Type Radio
            const typeRadio = form.querySelector('input[name="type"][value="text"]');
            if (typeRadio) typeRadio.checked = true;
        }

        this.setNoteType(this.state.noteType);
        modal.classList.remove('hidden');
        this.updateColorPickerUI();
    },

    closeModal() {
        document.getElementById('note-modal').classList.add('hidden');
        this.state.editingId = null;
        this.state.selectedColor = 'default';
        this.state.checklistItems = [];
    },

    selectColor(colorKey) {
        this.state.selectedColor = colorKey;
        this.updateColorPickerUI();
    },

    updateColorPickerUI() {
        const container = document.getElementById('note-modal');
        if (!container) return;

        const buttons = container.querySelectorAll('button[onclick^="NotesModule.selectColor"]');
        buttons.forEach(btn => {
            const colorKey = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (colorKey === this.state.selectedColor) {
                btn.classList.remove('ring-transparent');
                btn.classList.add('ring-gray-900');
                btn.classList.add('dark:ring-white');
            } else {
                btn.classList.add('ring-transparent');
                btn.classList.remove('ring-gray-900');
                btn.classList.remove('dark:ring-white');
            }
        });
    },

    saveNote(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const noteData = {
            title: formData.get('title'),
            content: formData.get('content'),
            tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
            color: this.state.selectedColor,
            type: this.state.noteType,
            items: this.state.checklistItems,
            dueDate: formData.get('dueDate'),
            status: formData.get('status')
        };

        if (this.state.editingId) {
            Store.updateNote({ ...noteData, id: this.state.editingId });
        } else {
            Store.addNote(noteData);
        }

        this.closeModal();
        router.handleRoute();
    },

    setNoteType(type) {
        this.state.noteType = type;
        const textArea = document.getElementById('text-content-area');
        const checklistArea = document.getElementById('checklist-content-area');
        const contentInput = document.getElementById('note-content');

        if (type === 'text') {
            textArea.classList.remove('hidden');
            checklistArea.classList.add('hidden');
            contentInput.setAttribute('required', 'required');
        } else {
            textArea.classList.add('hidden');
            checklistArea.classList.remove('hidden');
            contentInput.removeAttribute('required');
            this.renderChecklistItems();
        }
    },

    addChecklistItem() {
        const input = document.getElementById('new-item-input');
        const text = input.value.trim();
        if (text) {
            this.state.checklistItems.push({
                id: Date.now().toString(),
                text: text,
                completed: false
            });
            input.value = '';
            this.renderChecklistItems();
        }
    },

    removeChecklistItem(id) {
        this.state.checklistItems = this.state.checklistItems.filter(item => item.id !== id);
        this.renderChecklistItems();
    },

    renderChecklistItems() {
        const container = document.getElementById('checklist-items-container');
        if (!container) return;

        container.innerHTML = this.state.checklistItems.map(item => `
            <div class="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg group">
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">${item.text}</span>
                <button type="button" onclick="NotesModule.removeChecklistItem('${item.id}')" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    editNote(id) {
        this.openModal(id);
    },

    deleteNote(id) {
        if (confirm('Tem certeza que deseja excluir esta nota?')) {
            Store.deleteNote(id);
            router.handleRoute();
        }
    },

    togglePin(id) {
        const note = Store.getNotes().find(n => n.id === id);
        if (note) {
            Store.updateNote({ id, isPinned: !note.isPinned });
            router.handleRoute();
        }
    },

    toggleChecklistItem(noteId, itemId) {
        const note = Store.getNotes().find(n => n.id === noteId);
        if (note && note.items) {
            const item = note.items.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                Store.updateNote(note);
                router.handleRoute();
            }
        }
    }
};
