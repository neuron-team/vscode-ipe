import * as vscode from "vscode";
import {Event, EventEmitter} from "vscode";
import {Card, CardOutput} from 'vscode-ipe-types';
import {StatusBarItem} from 'vscode';

export class UserInteraction {
    private _onShowPane: EventEmitter<void> = new EventEmitter();
    get onShowPane(): Event<void> { return this._onShowPane.event; }

    private _onNewCard: EventEmitter<string> = new EventEmitter();
    get onNewCard(): Event<string> { return this._onNewCard.event; }

    private statusIndicator: StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {

        
        context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {
            this._onShowPane.fire();
        }));

        context.subscriptions.push(vscode.commands.registerCommand('ipe.newCard', () => {
            if (!vscode.window.activeTextEditor) {
                vscode.window.showErrorMessage("No file open");
                return;
            }
            if (vscode.window.activeTextEditor.selection.isEmpty) {
                vscode.window.showErrorMessage("Please select some code");
                return;
            }
            let sourceCode = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
            this._onNewCard.fire(sourceCode);
        }));

        this.statusIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusIndicator.show();
    }

    askJupyterInfo() : Promise<{baseUrl: string, token: string}> {
        return new Promise(resolve => {
            vscode.window.showInputBox({
                prompt: 'Provide the base address of the Jupyter notebook',
                value: 'http://localhost:8888/'
            }).then(url => {
                vscode.window.showInputBox({
                    prompt: 'Provide the token to access to Jupyter notebook, leave blank if not used',
                    value: ''
                }).then(givenToken => {
                    resolve({
                        baseUrl: url ? url : '',
                        token: givenToken ? givenToken : ''
                    });
                });
            });
        });
    }

    updateState(status: string){
        this.statusIndicator.text = status;
    }
}
