# neuron for Visual Studio Code

### An Interactive Programming Experience for Data Scientists

**neuron** is a robust application that seamlessly combines the power of
Visual Studio Code with the interactivity of Jupyter Notebook.

![Screenshot](https://github.com/lorenzo2897/vscode-ipe/blob/master/screenshot.png?raw=true)

## Getting started

Download the latest release from the [releases page](https://github.com/lorenzo2897/vscode-ipe/releases) or via the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=neuron.neuron-IPE).

This extension makes available several commands starting with `IPE:` to control the behaviour.

To get started, open a Python or R file and run the `Show Output Pane` command (or click the icon in the top right corner). You will have the choice to create a new notebook or use an existing one (this is for development only, not a production feature).

To add a card, select some Python code and run the `Send code to output` command, or use the keyboard shortcut <kbd>Alt</kbd>+<kbd>Enter</kbd>.

[View the wiki page](https://github.com/lorenzo2897/vscode-ipe/wiki).

## Requirements

* You must have at least Visual Studio Code version 1.23.0
* Supports Windows, macOS and Linux

## 1.0.4 Release Notes

* Repo moved to new Organisation
* Minor error printing improvement

### Known Issues

#### 500 Internal Server Error

When running you may receive a '500 Internal Server Error' message, this usually occurs due to the installation of Jupyter. neuron will try to install it for you however this may not be enough. A simple solution is to run `pip3 install jupyter` in the terminal. For more help go to [Installing Jupyter Notebook](https://jupyter.readthedocs.io/en/latest/install.html)

#### Kernal runs from Home Directory not Current

This issue will be addressed in v1.1


For information about building upon this extension, visit [the guide for developers](DEVELOPING.md).
