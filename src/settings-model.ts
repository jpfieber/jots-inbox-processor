export const DEFAULT_SETTINGS: InboxProcessorSettings = {
    inboxFolder: "",
    interval: null,
    convertExtensionsToLowercase: false,
    rules: [
        {
            regex: '',
            fileExtensions: '',
            rootFolder: '',
            folderStructure: '',
        },
    ],
};

export interface InboxProcessorSettings {
    inboxFolder: string;
    interval: number | null;
    convertExtensionsToLowercase: boolean;
    rules: Rule[];
}

export interface Rule {
    regex: string;
    fileExtensions: string;
    rootFolder: string;
    folderStructure: string;
}