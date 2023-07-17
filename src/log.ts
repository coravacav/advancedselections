import { OutputChannel, window } from 'vscode';

export let output: OutputChannel;

export function registerOutput() {
    output = window.createOutputChannel('Text Objects');
}
