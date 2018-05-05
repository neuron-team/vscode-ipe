import * as vscode from "vscode";
import {Event, EventEmitter} from "vscode";

export class UserInteraction {
    private _onShowPane: EventEmitter<void> = new EventEmitter();
    get onShowPane(): Event<void> { return this._onShowPane.event; }

    private _onNewCard: EventEmitter<{title: string, source: string}> = new EventEmitter();
    get onNewCard(): Event<{title: string, source: string}> { return this._onNewCard.event; }

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {
            this._onShowPane.fire();
        }));

        context.subscriptions.push(vscode.commands.registerCommand('ipe.newCard', () => {
            vscode.window.showInputBox({prompt: 'Card title'}).then(cardTitle => {
                if (cardTitle == undefined) return;
                vscode.window.showInputBox({prompt: 'Input code'}).then(sourceCode => {
                    if (sourceCode == undefined) return;
                    this._onNewCard.fire({
                        title: cardTitle,
                        source: sourceCode
                    });
                });
            });
        }));
    }
}
