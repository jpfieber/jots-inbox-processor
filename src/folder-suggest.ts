export class FolderSuggest {
    private app: App;
    private inputEl: HTMLInputElement;
    private dropdown: HTMLDivElement | null = null;
    private allFolders: string[] = [];
    private onSelect: (folder: string) => void;

    constructor(app: App, inputEl: HTMLInputElement, onSelect: (folder: string) => void) {
        this.app = app;
        this.inputEl = inputEl;
        this.onSelect = onSelect;

        this.allFolders = this.getFolders();

        this.inputEl.addEventListener('focus', () => this.showSuggestions());
        this.inputEl.addEventListener('input', () => this.updateSuggestions());
        this.inputEl.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });
    }

    private getFolders(): string[] {
        const folders: string[] = [];
        const rootFolder = this.app.vault.getRoot();
        this.collectFolders(rootFolder, folders);
        return folders;
    }

    private collectFolders(folder: TFolder, folders: string[]) {
        folders.push(folder.path);
        for (const child of folder.children) {
            if (child instanceof TFolder) {
                this.collectFolders(child, folders);
            }
        }
    }

    private showSuggestions() {
        if (this.dropdown) {
            this.dropdown.remove();
        }
    
        this.dropdown = document.createElement('div');
        this.dropdown.classList.add('suggestion-dropdown', 'dynamic');
    
        const rect = this.inputEl.getBoundingClientRect();
        this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        this.dropdown.style.left = `${rect.left + window.scrollX}px`;
        this.dropdown.style.width = `${rect.width}px`;
    
        document.body.appendChild(this.dropdown);
    
        this.updateSuggestions();
    }

    private updateSuggestions() {
        if (!this.dropdown) return;

        this.dropdown.innerHTML = '';

        const query = this.inputEl.value.toLowerCase();
        const filteredFolders = this.allFolders.filter(folder =>
            folder.toLowerCase().includes(query)
        );

        filteredFolders.forEach(folder => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item'); // Use CSS class for styling
            item.textContent = folder;

            item.addEventListener('click', () => {
                this.inputEl.value = folder;
                this.onSelect(folder);
                this.hideSuggestions();
            });

            this.dropdown.appendChild(item);
        });

        if (filteredFolders.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('no-results'); // Use CSS class for "No results" styling
            noResults.textContent = 'No results';
            this.dropdown.appendChild(noResults);
        }
    }

    private hideSuggestions() {
        if (this.dropdown) {
            this.dropdown.remove();
            this.dropdown = null;
        }
    }
}
