import { Position, TextDocument } from 'vscode';
import { Type } from './create';
import { output } from './log';

export type Continue = boolean;

export type Context = {
    inMovement?: boolean;
};

export type Callback = (s: string, context: Context) => Continue;

export type SearchSetting = {
    lhs: Callback;
    rhs: Callback;
    init?: () => void;
    type: Type;
    ignoreNewlines?: boolean;
    findFirst?: 'backwards' | 'forwards';
};

export function decrementSelection(doc: TextDocument, line: number, char: number): [number, number] {
    if (char === 0) {
        return [line - 1, doc.lineAt(line - 1).text.length];
    }

    return [line, char - 1];
}

export function conditionallyDecrementSelection(
    type: Type,
    doc: TextDocument,
    line: number,
    char: number
): [number, number] {
    if (type === 'inner') {
        return [line, char];
    }

    return decrementSelection(doc, line, char);
}

export function incrementSelection(doc: TextDocument, line: number, char: number): [number, number] {
    if (char === doc.lineAt(line).text.length) {
        return [line + 1, 0];
    }

    return [line, char + 1];
}

export function conditionallyIncrementSelection(
    type: Type,
    doc: TextDocument,
    line: number,
    char: number
): [number, number] {
    if (type === 'inner') {
        return [line, char];
    }

    return incrementSelection(doc, line, char);
}

export function searchBackwards(
    pos: Position,
    doc: TextDocument,
    callback: Callback,
    { type, ignoreNewlines = false }: Pick<SearchSetting, 'type' | 'ignoreNewlines'>,
    context: Context
): Position | undefined {
    let startPos: number | undefined = pos.character;

    for (let line = pos.line; line >= 0; line--) {
        const text = doc.lineAt(line).text;
        for (let char = startPos ?? text.length - 1; char >= 0; char--) {
            if (!callback(text[char], context)) {
                return new Position(...conditionallyDecrementSelection(type, doc, line, char + 1));
            }
        }

        startPos = undefined;

        if (!ignoreNewlines && !callback('\n', context)) {
            return new Position(...conditionallyDecrementSelection(type, doc, line, 0));
        }
    }
}

export function searchForwards(
    pos: Position,
    doc: TextDocument,
    callback: Callback,
    { type, ignoreNewlines = false }: Pick<SearchSetting, 'type' | 'ignoreNewlines'>,
    context: Context
): Position | undefined {
    let startPos: number | undefined = pos.character;

    for (let line = pos.line; line < doc.lineCount; line++) {
        const text = doc.lineAt(line).text;
        for (let char = startPos ?? 0; char < text.length; char++) {
            if (!callback(text[char], context)) {
                return new Position(...conditionallyIncrementSelection(type, doc, line, char));
            }
        }

        startPos = undefined;

        if (!ignoreNewlines && !callback('\n', context)) {
            return new Position(...conditionallyIncrementSelection(type, doc, line, text.length));
        }
    }
}

export function searchBothWays(
    pos: Position,
    doc: TextDocument,
    { lhs, rhs, init, ...rest }: SearchSetting
): [Position, Position] | undefined {
    if (!lhs(doc.lineAt(pos.line).text[pos.character], {})) {
        output.appendLine('Selection failed');
        return;
    }

    // Reset some state
    init?.();

    const backwards = searchBackwards(pos, doc, lhs, rest, {});

    if (!backwards) {
        return;
    }

    const forwards = searchForwards(backwards, doc, rhs, rest, {});

    if (forwards) {
        return [backwards, forwards];
    }
}
