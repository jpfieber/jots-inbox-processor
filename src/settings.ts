import { App, PluginSettingTab, Setting, TFolder } from 'obsidian';

// FolderSuggest class for folder suggestions
class FolderSuggest {
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
        this.dropdown.classList.add('suggestion-dropdown');
        // Removed inline styles for dropdown and added CSS class

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
            item.classList.add('suggestion-item');
            // Removed inline styles for suggestion items and added CSS class
            item.textContent = folder; // Set the folder name as the text content of the suggestion item

            item.addEventListener('click', () => {
                this.inputEl.value = folder;
                this.onSelect(folder);
                this.hideSuggestions();
            });

            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = '#f0f0f0';
            });

            item.addEventListener('mouseout', () => {
                item.style.backgroundColor = 'white';
            });

            this.dropdown.appendChild(item);
        });

        if (filteredFolders.length === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = 'No results';
            noResults.style.padding = '5px';
            noResults.style.color = '#888';
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

export interface Rule {
    regex: string;
    fileExtensions: string;
    rootFolder: string;
    folderStructure: string;
}

export interface InboxProcessorSettings {
    inboxFolder: string;
    interval: number | null;
    convertExtensionsToLowercase: boolean;
    rules: Rule[];
}

export const DEFAULT_SETTINGS: InboxProcessorSettings = {
    inboxFolder: "_Inbox",
    interval: null,
    convertExtensionsToLowercase: false,
    rules: [
        {
            regex: '',
            fileExtensions: '',
            rootFolder: '',
            folderStructure: 'YYYY/YYYY-MM',
        },
    ],
};

export class InboxProcessorSettingTab extends PluginSettingTab {
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Inbox Processor Settings' });

        this.addInboxFolderSetting(containerEl);
        this.addIntervalSetting(containerEl);
        this.addConvertExtensionsSetting(containerEl);

        containerEl.createEl('h3', { text: 'Rules' });
        this.addRulesTable(containerEl);

        containerEl.createEl('hr');
        this.addWebsiteSection(containerEl);
        this.addCoffeeSection(containerEl);
    }

    private addInboxFolderSetting(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName('Inbox Folder')
            .setDesc('Set the location of the inbox folder.')
            .addText(text => {
                text.setPlaceholder('Enter folder name')
                    .setValue(this.plugin.settings.inboxFolder || '_Inbox')
                    .onChange(async (value) => {
                        this.plugin.settings.inboxFolder = value;
                        await this.plugin.saveSettings();
                    });

                new FolderSuggest(this.app, text.inputEl, async (folder) => {
                    this.plugin.settings.inboxFolder = folder;
                    await this.plugin.saveSettings();
                });
            });
    }

    private addIntervalSetting(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName('Interval (seconds)')
            .setDesc('Set the interval for processing the inbox folder. Leave empty to disable automatic processing.')
            .addText(text => text
                .setPlaceholder('Enter interval in seconds')
                .setValue(this.plugin.settings.interval ? this.plugin.settings.interval.toString() : '')
                .onChange(async (value) => {
                    this.plugin.settings.interval = value ? parseInt(value) : null;
                    await this.plugin.saveSettings();
                }));
    }

    private addConvertExtensionsSetting(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName('Convert Extensions to Lowercase')
            .setDesc('Enable this to convert uppercase file extensions to lowercase.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.convertExtensionsToLowercase)
                .onChange(async (value) => {
                    this.plugin.settings.convertExtensionsToLowercase = value;
                    await this.plugin.saveSettings();
                }));
    }

    private addRulesTable(containerEl: HTMLElement) {
        const table = containerEl.createEl('div', { cls: 'rules-table' });

        // Header row
        table.createEl('div', { text: 'Location', cls: 'rules-header' });
        table.createEl('div', { text: 'Structure', cls: 'rules-header' });
        table.createEl('div', { text: 'Extensions', cls: 'rules-header' });
        table.createEl('div', { text: 'Pattern', cls: 'rules-header' });
        table.createEl('div', { text: 'Controls', cls: 'rules-header' });

        // Data rows
        this.plugin.settings.rules.forEach((rule: Rule, index: number) => {
            const row = table.createEl('div', { cls: 'rules-row' });

            // Location column with folder suggestion
            const locationCell = row.createEl('div', { cls: 'rules-column' });
            const locationInput = locationCell.createEl('input', { type: 'text', value: rule.rootFolder });
            locationInput.onchange = async () => {
                this.plugin.settings.rules[index].rootFolder = locationInput.value;
                await this.plugin.saveSettings();
            };
            new FolderSuggest(this.app, locationInput, async (folder) => {
                this.plugin.settings.rules[index].rootFolder = folder;
                await this.plugin.saveSettings();
            });

            // Structure column
            const structureCell = row.createEl('div', { cls: 'rules-column' });
            this.createInputField(structureCell, rule.folderStructure, async (newValue) => {
                this.plugin.settings.rules[index].folderStructure = newValue;
                await this.plugin.saveSettings();
            });

            // Extensions column
            const extensionsCell = row.createEl('div', { cls: 'rules-column' });
            this.createInputField(extensionsCell, rule.fileExtensions, async (newValue) => {
                this.plugin.settings.rules[index].fileExtensions = newValue;
                await this.plugin.saveSettings();
            });

            // Pattern column
            const patternCell = row.createEl('div', { cls: 'rules-column' });
            this.createInputField(patternCell, rule.regex, async (newValue) => {
                this.plugin.settings.rules[index].regex = newValue;
                await this.plugin.saveSettings();
            });

            // Controls column
            const actionsCell = row.createEl('div', { cls: 'rules-column-actions' });
            this.createRuleActions(actionsCell, index);

            table.appendChild(row);
        });

        // Add Rule button
        const addRuleButton = containerEl.createEl('button', { text: 'Add Rule', cls: 'rules-add-button' });
        addRuleButton.onclick = async () => {
            this.plugin.settings.rules.push({ regex: '', fileExtensions: '', rootFolder: '', folderStructure: '' });
            await this.plugin.saveSettings();
            this.display();
        };
    }

    private createRuleRow(table: HTMLElement, rule: Rule, index: number) {
        const row = table.createEl('div', { cls: 'rules-row' });

        const locationCell = row.createEl('div', { cls: 'rules-column' });
        const locationInput = locationCell.createEl('input', { type: 'text', value: rule.rootFolder });
        locationInput.onchange = async () => {
            this.plugin.settings.rules[index].rootFolder = locationInput.value;
            await this.plugin.saveSettings();
        };
        new FolderSuggest(this.app, locationInput, async (folder) => {
            this.plugin.settings.rules[index].rootFolder = folder;
            await this.plugin.saveSettings();
        });

        const folderStructureCell = row.createEl('div', { cls: 'rules-column' });
        this.createInputField(folderStructureCell, rule.folderStructure, async (newValue) => {
            this.plugin.settings.rules[index].folderStructure = newValue;
            await this.plugin.saveSettings();
        });

        const extensionsCell = row.createEl('div', { cls: 'rules-column' });
        this.createInputField(extensionsCell, rule.fileExtensions, async (newValue) => {
            this.plugin.settings.rules[index].fileExtensions = newValue;
            await this.plugin.saveSettings();
        });

        const regexCell = row.createEl('div', { cls: 'rules-column' });
        this.createInputField(regexCell, rule.regex, async (newValue) => {
            this.plugin.settings.rules[index].regex = newValue;
            await this.plugin.saveSettings();
        });

        const actionsCell = row.createEl('div', { cls: 'rules-column-actions' });
        this.createRuleActions(actionsCell, index);

        table.appendChild(row);
    }

    private createInputField(container: HTMLElement, value: string, onChange: (newValue: string) => Promise<void>) {
        const input = container.createEl('input', { type: 'text', value });
        input.onchange = async () => {
            await onChange(input.value);
        };
    }

    private createRuleActions(container: HTMLElement, index: number) {
        const moveUpButton = container.createEl('button', { text: '↑', cls: 'rules-button' });
        moveUpButton.onclick = async () => {
            if (index > 0) {
                const temp = this.plugin.settings.rules[index];
                this.plugin.settings.rules[index] = this.plugin.settings.rules[index - 1];
                this.plugin.settings.rules[index - 1] = temp;
                await this.plugin.saveSettings();
                this.display();
            }
        };

        const moveDownButton = container.createEl('button', { text: '↓', cls: 'rules-button' });
        moveDownButton.onclick = async () => {
            if (index < this.plugin.settings.rules.length - 1) {
                const temp = this.plugin.settings.rules[index];
                this.plugin.settings.rules[index] = this.plugin.settings.rules[index + 1];
                this.plugin.settings.rules[index + 1] = temp;
                await this.plugin.saveSettings();
                this.display();
            }
        };

        const deleteButton = container.createEl('button', { cls: 'rules-button' });
        deleteButton.innerHTML = '🗑️';
        deleteButton.onclick = async () => {
            this.plugin.settings.rules.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
        };
    }

    private addWebsiteSection(containerEl: HTMLElement) {
        const websiteDiv = containerEl.createEl('div', { cls: 'website-section' });
        websiteDiv.style.display = 'flex';
        websiteDiv.style.alignItems = 'center';
        websiteDiv.style.marginTop = '20px';
        websiteDiv.style.marginBottom = '20px';
        websiteDiv.style.padding = '0.5rem';
        websiteDiv.style.opacity = '0.75';

        const logoLink = websiteDiv.createEl('a', {
            href: 'https://jots.life',
            target: '_blank',
        });
        const logoImg = logoLink.createEl('img', {
            attr: {
                src: 'https://jots.life/jots-logo-512/',
                alt: 'JOTS Logo',
            },
        });
        logoImg.style.width = '64px';
        logoImg.style.height = '64px';
        logoImg.style.marginRight = '15px';

        websiteDiv.appendChild(logoLink);

        const descriptionDiv = websiteDiv.createEl('div', { cls: 'website-description' });
        descriptionDiv.innerHTML = `
            While this plugin works on its own, it is part of a system called 
            <a href="https://jots.life" target="_blank">JOTS</a> that helps capture, organize, 
            and visualize your life's details.
        `;
        descriptionDiv.style.fontSize = '14px';
        descriptionDiv.style.lineHeight = '1.5';
        descriptionDiv.style.color = '#555';

        websiteDiv.appendChild(descriptionDiv);
        containerEl.appendChild(websiteDiv);
    }

    private addCoffeeSection(containerEl: HTMLElement) {
        const coffeeDiv = containerEl.createEl('div', { cls: 'buy-me-a-coffee' });
        coffeeDiv.style.marginTop = '20px';
        coffeeDiv.style.textAlign = 'center';

        coffeeDiv.innerHTML = `
            <a href="https://www.buymeacoffee.com/jpfieber" target="_blank">
                <img 
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                    alt="Buy Me A Coffee" 
                    style="height: 60px; width: 217px;"
                />
            </a>
        `;

        containerEl.appendChild(coffeeDiv);
    }
}