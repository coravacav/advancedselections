// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { alphaNumeric } from './regexes';
import { output, registerOutput } from './log';
import { create } from './create';
import { Context, SearchSetting, decrementSelection, incrementSelection } from './search';
import { ExtensionContext, Position, commands } from 'vscode';

// Add new binding
function anb(
    ctx: ExtensionContext,
    name: string,
    setting: Omit<SearchSetting, 'type' | 'rhs'> & { rhs?: SearchSetting['rhs'] }
) {
    const add = (action: string, settings: Omit<SearchSetting, 'lhs' | 'rhs'>) => {
        ctx.subscriptions.push(
            commands.registerCommand(
                'advancedselections.' + action + name,
                create({ rhs: setting.lhs, ...setting, ...settings })
            )
        );
    };

    add('selectInner', { type: 'inner' });
    add('selectOuter', { type: 'outer' });
    add('forwardsSelectInner', { type: 'inner', findFirst: 'forwards' });
    add('forwardsSelectOuter', { type: 'outer', findFirst: 'forwards' });
    add('backwardsSelectInner', { type: 'inner', findFirst: 'backwards' });
    add('backwardsSelectOuter', { type: 'outer', findFirst: 'backwards' });
}

export function activate(ctx: ExtensionContext) {
    registerOutput();

    anb(ctx, 'Word', { lhs: (c) => Boolean(c.match(alphaNumeric)) });
    anb(ctx, 'DoubleQuote', { lhs: (c) => c !== '"' });
    anb(ctx, 'SingleQuote', { lhs: (c) => c !== "'" });
    anb(ctx, 'Backtick', { lhs: (c) => c !== '`', ignoreNewlines: true });

    let some = 0;

    const matchingPairsInit = (context: Context) => {
        some = context.type === 'outer' ? -1 : 0;
    };

    anb(ctx, 'Parenthesis', {
        lhs: (c) => c !== '(',
        rhs: (c) => {
            if (c === '(') {
                some++;
            } else if (c === ')') {
                some--;
            }

            return some >= 0;
        },
        init: matchingPairsInit,
        ignoreNewlines: true,
    });

    anb(ctx, 'CurlyBrace', {
        lhs: (c) => c !== '{',
        rhs: (c) => {
            if (c === '{') {
                some++;
            } else if (c === '}') {
                some--;
            }

            return some >= 0;
        },
        init: matchingPairsInit,
        ignoreNewlines: true,
    });
    anb(ctx, 'SquareBracket', {
        lhs: (c) => c !== '[',
        rhs: (c) => {
            if (c === '[') {
                some++;
            } else if (c === ']') {
                some--;
            }

            return some >= 0;
        },
        init: matchingPairsInit,
        ignoreNewlines: true,
    });
    anb(ctx, 'AngleBracket', {
        lhs: (c) => c !== '<',
        rhs: (c) => {
            if (c === '<') {
                some++;
            } else if (c === '>') {
                some--;
            }

            return some >= 0;
        },
        init: matchingPairsInit,
        ignoreNewlines: true,
    });

    let otherPair: [string, string];

    const lhsPairs = ['{', '[', '<', '('];
    const rhsPairs = ['}', ']', '>', ')'];
    anb(ctx, 'MatchingPair', {
        lhs: (c) => {
            const ret = !lhsPairs.includes(c);
            if (!ret) {
                otherPair = [c, rhsPairs[lhsPairs.indexOf(c)]];
                return false;
            }
            return true;
        },
        rhs: (c) => {
            if (c === otherPair[0]) {
                some++;
            } else if (c === otherPair[1]) {
                some--;
            }

            return some >= 0;
        },
        init: matchingPairsInit,
        ignoreNewlines: true,
    });

    let consecutiveNewlines = 0;
    let hitStart = false;
    let hitEnd = false;

    anb(ctx, 'Paragraph', {
        lhs: (c, { direction }) => {
            direction === 'forwards' && output.appendLine('lhs: ' + c + ' ' + some);

            if (c === 'START') {
                hitStart = true;
                return false;
            }

            if (c === 'END') {
                hitEnd = true;
                return false;
            }

            if (c === '\n') {
                if (consecutiveNewlines === 1) {
                    return false;
                }
                consecutiveNewlines++;
            } else {
                consecutiveNewlines = 0;
            }

            return true;
        },
        init: () => {
            consecutiveNewlines = 0;
            hitStart = false;
            hitEnd = false;
        },
        postBackwards: ({ pos, doc }) =>
            hitStart ? undefined : new Position(...incrementSelection(doc!, pos!.line, pos!.character)),
        postForwards: ({ pos, doc }) =>
            hitEnd ? undefined : new Position(...decrementSelection(doc!, pos!.line, pos!.character)),
    });
}

export function deactivate() {}
