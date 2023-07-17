# Advanced Motions for VSCode

Gives you motion superpowers, partially like vim-like text objects for VSCode!

## Features

-   Works fully with multicursor!

Basic usage is `ctrl+h` or `cmd+h` then `i` for inner or `o` for outer, then the text object!

If you're not currently inside the text object, use `ctrl+shift+h` or `cmd+shift+h` prefix instead to jump forwards into it.

If you're not currently inside the text object and need to jump _backwards_ into it, use `ctrl+shift+alt+h` or `cmd+shift+alt+h` prefix instead.

These are rudimentary keybinds, if you find better ones to recommend, or want to cutomize them, more power to ya.

The current ones supported are listed here

| Text Object | Description    |
| ----------- | -------------- |
| `w`         | Word           |
| `"`         | String (")     |
| `'`         | String (')     |
| \`          | String(\`)     |
| `(` / `)`   | Parentheses    |
| `[` / `]`   | Brackets       |
| `{` / `}`   | Braces         |
| `<` / `>`   | Angle Brackets |

## Extension Settings

Stub.

## Todos

-   [ ] Make keybindings more customizable
-   [ ] Add extension settings
-   [ ] Add more text objects?
