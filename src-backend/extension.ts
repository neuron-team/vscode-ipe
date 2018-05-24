'use strict';

import * as vscode from 'vscode';

import {Card} from 'vscode-ipe-types';
import {WebviewController} from "./webviewController";
import {Interpreter, ContentHelpers} from "./interpreter";
import {UserInteraction} from "./userInteraction";
import {JupyterManager} from './jupyterManager';
import {JupyterExport} from './jupyterExport';

export function activate(context: vscode.ExtensionContext) {

    let webview: WebviewController = new WebviewController(context);
    let userInteraction: UserInteraction = new UserInteraction(context);
    let jupyterExport: JupyterExport = new JupyterExport(context);
    let panelInitialised: Boolean = false;

    let interpreter = new Interpreter();
    ContentHelpers.onStatusChanged(status => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });
    ContentHelpers.onCardReady((card: Card) => {
        webview.addCard(card);
        jupyterExport.addCard(card);
    });

    function initialisePanel({baseUrl, token}){
        // Connect to the server defined
        interpreter.connectToServer(baseUrl, token);
        // Start needed kernel
        interpreter.startKernel(UserInteraction.determineKernel());  

        // Execute code when new card is created
        userInteraction.onNewCard(sourceCode => {
            interpreter.executeCode(sourceCode, UserInteraction.determineKernel());
        });

        webview.show();
        panelInitialised = true;
    }

    userInteraction.onShowPane(() => {
        if(!panelInitialised){

            if(!JupyterManager.isJupyterInPath()){
                vscode.window.showInformationMessage('The IPE extension requires Jupyter to be installed. Install now?', 'Install')
                    .then(data => JupyterManager.installJupyter(data));
            }
            else{
                let choices = ['Create a new notebook', 'Enter details manually'];
                let runningNotebooks = JupyterManager.getRunningNotebooks();
                runningNotebooks.map(input => {
                    choices.push(input.url);
                });
                vscode.window.showQuickPick(choices).then(choice => {
                    if (choice === 'Create a new notebook') {
                        let jupyterManager = new JupyterManager();
                        jupyterManager.getJupyterAddressAndToken()
                            .then(initialisePanel)
                            .catch(() => vscode.window.showErrorMessage('Could not start a notebook automatically'));
                    }
                    else if (choice === 'Enter details manually') {
                        vscode.window.showErrorMessage('Could not create a Jupyter instance, enter the server details manually');
                        UserInteraction.askJupyterInfo().then(initialisePanel);
                    }
                    else if(choice){
                        initialisePanel(runningNotebooks.filter(input => input.url === choice)[0].info);
                    }
                });
            }
        
        }
        else{
            webview.show();
        }
    });

    vscode.window.onDidChangeActiveTextEditor(input => {
        if(panelInitialised){
            // Open new kernel if new file is in a different language
            interpreter.startKernel(UserInteraction.determineKernel());
        }
    });

    // Not needed if there is no interaction with the other modules
    // Probably required to determine the type of kernel used
    jupyterExport.onExportToJupyter(() => {
        // Call a function that converts the array of cards into a .ipynb file
    });
}

export function deactivate(context: vscode.ExtensionContext) {
    console.log('Killed');
    JupyterManager.disposeNotebook();
}
