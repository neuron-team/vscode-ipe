'use strict';

import * as vscode from 'vscode';

import {Card} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter, ContentHelpers} from "./interpreter";
import {UserInteraction} from "./userInteraction";
import {JupyterManager} from './jupyterManager';

export function activate(context: vscode.ExtensionContext) {

    let webview: WebviewController = new WebviewController(context);
    let userInteraction: UserInteraction = new UserInteraction(context);
    
    let interpreter = new Interpreter();
    ContentHelpers.onStatusChanged(status => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });
    ContentHelpers.onCardReady((card: Card) => {
        webview.addCard(card);
    });

    function initialisePanel({baseUrl, token}){
        console.log(baseUrl+" "+ token);
        // Connect to the server defined
        interpreter.connectToServer(baseUrl, token);
        // Create a python3 kernel, any kernel can be chosen
        interpreter.startKernel('python3');
        // Execute code when new card is created
        userInteraction.onNewCard(sourceCode => interpreter.executeCode(sourceCode, 'python3'));

        webview.show();
    }

    userInteraction.onShowPane(() => {
        let jupyterManager = new JupyterManager();
        jupyterManager.getJupyterInfos()
            .then(initialisePanel)
            .catch(() => userInteraction.askJupyterInfo().then(initialisePanel));
    });
}

export function deactivate() {
}
