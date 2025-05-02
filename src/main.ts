import { Plugin, TFile, TFolder, TAbstractFile } from 'obsidian';
import { InboxProcessorSettings, Rule, DEFAULT_SETTINGS } from './settings-model.js';
import { InboxProcessorSettingTab } from './settings.js';

class InboxProcessorPlugin extends Plugin {
    settings!: InboxProcessorSettings;  // Use definite assignment assertion
    private interval: number | undefined;

    async onload() {
        console.log('Inbox Processor: Loading plugin');
        await this.loadSettings();

        this.addSettingTab(new InboxProcessorSettingTab(this.app, this));

        const interval = this.getInterval();
        if (interval !== null) {
            this.interval = window.setTimeout(() => this.processInbox(), interval);
        }

        this.addCommand({
            id: 'process-inbox-manually',
            name: 'Process inbox manually',
            callback: () => this.processInbox()
        });
    }

    onunload() {
        console.log('Inbox Processor: Unloading plugin');
        if (this.interval) {
            window.clearTimeout(this.interval);
        }
    }

    getInterval() {
        return this.settings.interval !== null ? this.settings.interval * 1000 : null;
    }

    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async processInbox() {
        const inboxFolder = this.settings.inboxFolder;

        try {
            const folder = this.app.vault.getAbstractFileByPath(inboxFolder);
            if (folder instanceof TFolder) {
                for (const child of folder.children) {
                    if (child instanceof TFile) {
                        const file = child;  // Create typed reference
                        for (const rule of this.settings.rules) {
                            // Create a case-insensitive regex for file extensions
                            const extensionsRegex = new RegExp(`\\.(${rule.fileExtensions})$`, 'i');
                            // Automatically append ".*" to the user-provided regex if it's not blank
                            const nameRegex = rule.regex ? new RegExp(`${rule.regex}.*`, 'i') : null;

                            // Check if the file matches the extension and (if provided) the name pattern
                            if (extensionsRegex.test(file.name) && (!nameRegex || nameRegex.test(file.name.replace(/\.[^/.]+$/, '')))) {
                                // Convert file extension to lowercase if the setting is enabled
                                if (this.settings.convertExtensionsToLowercase && file.parent) {
                                    const newFileName = file.name.replace(/\.[^/.]+$/, ext => ext.toLowerCase());
                                    if (newFileName !== file.name) {
                                        const newPath = `${file.parent.path}/${newFileName}`;
                                        await this.app.vault.rename(file, newPath);
                                        const newFile = this.app.vault.getAbstractFileByPath(newPath);
                                        if (newFile instanceof TFile) {
                                            await this.processFile(newFile, rule);
                                        } else {
                                            console.error(`Failed to update file reference after rename: ${newPath} is not a file`);
                                            return;
                                        }
                                    } else {
                                        await this.processFile(file, rule);
                                    }
                                } else {
                                    await this.processFile(file, rule);
                                }
                                break; // Stop processing this file after the first matching rule
                            }
                        }
                    }
                }
            } else {
                console.log("Inbox folder is empty or does not exist.");
            }
        } catch (error) {
            console.error("Error processing inbox:", error);
        }

        // Set up the next interval after processing is complete
        const interval = this.getInterval();
        if (interval !== null) {
            this.interval = window.setTimeout(() => this.processInbox(), interval);
        }
    }

    private async processFile(file: TFile, rule: Rule) {
        await this.moveFile(file, rule.rootFolder, rule.folderStructure, rule.regex);
    }

    private async moveFile(file: TFile, rootFolder: string, folderStructure: string, regex: string) {
        if (!folderStructure) {
            // If folder structure is blank, move the file directly to the root folder
            const targetFilePath = `${rootFolder}/${file.name}`;
            const fileExists = await this.app.vault.adapter.exists(targetFilePath);

            if (fileExists) {
                console.log(`File already exists at "${targetFilePath}"`);
            } else {
                await this.app.vault.rename(file, targetFilePath);
                console.log(`"${file.name}" moved to "${rootFolder}"`);
            }
            return;
        }

        const date = this.extractDateFromFileName(file.name, regex);
        if (!date) {
            console.error(`Could not extract date from filename: ${file.name}`);
            return;
        }

        const year = date.getFullYear();
        const shortYear = year.toString().slice(-2);
        const month = date.getMonth() + 1;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let formattedMonth;
        if (folderStructure.includes('MMMM')) {
            formattedMonth = monthNames[month - 1];
        } else if (folderStructure.includes('MMM')) {
            formattedMonth = monthAbbr[month - 1];
        } else if (folderStructure.includes('MM')) {
            formattedMonth = month.toString().padStart(2, '0');
        } else {
            formattedMonth = month.toString();
        }

        let formattedYear = folderStructure.includes('YYYY') ? year.toString() : shortYear;

        const targetPath = `${rootFolder}/${folderStructure.replace(/YYYY/g, formattedYear).replace(/YY/g, shortYear).replace(/M{1,4}/, formattedMonth)}`;

        const folderExists = this.app.vault.getAbstractFileByPath(targetPath);
        if (!folderExists || !(folderExists instanceof TFolder)) {
            await this.app.vault.createFolder(targetPath);
        }

        const targetFilePath = `${targetPath}/${file.name}`;
        const fileExists = await this.app.vault.adapter.exists(targetFilePath);

        if (fileExists) {
            console.log(`File already exists at "${targetFilePath}"`);
        } else {
            await this.app.vault.rename(file, targetFilePath);
            console.log(`"${file.name}" moved to "${targetPath}"`);
        }
    }

    extractDateFromFileName(fileName: string, regex: string): Date | null {
        const match = fileName.match(regex);
        if (match) {
            const dateString = match[0].split(' ')[0];
            const year = parseInt(dateString.substring(0, 4), 10);
            const month = parseInt(dateString.substring(4, 6), 10) - 1;
            const day = parseInt(dateString.substring(6, 8), 10);
            return new Date(year, month, day);
        }
        return null;
    }
}

export default InboxProcessorPlugin;