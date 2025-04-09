import { App, PluginSettingTab, Setting } from 'obsidian';
import { FolderInputSuggest } from 'obsidian-utilities';
import { Rule } from './settings-model'; // Moved Rule interface to a separate file
import { createInputField, createRuleActions } from './settings-utils'; // Utility functions

export class InboxProcessorSettingTab extends PluginSettingTab {
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

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
                        if (!this.isValidFolder(value)) {
                            console.error('Inbox folder is empty or does not exist.');
                            return;
                        }
                        this.plugin.settings.inboxFolder = value;
                        await this.plugin.saveSettings();
                    });

                new FolderInputSuggest(this.app, text.inputEl);
            });
    }

    private isValidFolder(folderPath: string): boolean {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        return folder instanceof TFolder;
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
        ['Location', 'Structure', 'Extensions', 'Pattern', 'Controls'].forEach(header => {
            table.createEl('div', { text: header, cls: 'rules-header' });
        });

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
            new FolderInputSuggest(this.app, locationInput);

            // Other columns
            createInputField(row.createEl('div', { cls: 'rules-column' }), rule.folderStructure, async (newValue) => {
                this.plugin.settings.rules[index].folderStructure = newValue;
                await this.plugin.saveSettings();
            });

            createInputField(row.createEl('div', { cls: 'rules-column' }), rule.fileExtensions, async (newValue) => {
                this.plugin.settings.rules[index].fileExtensions = newValue;
                await this.plugin.saveSettings();
            });

            createInputField(row.createEl('div', { cls: 'rules-column' }), rule.regex, async (newValue) => {
                this.plugin.settings.rules[index].regex = newValue;
                await this.plugin.saveSettings();
            });

            // Controls column
            const actionsCell = row.createEl('div', { cls: 'rules-column-actions' });
            createRuleActions(actionsCell, index, this.plugin);

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

    private addWebsiteSection(containerEl: HTMLElement) {
        const websiteDiv = containerEl.createEl('div', { cls: 'website-section' });

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
        logoImg.classList.add('logo-img');

        websiteDiv.appendChild(logoLink);

        const descriptionDiv = websiteDiv.createEl('div', { cls: 'website-description' });
        descriptionDiv.innerHTML = `
            While this plugin works on its own, it is part of a system called 
            <a href="https://jots.life" target="_blank">JOTS</a> that helps capture, organize, 
            and visualize your life's details.
        `;

        websiteDiv.appendChild(descriptionDiv);
        containerEl.appendChild(websiteDiv);
    }

    private addCoffeeSection(containerEl: HTMLElement) {
        const coffeeDiv = containerEl.createEl('div', { cls: 'buy-me-a-coffee' });

        coffeeDiv.innerHTML = `
            <a href="https://www.buymeacoffee.com/jpfieber" target="_blank">
                <img 
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                    alt="Buy Me A Coffee"
                />
            </a>
        `;

        containerEl.appendChild(coffeeDiv);
    }
}