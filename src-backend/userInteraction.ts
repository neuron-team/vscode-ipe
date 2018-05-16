import * as vscode from "vscode";
import {Event, EventEmitter} from "vscode";
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
                // Sends current line to the interpreter
                let lineNr = vscode.window.activeTextEditor.selection.start.line;
                let sourceCode = vscode.window.activeTextEditor.document.lineAt(lineNr).text;
                this._onNewCard.fire(sourceCode);

                // Advance text cursor to the next line
                let newPos = new vscode.Position(lineNr+1, 0);
                let newSelection = new vscode.Selection(newPos, newPos);
                vscode.window.activeTextEditor.selection = newSelection;
            } else {
                // Send selection to interpreter
                let sourceCode = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
                this._onNewCard.fire(sourceCode);
            }
            
        }));

        this.statusIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusIndicator.show();
    }

    updateStatus(status: string){
        this.statusIndicator.text = status;
    }

    static askJupyterInfo() : Promise<{baseUrl: string, token: string}> {
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

    static determineKernel(){
        let docType = vscode.window.activeTextEditor.document.languageId;
        switch (docType) {
            case 'python':
                return 'python3';
            case 'r':
                return 'ir';
            default: 
                return 'python3';
        }
    }
}
