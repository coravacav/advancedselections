import { Position, TextDocument } from 'vscode';
import { Pair } from './getPair';
import { Type } from './create';
import { output } from './log';

export type Continue = boolean;
export type Callback = (s: string) => Continue;

export type SearchSetting = {
    lhs: Callback;
    rhs?: Callback;
    type: Type;
    blockNewlines?: boolean;
};

function decrementSelection(type: Type, doc: TextDocument, line: number, char: number): [number, number] {
    if (type === 'inner') {
        return [line, char];
    }

    if (char === 0) {
        return [line - 1, doc.lineAt(line - 1).text.length];
    }

    return [line, char - 1];
}

function incrementSelection(type: Type, doc: TextDocument, line: number, char: number): [number, number] {
    if (type === 'inner') {
        return [line, char];
    }

    if (char === doc.lineAt(line).text.length) {
        return [line + 1, 0];
    }

    return [line, char + 1];
}

export function searchBackwards(
    [pos, doc]: Pair,
    callback: Callback,
    type: Type,
    blockNewlines: boolean
): Position | undefined {
    let startPos: number | undefined = pos.character;

    for (let line = pos.line; line >= 0; line--) {
        const text = doc.lineAt(line).text;
        for (let char = startPos ?? text.length - 1; char >= 0; char--) {
            if (!callback(text[char])) {
                return new Position(...decrementSelection(type, doc, line, char + 1));
            }
        }

        startPos = undefined;

        if (!blockNewlines && !callback('\n')) {
            return new Position(...decrementSelection(type, doc, line, 0));
        }
    }
}

export function searchForwards(
    [pos, doc]: Pair,
    callback: Callback,
    type: Type,
    blockNewlines: boolean
): Position | undefined {
    let startPos: number | undefined = pos.character;

    for (let line = pos.line; line < doc.lineCount; line++) {
        const text = doc.lineAt(line).text;
        for (let char = startPos ?? 0; char < text.length; char++) {
            if (!callback(text[char])) {
                return new Position(...incrementSelection(type, doc, line, char));
            }
        }

        startPos = undefined;

        if (!blockNewlines && !callback('\n')) {
            return new Position(...incrementSelection(type, doc, line, text.length));
        }
    }
}

export function searchBothWays(
    pair: Pair,
    { lhs, rhs = lhs, type, blockNewlines = false }: SearchSetting
): [Position, Position] | undefined {
    if (!lhs(pair[1].lineAt(pair[0].line).text[pair[0].character])) {
        output.appendLine('Selection failed');
        return;
    }

    const backwards = searchBackwards(pair, lhs, type, blockNewlines);
    const forwards = searchForwards(pair, rhs, type, blockNewlines);

    output.appendLine(`Backwards: ${JSON.stringify(backwards)}`);
    output.appendLine(`Forwards: ${JSON.stringify(forwards)}`);
    output.appendLine(`Pair: ${lhs === rhs}`);

    if (backwards && forwards) {
        return [backwards, forwards];
    }
}
