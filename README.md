# Microsoft VS Code IPE
![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)
![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)
![Code Climate](https://codeclimate.com/github/boennemann/badges.svg)
![Build Status](https://semaphoreapp.com/api/v1/projects/d4cca506-99be-44d2-b19e-176f36ec8cf1/128505/shields_badge.svg)

## An interactive programming experience for Python in VS Code

This is the public README for vscode-ipe.

To get started on developing this extension, visit [the guide for developers](DEVELOPING.md).

## How to use

This extension makes available several commands starting with `IPE:` to control the behaviour.

To get started, open a Python or R file and run the `Show output pane` command (or click the icon in the top right corner). You will have the choice to create a new notebook or use an existing one (this is for development only, not a production feature).

To add a card, select some Python code and run the `Send code to output` command, or use the keyboard shortcut <kbd>alt</kbd>+<kbd>enter</kbd>.

## Requirements

* Install Jupyter: `pip install jupyter`

## Release Notes

### 0.1.0

Initial release
