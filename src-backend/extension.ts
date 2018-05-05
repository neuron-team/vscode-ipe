'use strict';

import * as vscode from 'vscode';

import {Card} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter} from "./interpreter";

export function activate(context: vscode.ExtensionContext) {
    let webview: WebviewController = new WebviewController(context);

    context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {
        webview.show();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ipe.newCard', () => {
        vscode.window.showInputBox({prompt: 'Card title'}).then(cardTitle => {
            if (cardTitle == undefined) return;
            vscode.window.showInputBox({prompt: 'Input code'}).then(sourceCode => {
                if (sourceCode == undefined) return;
                Interpreter.run(sourceCode).then(output => {
                    let newCard = new Card(cardTitle);
                    newCard.sourceCode = sourceCode;
                    newCard.interpreterOutput = output;
                    webview.addCard(newCard);
                });
            });
        });
    }));
}


export function deactivate() {
}
