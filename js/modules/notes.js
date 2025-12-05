window.NotesModule = {
    state: {
        searchQuery: '',
        editingId: null,
        selectedColor: 'default',
        noteType: 'text', // 'text' or 'checklist'
        checklistItems: [] // Array of {id, text, completed}
    },

    colors: {
        default: { bg: 'bg-white dark:bg-zenox-surface', text: 'text-gray-800 dark:text-white', accent: 'bg-gray-200 dark:bg-white/10' },
        red: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-800 dark:text-rose-100', accent: 'bg-rose-200 dark:bg-rose-500/30' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-100', accent: 'bg-orange-200 dark:bg-orange-500/30' },
        yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-100', accent: 'bg-yellow-200 dark:bg-yellow-500/30' },
        green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-100', accent: 'bg-emerald-200 dark:bg-emerald-500/30' },
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-100', accent: 'bg-blue-200 dark:bg-blue-500/30' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-100', accent: 'bg-purple-200 dark:bg-purple-500/30' },
        pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-100', accent: 'bg-pink-200 dark:bg-pink-500/30' },
    },

    render() {
        const allNotes = Store.getNotes();
        const filteredNotes = this.filterNotes(allNotes);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const todayNotes = [];
        const weekNotes = [];
        const monthNotes = [];

        filteredNotes.forEach(note => {
            if (!note.dueDate) {
                todayNotes.push(note); // No date = Today/Inbox
                return;
            }
            const noteDate = new Date(note.dueDate);
            noteDate.setHours(0, 0, 0, 0);

            if (noteDate <= today) {
                todayNotes.push(note);
            } else if (noteDate <= nextWeek) {
                weekNotes.push(note);
            } else {
                monthNotes.push(note);
            }
        });

        // Sort by date (asc)
        const dateSort = (a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        };
        todayNotes.sort(dateSort);
        weekNotes.sort(dateSort);
        monthNotes.sort(dateSort);

        return `
            <div class="animate-fade-in h-full flex flex-col gap-6">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Minhas Anotações</h2>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Organize suas tarefas por período</p>
                    </div>
                    <div class="flex gap-3">
                        <div class="relative">
                            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" 
                                value="${this.state.searchQuery}"
                                oninput="NotesModule.handleSearch(this.value)"
                                placeholder="Buscar..." 
                                class="pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zenox-surface border-none shadow-sm focus:ring-2 focus:ring-zenox-primary/20 text-sm w-64 transition-all">
                        </div>
                        <button onclick="NotesModule.openModal()" class="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pb-2">
                    
                    <!-- Today Column -->
                    <div class="flex flex-col gap-4 h-full">
                        <div class="flex items-center justify-between bg-white/50 dark:bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span class="w-2 h-2 bg-rose-500 rounded-full"></span>
                                Do Dia
                            </h3>
                            <span class="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400">${todayNotes.length}</span>
                        </div>
                        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            ${todayNotes.map(note => this.renderNoteCard(note)).join('')}
                            ${todayNotes.length === 0 ? this.renderEmptyState('Nada para hoje!') : ''}
                        </div>
                    </div>

                    <!-- Week Column -->
                    <div class="flex flex-col gap-4 h-full">
                        <div class="flex items-center justify-between bg-white/50 dark:bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span class="w-2 h-2 bg-amber-500 rounded-full"></span>
                                Da Semana
                            </h3>
                            <span class="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400">${weekNotes.length}</span>
                        </div>
                        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            ${weekNotes.map(note => this.renderNoteCard(note)).join('')}
                            ${weekNotes.length === 0 ? this.renderEmptyState('Semana tranquila.') : ''}
                        </div>
                    </div>

                    <!-- Month Column -->
                    <div class="flex flex-col gap-4 h-full">
                        <div class="flex-1 flex flex-col gap-4 min-h-0">
                            <div class="flex items-center justify-between bg-white/50 dark:bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Do Mês
                                </h3>
                                <span class="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400">${monthNotes.length}</span>
                            </div>
                            <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                ${monthNotes.map(note => this.renderNoteCard(note)).join('')}
                                ${monthNotes.length === 0 ? this.renderEmptyState('Mês livre.') : ''}
                            </div>
                        </div>

                        <!-- Specific Date Section -->
                        <div class="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                            <div class="flex items-center justify-between bg-white/50 dark:bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <i class="fa-regular fa-calendar text-purple-500"></i>
                                    Data Específica
                                </h3>
                            </div>
                            <input type="date" 
                                value="${this.state.specificDate || ''}" 
                                onchange="NotesModule.setSpecificDate(this.value)"
                                class="w-full bg-white dark:bg-zenox-surface border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none">
                            
                            <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[200px]">
                                ${this.renderSpecificDateNotes(filteredNotes)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Modal (Reused) -->
            ${this.renderModal()}
        `;
    },

    renderNoteCard(note) {
        const color = this.colors[note.color] || this.colors.default;
        const isChecklist = note.type === 'checklist';
        const dateStr = note.dueDate ? new Date(note.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';

        return `
            <div onclick="NotesModule.editNote('${note.id}')" class="${color.bg} p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group relative border border-transparent hover:border-black/5 dark:hover:border-white/10">
                
                <!-- Hover Actions -->
                <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onclick="event.stopPropagation(); NotesModule.deleteNote('${note.id}')" class="w-6 h-6 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ${color.text}">
                        <i class="fa-solid fa-trash text-[10px]"></i>
                    </button>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex flex-wrap gap-1 items-center">
                        ${dateStr ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 ${color.text} flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${dateStr}</span>` : ''}
                        ${(note.tags || []).map(tag => `
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/10 ${color.text}">${tag}</span>
                        `).join('')}
                    </div>
                    
                    <h4 class="text-lg font-bold leading-tight ${color.text}">${note.title}</h4>
                    
                    <div class="text-sm opacity-80 ${color.text}">
                         ${isChecklist ? `
                            <div class="space-y-1 mt-1">
                                ${(note.items || []).slice(0, 3).map(item => `
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full border border-current flex items-center justify-center flex-shrink-0">
                                            ${item.completed ? '<div class="w-1.5 h-1.5 rounded-full bg-current"></div>' : ''}
                                        </div>
                                        <span class="truncate ${item.completed ? 'line-through opacity-60' : ''}">${item.text}</span>
                                    </div>
                                `).join('')}
                                 ${(note.items || []).length > 3 ? `<span class="text-xs opacity-60 block pt-1">+${note.items.length - 3} itens</span>` : ''}
                            </div>
                        ` : `
                            <p class="whitespace-pre-wrap break-words line-clamp-[8]">${note.content}</p>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    renderEmptyState(message) {
        return `
            <div class="border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 text-gray-400 dark:text-gray-600">
                <i class="fa-regular fa-clipboard text-2xl opacity-50"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;
    },

    renderModal() {
        return `
            <div id="note-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white dark:bg-zenox-surface rounded-[2rem] w-full max-w-lg shadow-2xl transform scale-95 transition-transform duration-300 border border-gray-100 dark:border-white/10 overflow-hidden">
                    <form id="note-form" onsubmit="NotesModule.saveNote(event)" class="flex flex-col max-h-[90vh]">
                        <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <input type="text" name="title" id="note-title" placeholder="Título da Nota" required class="bg-transparent border-none text-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 p-0 w-full">
                            <button type="button" onclick="NotesModule.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors ml-4">
                                <i class="fa-solid fa-xmark text-2xl"></i>
                            </button>
                        </div>
                        
                        <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <!-- Type & Date -->
                            <div class="flex gap-4">
                                <div class="flex-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl flex">
                                    <label class="flex-1 text-center cursor-pointer">
                                        <input type="radio" name="type" value="text" checked onchange="NotesModule.setNoteType('text')" class="peer hidden">
                                        <span class="block py-2 rounded-lg text-sm font-bold text-gray-500 peer-checked:bg-white peer-checked:dark:bg-zenox-surface peer-checked:text-black peer-checked:dark:text-white peer-checked:shadow-sm transition-all">Texto</span>
                                    </label>
                                    <label class="flex-1 text-center cursor-pointer">
                                        <input type="radio" name="type" value="checklist" onchange="NotesModule.setNoteType('checklist')" class="peer hidden">
                                        <span class="block py-2 rounded-lg text-sm font-bold text-gray-500 peer-checked:bg-white peer-checked:dark:bg-zenox-surface peer-checked:text-black peer-checked:dark:text-white peer-checked:shadow-sm transition-all">Checklist</span>
                                    </label>
                                </div>
                                <input type="datetime-local" name="dueDate" id="note-dueDate" class="bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 text-sm text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-zenox-primary/20">
                            </div>

                            <!-- Content -->
                            <div id="text-content-area">
                                <textarea name="content" id="note-content" rows="8" placeholder="Escreva suas ideias..." class="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-zenox-primary/20 resize-none"></textarea>
                            </div>

                            <div id="checklist-content-area" class="hidden space-y-3">
                                <div class="flex gap-2">
                                    <input type="text" id="new-item-input" placeholder="Novo item..." class="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-primary/20" onkeypress="if(event.key === 'Enter') { event.preventDefault(); NotesModule.addChecklistItem(); }">
                                    <button type="button" onclick="NotesModule.addChecklistItem()" class="bg-black dark:bg-white text-white dark:text-black w-12 rounded-xl hover:opacity-80 transition-opacity">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                                <div id="checklist-items-container" class="space-y-2 max-h-48 overflow-y-auto pr-2"></div>
                            </div>

                            <!-- Tags -->
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tags</label>
                                <input type="text" name="tags" id="note-tags" placeholder="Ex: Trabalho, Importante" class="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-zenox-primary/20">
                            </div>

                            <!-- Colors -->
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Cor</label>
                                <div class="flex flex-wrap gap-3">
                                    ${Object.entries(this.colors).map(([key, value]) => `
                                        <button type="button" 
                                            onclick="NotesModule.selectColor('${key}')"
                                            class="w-8 h-8 rounded-full ${value.bg.split(' ')[0]} hover:scale-110 transition-transform ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zenox-surface ${this.state.selectedColor === key ? 'ring-gray-900 dark:ring-white' : 'ring-transparent'}">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-gray-50/50 dark:bg-white/5">
                            <button type="button" onclick="NotesModule.closeModal()" class="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-bold">Cancelar</button>
                            <button type="submit" class="px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-80 transition-opacity shadow-lg">Salvar Nota</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // ... (Keep existing helper methods: handleSearch, filterNotes, openModal, closeModal, selectColor, updateColorPickerUI, saveNote, setNoteType, addChecklistItem, removeChecklistItem, renderChecklistItems, editNote, deleteNote, togglePin, toggleChecklistItem) ...

    // Re-implementing helpers to ensure they match the new UI IDs and classes
    handleSearch(query) {
        this.state.searchQuery = query.toLowerCase();
        const container = document.getElementById('app-container');
        // Re-render only the content part if possible, but full re-render is safer for now
        container.innerHTML = this.render();
        const input = container.querySelector('input[type="text"]');
        if (input) {
            input.focus();
            input.value = query; // Ensure cursor position logic if needed
        }
    },

    filterNotes(notes) {
        if (!this.state.searchQuery) return notes;
        return notes.filter(note =>
            note.title.toLowerCase().includes(this.state.searchQuery) ||
            (note.content && note.content.toLowerCase().includes(this.state.searchQuery)) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(this.state.searchQuery)))
        );
    },

    openModal(noteId = null) {
        const modal = document.getElementById('note-modal');
        const form = document.getElementById('note-form');

        if (noteId) {
            const note = Store.getNotes().find(n => n.id === noteId);
            if (note) {
                this.state.editingId = noteId;
                this.state.selectedColor = note.color || 'default';
                this.state.noteType = note.type || 'text';
                this.state.checklistItems = note.items ? [...note.items] : [];

                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content || '';
                document.getElementById('note-tags').value = (note.tags || []).join(', ');
                document.getElementById('note-dueDate').value = note.dueDate || '';

                const typeRadio = form.querySelector(`input[name="type"][value="${this.state.noteType}"]`);
                if (typeRadio) typeRadio.checked = true;
            }
        } else {
            this.state.editingId = null;
            this.state.selectedColor = 'default';
            this.state.noteType = 'text';
            this.state.checklistItems = [];
            form.reset();
            const typeRadio = form.querySelector('input[name="type"][value="text"]');
            if (typeRadio) typeRadio.checked = true;
        }

        this.setNoteType(this.state.noteType);
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('div').classList.remove('scale-95');
            modal.querySelector('div').classList.add('scale-100');
        }, 10);
        this.updateColorPickerUI();
    },

    closeModal() {
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
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
            status: 'todo', // Default status
            updatedAt: new Date().toISOString()
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
            this.state.checklistItems.push({ id: Date.now().toString(), text: text, completed: false });
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
            <div class="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl group">
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">${item.text}</span>
                <button type="button" onclick="NotesModule.removeChecklistItem('${item.id}')" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    setSpecificDate(date) {
        this.state.specificDate = date;
        const container = document.getElementById('app-container');
        container.innerHTML = this.render();
    },

    renderSpecificDateNotes(allNotes) {
        if (!this.state.specificDate) {
            return `<div class="text-center py-4 text-xs text-gray-400">Selecione uma data</div>`;
        }

        const targetDate = new Date(this.state.specificDate);
        targetDate.setHours(0, 0, 0, 0);
        // Adjust for timezone offset if needed, but simple string comparison is safer for YYYY-MM-DD
        const targetDateStr = this.state.specificDate;

        const notes = allNotes.filter(n => {
            if (!n.dueDate) return false;
            return n.dueDate.startsWith(targetDateStr);
        });

        if (notes.length === 0) {
            return this.renderEmptyState('Nada nesta data.');
        }

        return notes.map(note => this.renderNoteCard(note)).join('');
    },

    editNote(id) {
        this.openModal(id);
    },

    deleteNote(id) {
        if (confirm('Excluir nota?')) {
            Store.deleteNote(id);
            router.handleRoute();
        }
    },

    togglePin(id) {
        // Not used in new design but kept for compatibility
    },

    toggleChecklistItem(noteId, itemId) {
        // Not used in grid view directly, but could be useful
    }
};
