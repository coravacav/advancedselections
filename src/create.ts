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
                      // Backwards because you're trying to find the first character
                      cb: setting.lhs,
                      direction: searchForwards,
                      modifySelection: incrementSelection,
                  }
                : {
                      errorMessage: 'Could not find backward position',
                      // Backwards because you're trying to find the first character
                      cb: setting.rhs,
                      direction: searchBackwards,
                      modifySelection: decrementSelection,
                  };

        editor.selections = editor.selections
            .map((selection) => {
                let currentPosition = selection.active;

                if (setting.findFirst) {
                    const newPos = direction(selection.active, editor.document, cb, setting, { inMovement: true });
                    if (!newPos) {
                        output.appendLine(errorMessage);
                        return undefined;
                    }

                    if (newPos.line === currentPosition.line && newPos.character === currentPosition.character) {
                        output.appendLine(errorMessage + ", didn't move");
                        return undefined;
                    }

                    currentPosition = new Position(...modifySelection(editor.document, newPos.line, newPos.character));
                    output.appendLine('newPos: ' + currentPosition.line + ', ' + currentPosition.character);
                }

                const search = searchBothWays(currentPosition, editor.document, setting);

                if (search) {
                    return new Selection(...search);
                }
            })
            .filter(Boolean);
    };
}
