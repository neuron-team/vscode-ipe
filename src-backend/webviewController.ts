import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { Card } from 'vscode-ipe-types';
import {Event, EventEmitter} from "vscode";


export class WebviewController {
    panel: vscode.WebviewPanel | undefined = undefined;

    private _onDisposed: EventEmitter<void> = new EventEmitter();
    get onDisposed(): Event<void> { return this._onDisposed.event; }

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
        }
    }

    addCard(card: Card) {
        if (this.panel) this.panel.webview.postMessage({
            command: 'add-card',
            card: card
        });
    }
}
