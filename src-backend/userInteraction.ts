import * as vscode from "vscode";
import {Event, EventEmitter} from "vscode";
import {Card, CardOutput} from 'vscode-ipe-types';

export class UserInteraction {
    private _onShowPane: EventEmitter<void> = new EventEmitter();
    get onShowPane(): Event<void> { return this._onShowPane.event; }

    private _onNewCard: EventEmitter<string> = new EventEmitter();
    get onNewCard(): Event<string> { return this._onNewCard.event; }

    private _onRenderCard: EventEmitter<Card> = new EventEmitter();
    get onRenderCard(): Event<Card> { return this._onRenderCard.event; }

    private _onUpdateStatus: EventEmitter<string> = new EventEmitter();
    get onUpdateStatus(): Event<string> { return this._onUpdateStatus.event; }

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {
            this._onShowPane.fire();
        }));

        context.subscriptions.push(vscode.commands.registerCommand('ipe.updateStatus', (status: string) => {
            this._onUpdateStatus.fire(status);
        }));

        context.subscriptions.push(vscode.commands.registerCommand('ipe.renderCard', (card: Card) => {
            this._onRenderCard.fire(card);
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
}
