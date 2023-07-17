// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { alphaNumeric } from './regexes';
import { registerOutput } from './log';
import { create } from './create';
import { SearchSetting } from './search';
import { ExtensionContext, commands } from 'vscode';

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
    anb(ctx, 'Parenthesis', { lhs: (c) => c !== '(', rhs: (c) => c !== ')', ignoreNewlines: true });
    anb(ctx, 'CurlyBrace', { lhs: (c) => c !== '{', rhs: (c) => c !== '}', ignoreNewlines: true });
    anb(ctx, 'SquareBracket', { lhs: (c) => c !== '[', rhs: (c) => c !== ']', ignoreNewlines: true });
    anb(ctx, 'AngleBracket', { lhs: (c) => c !== '<', rhs: (c) => c !== '>', ignoreNewlines: true });
}

export function deactivate() {}
