import { Selection, window } from 'vscode';
import { SearchSetting, searchBothWays } from './search';
import { getPair } from './getPair';

export type Type = 'inner' | 'outer';

export function create(setting: SearchSetting) {
    return function () {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.selections = editor.selections
            .map((selection) => {
                const search = searchBothWays(getPair(editor, selection), setting);

                if (search) {
                    return new Selection(...search);
                }
            })
            .filter(Boolean);
    };
}
