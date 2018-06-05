'use strict';

import * as vscode from 'vscode';

import { Card } from 'vscode-ipe-types';
import { WebviewController } from "./webviewController";
import { Interpreter } from "./interpreter";
import { UserInteraction } from "./userInteraction";
import { JupyterManager } from './jupyterManager';
import { CardManager } from './CardManager';
import { JSONObject } from '@phosphor/coreutils';
import {ContentHelpers} from './contentHelpers';

export function activate(context: vscode.ExtensionContext) {    
    let webview: WebviewController = new WebviewController(context);
    let interpreter = new Interpreter();
    let userInteraction: UserInteraction = new UserInteraction(context);
    
    let panelInitialised: boolean = false;
    let localJupyter: boolean = false;

    let cardManager: CardManager = new CardManager();
    webview.onMoveCardUp(index => cardManager.moveCardUp(index));
    webview.onMoveCardDown(index => cardManager.moveCardDown(index));
    webview.onDeleteCard(index => cardManager.deleteCard(index));
    webview.onChangeTitle(data => cardManager.changeTitle(data.index, data.newTitle));
    webview.onCollapseCode(data => cardManager.collapseCode(data.index, data.value));
    webview.onCollapseOutput(data => cardManager.collapseOutput(data.index, data.value));
    webview.onCollapseCard(data => cardManager.collapseCard(data.index, data.value));
    webview.onAddCustomCard(card => cardManager.addCustomCard(card));
    webview.onEditCustomCard(data => cardManager.editCustomCard(data.index, data.card));
    webview.onJupyterExport(indexes => cardManager.exportToJupyter(indexes));
    webview.onOpenInBrowser(index => {
        let cardId = cardManager.getCardId(index);
        let fileName = 'exportedCardTmp_' + cardId + '.ipynb';
        cardManager.exportToJupyter([index], fileName);
        if (localJupyter) {
            interpreter.openNotebookInBrowser(fileName);
        } else {
            vscode.window.showInformationMessage('Please open ' + fileName + ' in the Jupyter window');
            interpreter.openNotebookInBrowser(null);
        }
    });
    webview.undoClicked(() => {
        cardManager.addCard(cardManager.lastDeletedCard);
        webview.addCard(cardManager.lastDeletedCard);
    });

    cardManager.onOpenNotebook(fileName => interpreter.openNotebookInBrowser(fileName));

    ContentHelpers.onStatusChanged(status => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });
    ContentHelpers.onCardReady((card: Card) => {
        cardManager.addCard(card);
        webview.addCard(card);
    });

    function initialisePanel({baseUrl, token}) {
        // Connect to the server defined
        interpreter.connectToServer(baseUrl, token);
        // Start needed kernel
        interpreter.startKernel(UserInteraction.determineKernel());  

        // Execute code when new card is created
        userInteraction.onNewCard(sourceCode => {
            interpreter.executeCode(sourceCode, UserInteraction.determineKernel());
        });

        webview.show();

        context.subscriptions.push(vscode.commands.registerCommand('ipe.exportToJupyter', () => {
            cardManager.exportToJupyter();
        }));

        panelInitialised = true;

        if (UserInteraction.determineKernel() === 'python3') {
            interpreter.autoImportModules();
        }
    }

    userInteraction.onShowPane(() => {
        if (!panelInitialised) {

            if (!JupyterManager.isJupyterInPath()) {
                vscode.window.showInformationMessage('The IPE extension requires Jupyter to be installed. Install now?', 'Install')
                    .then(data => JupyterManager.installJupyter(data));
            } else {
                let jupyterManager = new JupyterManager();
                jupyterManager.getJupyterAddressAndToken()
                    .then(info => {
                        initialisePanel(info);
                        localJupyter = true;
                    })
                    .catch(() => vscode.window.showErrorMessage('Could not start a notebook automatically'));
            }
        
        } else {
            webview.show();
        }
    });

    userInteraction.onFullSetup(() => {
        if (!panelInitialised) {
            if (!JupyterManager.isJupyterInPath()) {
                vscode.window.showInformationMessage('The IPE extension requires Jupyter to be installed. Install now?', 'Install')
                    .then(data => JupyterManager.installJupyter(data));
            } else {
                let choices = ['Create a new notebook', 'Enter details manually'];
                let runningNotebooks = JupyterManager.getRunningNotebooks();
                runningNotebooks.map(input => {
                    choices.push(input.url);
                });
                vscode.window.showQuickPick(choices).then(choice => {
                    if (choice === 'Create a new notebook') {
                        let jupyterManager = new JupyterManager();
                        jupyterManager.getJupyterAddressAndToken()
                            .then(info => {
                                initialisePanel(info);
                                localJupyter = true;
                            })
                            .catch(() => vscode.window.showErrorMessage('Could not start a notebook automatically'));
                    } else if (choice === 'Enter details manually') {
                        vscode.window.showErrorMessage('Could not create a Jupyter instance, enter the server details manually');
                        UserInteraction.askJupyterInfo().then(initialisePanel);
                    } else if(choice) {
                        initialisePanel(runningNotebooks.filter(input => input.url === choice)[0].info);
                    }
                });
            }
        }
    });

    userInteraction.onRestartKernels(() => {
        if (panelInitialised) {
            interpreter.restartKernels();
        } else {
            vscode.window.showInformationMessage("Output pane has not been initialised!");
        }
    });

    userInteraction.onImportNotebook(() => {
        if(panelInitialised){
            let options: vscode.OpenDialogOptions = { canSelectMany : true, filters : { 'Jupyter Notebook': ['ipynb'] } };
            vscode.window.showOpenDialog(options).then(fileUris => {
                fileUris.map(fileUri => {
                    vscode.window.showTextDocument(fileUri).then(textEditor => {
                        let jsonContent: JSONObject = JSON.parse(textEditor.document.getText());
                        cardManager.importJupyter(jsonContent, textEditor.document.fileName);
                    })
                })
            });
        } else {
            vscode.window.showInformationMessage("Output pane has not been initialised!");
        }

    });

    vscode.window.onDidChangeActiveTextEditor(input => {
        if (panelInitialised) {
            // Open new kernel if new file is in a different language
            let kernel = UserInteraction.determineKernel();
            interpreter.startKernel(kernel);
            if (kernel==="python3") {
                interpreter.autoImportModules();
            }
        }
    });
}

export function deactivate(context: vscode.ExtensionContext) {
    JupyterManager.disposeNotebook();
}
