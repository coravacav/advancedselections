import { Position } from 'vscode';
import { Pair } from './getPair';
import { output } from './log';

export type Continue = boolean;
export type Callback = (s: string) => Continue;

export function searchBackwards([pos, doc]: Pair, callback: Callback): Position | undefined {
    for (let line = pos.line; line >= 0; line--) {
        const text = doc.lineAt(line).text;
        for (let char = pos.character; char >= 0; char--) {
            output.appendLine(JSON.stringify(text[char]));
            const result = callback(text[char]);
            if (!result) {
                return new Position(line, char + 1);
            }
        }

        const result = callback('\n');
        if (!result) {
            return new Position(line, 0);
        }
    }
}

export function searchForwards([pos, doc]: Pair, callback: Callback): Position | undefined {
    for (let line = pos.line; line < doc.lineCount; line++) {
        const text = doc.lineAt(line).text;
        for (let char = pos.character; char < text.length; char++) {
            output.appendLine(JSON.stringify(text[char]));
            const result = callback(text[char]);
            if (!result) {
                return new Position(line, char);
            }
        }

        const result = callback('\n');
        if (!result) {
            return new Position(line, text.length);
        }
    }
}

export function searchBothWays(pair: Pair, callback: Callback): [Position, Position] | undefined {
    if (!callback(pair[1].lineAt(pair[0].line).text[pair[0].character])) {
        return;
    }

    const backwards = searchBackwards(pair, callback);
    const forwards = searchForwards(pair, callback);

    if (backwards && forwards) {
        return [backwards, forwards];
    }
}

// export function findThenSearch(pair: Pair, callback: Callback): [Position, Position] | undefined {
//     const backwards = searchBackwards(pair, callback);
//     const forwards = searchForwards(pair, callback);

//     if (backwards && forwards) {
//         return [backwards, forwards];
//     }
// }
