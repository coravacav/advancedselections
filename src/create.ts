import { Position, Selection, window } from 'vscode';
import {
    SearchSetting,
    decrementSelection,
    incrementSelection,
    searchBackwards,
    searchBothWays,
    searchForwards,
} from './search';
import { output } from './log';

export type Type = 'inner' | 'outer';

export function create(setting: SearchSetting) {
    return function () {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

        const { errorMessage, cb, direction, modifySelection } =
            setting.findFirst === 'forwards'
                ? {
                      errorMessage: 'Could not find forward position',
                      cb: setting.lhs,
                      direction: searchForwards,
                      modifySelection: incrementSelection,
                  }
                : {
                      errorMessage: 'Could not find backward position',
                      cb: setting.rhs,
                      direction: searchBackwards,
                      modifySelection: decrementSelection,
                  };

        editor.selections = editor.selections
            .map((selection) => {
                let currentPosition = selection.active;

                if (setting.findFirst) {
                    const newPos = direction(selection.active, editor.document, cb, setting);
                    if (!newPos) {
                        output.appendLine(errorMessage);
                        return undefined;
                    }

                    currentPosition = new Position(...modifySelection(editor.document, newPos.line, newPos.character));
                }

                const search = searchBothWays(currentPosition, editor.document, setting);

                if (search) {
                    return new Selection(...search);
                }
            })
            .filter(Boolean);
    };
}
