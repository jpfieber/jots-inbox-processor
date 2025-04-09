import { FuzzyMatch, TFolder } from "obsidian";
import { FuzzyInputSuggest } from "./suggester";
export declare class FolderInputSuggest extends FuzzyInputSuggest<TFolder> {
    getItemText(item: TFolder): string;
    renderNote(noteEL: HTMLElement, result: FuzzyMatch<TFolder>): void;
    renderTitle(titleEl: HTMLElement, result: FuzzyMatch<TFolder>): void;
}
//# sourceMappingURL=folder.d.ts.map