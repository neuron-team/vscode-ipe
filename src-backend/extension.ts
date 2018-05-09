'use strict';

import * as vscode from 'vscode';

import {Card, CardOutput} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter} from "./interpreter";
import {UserInteraction} from "./userInteraction";
import {StatusBarItem} from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    let webview: WebviewController = new WebviewController(context);
    let statusIndicator: StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    let userInteraction: UserInteraction = new UserInteraction(context);

    userInteraction.onRenderCard((card: Card) => {
        webview.addCard(card);
    });

    userInteraction.onUpdateStatus((status: string) => {
        statusIndicator.text = "Jupyter: "+status;
    });

    userInteraction.onShowPane(() => {
        // Initialise status indicator
        //statusIndicator.text = "Jupyter: idle";
        statusIndicator.show();

        // Ask info about the interpreter
        userInteraction.askJupyterInfo().then(({baseUrl, token}) => {
            // Generate new interpreter instance
            let interpreter = new Interpreter('python3', baseUrl, token);
            // Execute code when new card is created
            userInteraction.onNewCard(sourceCode => interpreter.executeCode(sourceCode));
        });
        webview.show();
    });
}

export function deactivate() {
}
