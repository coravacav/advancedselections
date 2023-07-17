// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getPair } from './getPair';
import { searchBothWays } from './search';
import { alphaNumeric } from './regexes';
import { output, registerOutput } from './log';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    registerOutput();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('textobjects.selectWord', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.selections = editor.selections
            .map((selection) => {
                const pair = getPair(editor, selection);
                const search = searchBothWays(pair, (char) => Boolean(char.match(alphaNumeric)));

                if (search) {
                    return new vscode.Selection(...search);
                }
            })
            .filter(Boolean);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
