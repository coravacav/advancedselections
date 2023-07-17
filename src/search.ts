import { Position, TextDocument } from 'vscode';
import { Type } from './create';
import { output } from './log';

export type Continue = boolean;

export type Context = {
    inMovement?: boolean;
    type?: Type;
    direction?: 'backwards' | 'forwards';
    pos?: Position;
    doc?: TextDocument;
};

export type Callback = (s: string, context: Context) => Continue;

export type SearchSetting = {
    lhs: Callback;
    rhs: Callback;
    init?: (context: Context) => void;
    postBackwards?: (context: Context) => void;
    postForwards?: (context: Context) => void;
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

    if (!callback('START', context)) {
        return new Position(0, 0);
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

    if (!callback('END', context)) {
        return new Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
    }
}

export function searchBothWays(
    pos: Position,
    doc: TextDocument,
    { lhs, rhs, init, postBackwards, postForwards, ...rest }: SearchSetting
): [Position, Position] | undefined {
    if (!lhs(doc.lineAt(pos.line).text[pos.character], {})) {
        output.appendLine('Selection failed');
        return;
    }

    // Reset some state
    init?.({ type: rest.type, pos, doc });

    const backwards = searchBackwards(pos, doc, lhs, rest, { direction: 'backwards' });

    if (!backwards) {
        return;
    }

    const newBackwards = postBackwards?.({ pos: backwards, doc }) ?? backwards;

    const forwards = searchForwards(newBackwards, doc, rhs, rest, { direction: 'forwards' });

    if (!forwards) {
        return;
    }

    const newForwards = postForwards?.({ pos: forwards, doc }) ?? forwards;

    return [newBackwards, newForwards];
}
