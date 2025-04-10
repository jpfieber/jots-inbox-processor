export function createInputField(container: HTMLElement, value: string, onChange: (newValue: string) => Promise<void>) {
    const input = container.createEl('input', { type: 'text', value });
    input.onchange = async () => {
        await onChange(input.value);
    };
}

export function createRuleActions(container: HTMLElement, index: number, plugin: any) {
    const moveUpButton = container.createEl('button', { text: '↑', cls: 'rules-button' });
    moveUpButton.onclick = async () => {
        if (index > 0) {
            const temp = plugin.settings.rules[index];
            plugin.settings.rules[index] = plugin.settings.rules[index - 1];
            plugin.settings.rules[index - 1] = temp;
            await plugin.saveSettings();
            plugin.display();
        }
    };

    const moveDownButton = container.createEl('button', { text: '↓', cls: 'rules-button' });
    moveDownButton.onclick = async () => {
        if (index < plugin.settings.rules.length - 1) {
            const temp = plugin.settings.rules[index];
            plugin.settings.rules[index] = plugin.settings.rules[index + 1];
            plugin.settings.rules[index + 1] = temp;
            await plugin.saveSettings();
            plugin.display();
        }
    };

    const deleteButton = container.createEl('button', { text: '🗑️', cls: 'rules-button' });
    deleteButton.onclick = async () => {
        plugin.settings.rules.splice(index, 1);
        await plugin.saveSettings();
        plugin.display();
    };
}