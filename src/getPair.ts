import { Position, Selection, TextDocument, TextEditor } from 'vscode';

export type Pair = [Position, TextDocument];

export function getPair(editor: TextEditor, selection: Selection): Pair {
    return [selection.active, editor.document];
}
