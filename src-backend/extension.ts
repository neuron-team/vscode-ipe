'use strict';

import * as vscode from 'vscode';

import { Card } from 'neuron-ipe-types';
import { WebviewController } from "./webviewController";
import { Interpreter } from "./interpreter";
import { UserInteraction } from "./userInteraction";
import { JupyterManager } from './jupyterManager';
import { CardManager } from './cardManager';
import { JSONObject } from '@phosphor/coreutils';
import {ContentHelpers} from './contentHelpers';

export function activate(context: vscode.ExtensionContext) {
    /**
     * Webview controller used to generate the output pane.     
    */
    let webview: WebviewController = new WebviewController(context);

    /**
     * Interpreter instance, allows code execution.
     */
    let interpreter = new Interpreter();

    /**
     * Manages the interaction between VSCode ui elements and the user.
     */
    let userInteraction: UserInteraction = new UserInteraction(context);
    
    /**
     * Boolean which keeps track of the state of the output pane.
     */
    let panelInitialised: boolean = false;

    /**
     * Boolean, true when Jupyter Notebook is initialised from
     * within jupyterManager in the current workspace.
     */
    let localJupyter: boolean = false;

    /**
     * Manages the cards in the backend and allows import from and export to
     * Jupyter Notebook files (.pynb).
     */
    let cardManager: CardManager = new CardManager();

    // Link webview events to the corresponding cardManager functions
    webview.onMoveCardUp(index => cardManager.moveCardUp(index));
    webview.onMoveCardDown(index => cardManager.moveCardDown(index));
    webview.onDeleteCard(index => cardManager.deleteCard(index));
    webview.onDeleteSelectedCards(indexes => cardManager.deleteSelectedCards(indexes));
    webview.onChangeTitle(data => cardManager.changeTitle(data.index, data.newTitle));
    webview.onCollapseCode(data => cardManager.collapseCode(data.index, data.value));
    webview.onCollapseOutput(data => cardManager.collapseOutput(data.index, data.value));
    webview.onCollapseCard(data => cardManager.collapseCard(data.index, data.value));
    webview.onAddCustomCard(card => cardManager.addCustomCard(card));
    webview.onEditCustomCard(data => cardManager.editCustomCard(data.index, data.card));
    webview.onJupyterExport(indexes => cardManager.exportToJupyter(indexes));
    webview.onSavePdf(pdf => UserInteraction.savePdf(pdf));
    webview.onOpenInBrowser(index => {
        // Export card to a .pynb file
        let cardId = cardManager.getCardId(index);
        let fileName = 'exportedCardTmp_' + cardId + '.ipynb';
        cardManager.exportToJupyter([index], fileName);
        if (localJupyter) {
            // If the jupyter has been initialised in the current workspace, open file directly
            interpreter.openNotebookInBrowser(fileName);
        } else {
            // Otherwise tell the user to select the file created manually
            vscode.window.showInformationMessage('Please open ' + fileName + ' in the Jupyter window');
            interpreter.openNotebookInBrowser(null);
        }
    });
    webview.undoClicked(() => {
        // Restore the deleted cards if the undo button is pressed by the user
        cardManager.lastDeletedCards.map(card => {
            // Cards are restored both in the backend and frontend
            cardManager.addCard(card);
            webview.addCard(card);
        })
        cardManager.lastDeletedCards = [];
    });

    // Link cardManager open in notebook event to the interpreter function which provides the functionality
    cardManager.onOpenNotebook(fileName => interpreter.openNotebookInBrowser(fileName));

    // Whenever the status of Jupyter Notebook changes, the status bar is updated
    // Jupyter: idle || Jupyter: busy
    ContentHelpers.onStatusChanged(status => {
        userInteraction.updateStatus(`Jupyter: ${status}`);
    });
    ContentHelpers.onCardReady((card: Card) => {
        // Add new cards to both the frontend and the backend
        cardManager.addCard(card);
        webview.addCard(card);
    });

    /**
     * Initialise the output pane and set up the interpreter.
     * @param param0    interface containing the base url and the token of the current Jupyter Notebook.
     */
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

        // If the kernel is python3, look for module imports
        if (UserInteraction.determineKernel() === 'python3') {
            interpreter.autoImportModules();
        }
    }

    /**
     * Define callback function of show output pane button.
     */
    userInteraction.onShowPane(() => {
        if (!panelInitialised) {
            // Check if Jupyter Notebook is installed on the local machine
            if (!JupyterManager.isJupyterInPath()) {
                // Ask the user to install Jupyter Notebook if not present
                vscode.window.showInformationMessage('The IPE extension requires Jupyter to be installed. Install now?', 'Install')
                    .then(data => JupyterManager.installJupyter(data));
            } else {
                // Create a Jupyter Notebook instance automatically
                let jupyterManager = new JupyterManager();
                jupyterManager.getJupyterAddressAndToken()
                    .then(info => {
                        initialisePanel(info);
                        if(jupyterManager.workspaceSet) {
                            localJupyter = true;
                        }
                    })
                    .catch(error => vscode.window.showErrorMessage('Error could not start: ' + error));
            }
        
        } else {
            webview.show();
            // Reset the state of the backend card array when the output pane is closed and opened again
            cardManager.resetState();
        }
    });

    /**
     * Define callback function called when a full setup
     * of Jupyter Notebook is requested by the user.
     */
    userInteraction.onFullSetup(() => {
        if (!panelInitialised) {
            // Check if Jupyter Manager is installed on the local machine
            if (!JupyterManager.isJupyterInPath()) {
                // Ask the user to install Jupyter Manager if not present
                vscode.window.showInformationMessage('The IPE extension requires Jupyter to be installed. Install now?', 'Install')
                    .then(data => JupyterManager.installJupyter(data));
            } else {
                let choices = ['Create a new notebook', 'Enter details manually'];
                let runningNotebooks = JupyterManager.getRunningNotebooks();
                runningNotebooks.map(input => {
                    choices.push(input.url);
                });
                /**
                 * Propose different options to the user:
                 * - Create a new Jupyter Notebook automatically.
                 * - Enter the infos of an existing Jupyter Notebook instance manually.
                 * - Choose an existing session of Jupyter Notebook running on the current machine.
                 */
                vscode.window.showQuickPick(choices).then(choice => {
                    if (choice === 'Create a new notebook') {
                        let jupyterManager = new JupyterManager();
                        jupyterManager.getJupyterAddressAndToken()
                            .then(info => {
                                initialisePanel(info);
                                if(jupyterManager.workspaceSet) {
                                    localJupyter = true;
                                }
                            })
                            .catch(() => vscode.window.showErrorMessage('Could not start a notebook automatically'));
                    } else if (choice === 'Enter details manually') {
                        UserInteraction.askJupyterInfo().then(initialisePanel);
                    } else if(choice) {
                        initialisePanel(runningNotebooks.filter(input => input.url === choice)[0].info);
                    }
                });
            }
        }
    });

    /**
     * Define callback function called whenever the
     * user requests a kernel restart.
     */
    userInteraction.onRestartKernels(() => {
        if (panelInitialised) {
            interpreter.restartKernels();
        } else {
            vscode.window.showInformationMessage("Output pane has not been initialised!");
        }
    });

    /**
    * Define callback function called when the
    * user wants to import a notebook.
    */
    userInteraction.onImportNotebook(() => {
        if(panelInitialised){
            let options: vscode.OpenDialogOptions = { canSelectMany : true, filters : { 'Jupyter Notebook': ['ipynb'] } };
            vscode.window.showOpenDialog(options).then(fileUris => {
                fileUris.map(fileUri => {
                    vscode.window.showTextDocument(fileUri).then(textEditor => {
                        let jsonContent: JSONObject = JSON.parse(textEditor.document.getText());
                        cardManager.importJupyter(jsonContent);
                    })
                })
            });
        } else {
            vscode.window.showInformationMessage("Output pane has not been initialised!");
        }

    });

    /**
     * Determine the right kernel for code execution when
     * the file being edited by the user changes.
     */
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

/**
 * Called when the extension is closed.
 * Disposes the running instance of Jupyter Notebook.
 */
export function deactivate(context: vscode.ExtensionContext) {
    JupyterManager.disposeNotebook();
}
