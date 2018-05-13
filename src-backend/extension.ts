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
    let panelInitialised: Boolean = false;

    let interpreter = new Interpreter();
    ContentHelpers.onStatusChanged(status => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });
    ContentHelpers.onCardReady((card: Card) => {
        webview.addCard(card);
    });

    function initialisePanel({baseUrl, token}){
        // Connect to the server defined
        interpreter.connectToServer(baseUrl, token);
        // Create a python3 kernel, any kernel can be chosen
        interpreter.startKernel('python3');
        // Execute code when new card is created
        userInteraction.onNewCard(sourceCode => interpreter.executeCode(sourceCode, 'python3'));

        webview.show();
        panelInitialised = true;
    }

    userInteraction.onShowPane(() => {
        if(!panelInitialised){
            let choices = ['Create a new notebook', 'Enter details manually'];
            let runningNotebooks = JupyterManager.getRunningNotebooks();
            runningNotebooks.map(input =>{
                choices.push(input.url);
            });
            vscode.window.showQuickPick(choices).then(choice => {
                if(choice === 'Create a new notebook'){
                    let jupyterManager = new JupyterManager();
                    jupyterManager.getJupyterInfos()
                        .then(initialisePanel)
                        .catch(() => vscode.window.showErrorMessage('Could not start a notebook automatically'));
                }
                else if(choice === 'Enter details manually'){
                    vscode.window.showErrorMessage('Could not create a Jupyter instance, enter the server details manually');
                    userInteraction.askJupyterInfo().then(initialisePanel);
                }
                else{
                    initialisePanel(runningNotebooks.filter(input => input.url === choice)[0].info);
                }
            });
        }
        else{
            webview.show();
        }
    });
}

export function deactivate() {
}
