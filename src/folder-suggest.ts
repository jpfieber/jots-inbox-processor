import { App, TFolder } from 'obsidian';

export class FolderSuggest {
    private app: App;
    private inputEl: HTMLInputElement;
    private dropdown: HTMLDivElement | null = null;
    private allFolders: string[] = [];
    private onSelect: (folder: string) => void;
    private dropdownContent: HTMLDivElement | null = null;

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

        // Create a container for position context
        this.dropdown = document.createElement('div');
        this.dropdown.classList.add('suggestion-container');

        // Create the actual dropdown
        this.dropdownContent = document.createElement('div');
        this.dropdownContent.classList.add('suggestion-dropdown');

        const rect = this.inputEl.getBoundingClientRect();
        this.dropdownContent.style.top = `${rect.bottom + window.scrollY}px`;
        this.dropdownContent.style.left = `${rect.left + window.scrollX}px`;
        this.dropdownContent.style.width = `${rect.width}px`;

        this.dropdown.appendChild(this.dropdownContent);
        document.body.appendChild(this.dropdown);

        this.updateSuggestions();
    }

    private updateSuggestions() {
        if (!this.dropdown || !this.dropdownContent) return;

        this.dropdownContent.innerHTML = '';

        const query = this.inputEl.value.toLowerCase();
        const filteredFolders = this.allFolders.filter(folder =>
            folder.toLowerCase().includes(query)
        );

        if (filteredFolders.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('suggestion-item');
            noResults.textContent = 'No results';
            this.dropdownContent.appendChild(noResults);
            return;
        }

        filteredFolders.forEach(folder => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = folder;

            item.addEventListener('click', () => {
                this.inputEl.value = folder;
                this.onSelect(folder);
                this.hideSuggestions();
            });

            if (this.dropdownContent) {
                this.dropdownContent.appendChild(item);
            }
        });
    }

    private hideSuggestions() {
        if (this.dropdown) {
            this.dropdown.remove();
            this.dropdown = null;
        }
    }
}
