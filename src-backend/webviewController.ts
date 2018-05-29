import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { Card } from 'vscode-ipe-types';
import {Event, EventEmitter} from "vscode";


export class WebviewController {
    panel: vscode.WebviewPanel | undefined = undefined;

    private _onDisposed: EventEmitter<void> = new EventEmitter();
    get onDisposed(): Event<void> { return this._onDisposed.event; }

    private _onMoveCardUp: EventEmitter<number> = new EventEmitter();
    get onMoveCardUp(): Event<number> { return this._onMoveCardUp.event; }

    private _onMoveCardDown: EventEmitter<number> = new EventEmitter();
    get onMoveCardDown(): Event<number> { return this._onMoveCardDown.event; }

    private _onDeleteCard: EventEmitter<number> = new EventEmitter();
    get onDeleteCard(): Event<number> { return this._onDeleteCard.event; }
    
    private _onChangeTitle: EventEmitter<{index: number, newTitle: string}> = new EventEmitter();
    get onChangeTitle(): Event<{index: number, newTitle: string}> { return this._onChangeTitle.event; }
    
    private _onCollapseCode: EventEmitter<{index: number, value: boolean}> = new EventEmitter();
    get onCollapseCode(): Event<{index: number, value: boolean}> { return this._onCollapseCode.event; }
    
    private _onCollapseOutput: EventEmitter<{index: number, value: boolean}> = new EventEmitter();
    get onCollapseOutput(): Event<{index: number, value: boolean}> { return this._onCollapseOutput.event; }
    
    private _onCollapseCard: EventEmitter<{index: number, value: boolean}> = new EventEmitter();
    get onCollapseCard(): Event<{index: number, value: boolean}> { return this._onCollapseCard.event; }

    private _onAddCustomCard: EventEmitter<Card> = new EventEmitter();
    get onAddCustomCard(): Event<Card> { return this._onAddCustomCard.event; }
    
    private _onEditCustomCard: EventEmitter<{index: number, card: Card}> = new EventEmitter();
    get onEditCustomCard(): Event<{index: number, card: Card}> { return this._onEditCustomCard.event; }

    private _onJupyterExport: EventEmitter<number[]> = new EventEmitter();
    get onJupyterExport(): Event<number[]> { return this._onJupyterExport.event; }

    constructor(private context: vscode.ExtensionContext) {}

    show() {
        if (this.panel) {
            // If we already have a panel, show it in the target column
            this.panel.reveal(vscode.ViewColumn.Two);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'outputPane',
                "Output pane",
                vscode.ViewColumn.Two,
                {
                    enableScripts: true
                }
            );
            let htmlFile = path.join(this.context.extensionPath, "html", "index.html");
            let basePath = vscode.Uri.file(this.context.extensionPath).with({ scheme: 'vscode-resource' });
            let htmlSource = fs.readFileSync(htmlFile, 'utf-8');
            htmlSource = htmlSource.replace('<base href="">', '<base href="' + basePath.toString() + '/html/">');

            this.panel.webview.html = htmlSource;

            // Reset when the current panel is closed
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this._onDisposed.fire();
            }, null, this.context.subscriptions);

            this.panel.webview.onDidReceiveMessage(message => {
                switch (message.command){
                    case 'moveCardUp':
                        this._onMoveCardUp.fire(message.index);
                        break;
                    case 'moveCardDown':
                        this._onMoveCardDown.fire(message.index);
                        break;
                    case 'deleteCard':
                        this._onDeleteCard.fire(message.index);
                        break;
                    case 'changeTitle':
                        this._onChangeTitle.fire({index: message.index, newTitle: message.newTitle});
                        break;
                    case 'collapseCode':
                        this._onCollapseCode.fire({index: message.index, value: message.value});
                        break;
                    case 'collapseOutput':
                        this._onCollapseOutput.fire({index: message.index, value: message.value});
                        break;
                    case 'collapseCard':
                        this._onCollapseCard.fire({index: message.index, value: message.value});
                        break;
                    case 'addCustomCard':
                        this._onAddCustomCard.fire(message.card);
                        break;
                    case 'editCustomCard':
                        this._onEditCustomCard.fire({index: message.index, card: message.card});
                        break;
                    case 'jupyterExport':
                        this._onJupyterExport.fire(message.indexes);
                }
            })
        }
    }

    addCard(card: Card) {
        if (this.panel) this.panel.webview.postMessage({
            command: 'add-card',
            card: card
        });
    }
    
}
