import { Position, commands } from 'vscode';

export function move(currentPosition: Position, newPosition: Position, select: boolean = true) {
    const lines = newPosition.line - currentPosition.line;
    const characters = newPosition.character - currentPosition.character;

    if (lines !== 0) {
        commands.executeCommand('cursorMove', {
            to: lines > 0 ? 'down' : 'up',
            by: 'line',
            value: Math.abs(lines),
            select,
        });
    }

    if (characters !== 0) {
        commands.executeCommand('cursorMove', {
            to: characters > 0 ? 'right' : 'left',
            by: 'character',
            value: Math.abs(characters),
            select,
        });
    }
}

export function movePair(currentPosition: Position, backwards: Position, forwards: Position, select: boolean = true) {
    move(currentPosition, backwards, false);
    move(backwards, forwards, select);
}
