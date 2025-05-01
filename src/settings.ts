import { App, PluginSettingTab, Setting } from 'obsidian';
import { FolderSuggest } from './foldersuggester';

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

        // Inbox folder setting
        new Setting(containerEl)
            .setName('Inbox folder')
            .setDesc('Set the location of the inbox folder.')
            .addSearch((cb) => {
                new FolderSuggest(this.app, cb.inputEl);
                cb.setPlaceholder("Example: _Inbox")
                    .setValue(this.plugin.settings.inboxFolder || '_Inbox')
                    .onChange(async (new_folder) => {
                        new_folder = new_folder.trim().replace(/\/$/, "");
                        this.plugin.settings.inboxFolder = new_folder;
                        await this.plugin.saveSettings();
                    });
            });

        // Interval setting
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

        // Convert extensions setting
        new Setting(containerEl)
            .setName('Convert extensions to lowercase')
            .setDesc('Enable this to convert uppercase file extensions to lowercase.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.convertExtensionsToLowercase)
                .onChange(async (value) => {
                    this.plugin.settings.convertExtensionsToLowercase = value;
                    await this.plugin.saveSettings();
                }));

        // Rules section
        new Setting(containerEl).setName('Rules').setHeading();
        this.addRulesTable(containerEl);

        // Support section
        new Setting(containerEl).setName('Support').setHeading();
        this.addWebsiteSection(containerEl);
        this.addCoffeeSection(containerEl);
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
            new Setting(locationCell)
                .addSearch((cb) => {
                    new FolderSuggest(this.app, cb.inputEl);
                    cb.setPlaceholder("Enter folder path")
                        .setValue(rule.rootFolder)
                        .onChange(async (new_folder) => {
                            new_folder = new_folder.trim().replace(/\/$/, "");
                            this.plugin.settings.rules[index].rootFolder = new_folder;
                            await this.plugin.saveSettings();
                        });
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
        });

        // Add Rule button
        const addRuleButton = containerEl.createEl('button', { text: 'Add rule', cls: 'rules-add-button' });
        addRuleButton.onclick = async () => {
            this.plugin.settings.rules.push({ regex: '', fileExtensions: '', rootFolder: '', folderStructure: '' });
            await this.plugin.saveSettings();
            this.display();
        };
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

        const deleteButton = container.createEl('button', { text: '🗑️', cls: 'rules-button' });
        deleteButton.onclick = async () => {
            this.plugin.settings.rules.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
        };
    }

    private addWebsiteSection(containerEl: HTMLElement) {
        const websiteDiv = containerEl.createEl('div', { cls: 'website-section' });

        const logoLink = websiteDiv.createEl('a', { href: 'https://jots.life' });
        logoLink.setAttribute('target', '_blank');

        logoLink.createEl('img', {
            attr: {
                src: 'assets/jots-logo.png',
                alt: 'JOTS Logo',
            },
        });

        const descriptionDiv = websiteDiv.createEl('div', { cls: 'website-description' });

        descriptionDiv.appendText('While this plugin works on its own, it is part of a system called ');
        const jotsLink = descriptionDiv.createEl('a', {
            text: 'JOTS',
            href: 'https://jots.life'
        });
        jotsLink.setAttribute('target', '_blank');
        descriptionDiv.appendText(' that helps capture, organize, and visualize your life\'s details.');
    }

    private addCoffeeSection(containerEl: HTMLElement) {
        const coffeeDiv = containerEl.createEl('div', { cls: 'buy-me-a-coffee' });

        const coffeeLink = coffeeDiv.createEl('a', {
            href: 'https://www.buymeacoffee.com/jpfieber'
        });
        coffeeLink.setAttribute('target', '_blank');

        coffeeLink.createEl('img', {
            attr: {
                src: 'assets/bmc-button.png',
                alt: 'Buy Me A Coffee'
            },
            cls: 'bmc-button'
        });
    }
}