'use strict';

import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";

import { Card } from 'vscode-ipe-types';

export function activate(context: vscode.ExtensionContext) {
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {

        if (currentPanel) {
            // If we already have a panel, show it in the target column
            currentPanel.reveal(vscode.ViewColumn.Two);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                'outputPane',
                "Output pane",
                vscode.ViewColumn.Two,
                {
                    enableScripts: true
                }
            );
            let htmlFile = path.join(context.extensionPath, "html", "index.html");
            let basePath = vscode.Uri.file(context.extensionPath).with({ scheme: 'vscode-resource' });
            let htmlSource = fs.readFileSync(htmlFile, 'utf-8');
            htmlSource = htmlSource.replace('<base href="">', '<base href="' + basePath.toString() + '/html/">');

            currentPanel.webview.html = htmlSource;

            // Reset when the current panel is closed
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ipe.newCard', () => {
        let newCard = new Card("blah blah");

        if (currentPanel) currentPanel.webview.postMessage({
            command: 'add-card',
            card: newCard
        });
    }));
}


export function deactivate() {
}
