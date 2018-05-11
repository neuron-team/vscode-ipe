'use strict';

import * as vscode from 'vscode';

import {Card} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter, ContentHelpers} from "./interpreter";
import {UserInteraction} from "./userInteraction";

export function activate(context: vscode.ExtensionContext) {
    let webview: WebviewController = new WebviewController(context);
    let userInteraction: UserInteraction = new UserInteraction(context);
    
    let interpreter = new Interpreter();
    ContentHelpers.eventEmitter.on('ipe.renderCard', (card: Card) => {
        webview.addCard(card);
    });
    ContentHelpers.eventEmitter.on('ipe.changeStatus', (status: string) => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });

    userInteraction.onShowPane(() => {
        // Initialise status indicator
        //statusIndicator.text = "Jupyter: idle";

        // Ask info about the interpreter
        userInteraction.askJupyterInfo().then(({baseUrl, token}) => {
            // Connect to the server defined
            interpreter.connectToServer(baseUrl, token);
            // Create a python3 kernel, any kernel can be chosen
            interpreter.startKernel('python3');
            // Execute code when new card is created
            userInteraction.onNewCard(sourceCode => interpreter.executeCode(sourceCode, 'python3'));
        });
        webview.show();
    });
}

export function deactivate() {
}
