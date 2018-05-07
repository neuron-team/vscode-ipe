# vscode-ipe
## An interactive programming experience for Python in VS Code

This is the public README for vscode-ipe.

To get started on developing this extension, visit [the guide for developers](DEVELOPING.md).

## How to use

This extension makes available several commands starting with `IPE:` to control the behaviour.

To get started, run the `Show output pane` command. This will ask for the address and token of a running Jupyter notebook, so make sure you have this info ready.

To add a card, select some Python code and run the `Send code to output` command.

## Requirements

Note: this is for development only. It will be sorted before production.

Have an instance of Jupyter running on localhost.

* Install Jupyter: `pip install jupyter`
* Run `jupyter notebook --no-browser`
* Take note of the token, you will need to paste this into VS Code

## Release Notes

### 1.0.0

Initial release