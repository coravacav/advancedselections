// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { alphaNumeric } from './regexes';
import { registerOutput } from './log';
import { create } from './create';
import { SearchSetting } from './search';
import { ExtensionContext, commands } from 'vscode';

// Add new binding
function anb(ctx: ExtensionContext, name: string, setting: Omit<SearchSetting, 'type'>) {
    ctx.subscriptions.push(
        commands.registerCommand('textobjects.selectInner' + name, create({ ...setting, type: 'inner' }))
    );
    ctx.subscriptions.push(
        commands.registerCommand('textobjects.selectOuter' + name, create({ ...setting, type: 'outer' }))
    );
}

export function activate(ctx: ExtensionContext) {
    registerOutput();

    anb(ctx, 'Word', { lhs: (c) => Boolean(c.match(alphaNumeric)) });
    anb(ctx, 'DoubleQuote', { lhs: (c) => c !== '"' });
    anb(ctx, 'SingleQuote', { lhs: (c) => c !== "'" });
    anb(ctx, 'Backtick', { lhs: (c) => c !== '`', blockNewlines: true });
    anb(ctx, 'Parenthesis', { lhs: (c) => c !== '(', rhs: (c) => c !== ')', blockNewlines: true });
    anb(ctx, 'CurlyBrace', { lhs: (c) => c !== '{', rhs: (c) => c !== '}', blockNewlines: true });
    anb(ctx, 'SquareBracket', { lhs: (c) => c !== '[', rhs: (c) => c !== ']', blockNewlines: true });
    anb(ctx, 'AngleBracket', { lhs: (c) => c !== '<', rhs: (c) => c !== '>', blockNewlines: true });
}

export function deactivate() {}
