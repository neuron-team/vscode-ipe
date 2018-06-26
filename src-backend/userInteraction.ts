import * as vscode from "vscode";
import {Event, EventEmitter} from "vscode";
import {StatusBarItem} from 'vscode';
import * as fs from "fs";

/**
 * Class containing the events which guide the user interaction with vscode.
 * These interactions include:
 * - The creation of a new card.
 * - The import of a notebook file.
 * - The initialisation of the output pane.
 * - The full setup of a Jupyter Notebook instance.
 * - The saving of a pdf output.
 * - The visualisation of the Jupyter Notebook status.
 */
export class UserInteraction {
    /**
     * Event triggered when the user opened the output pane.
     */
    private _onShowPane: EventEmitter<void> = new EventEmitter();
    get onShowPane(): Event<void> { return this._onShowPane.event; }

    /**
     * Event triggered when a new card is created.
     */
    private _onNewCard: EventEmitter<string> = new EventEmitter();
    get onNewCard(): Event<string> { return this._onNewCard.event; }

    /**
     * Event triggered when the user requests a full setup of a Jupyter Notebook instance.
     */
    private _onFullSetup: EventEmitter<string> = new EventEmitter();
    get onFullSetup(): Event<string> { return this._onFullSetup.event; }

    /**
     * Event triggered when the user requests a restart of the kernels.
     */
    private _onRestartKernels: EventEmitter<void> = new EventEmitter();
    get onRestartKernels(): Event<void> { return this._onRestartKernels.event; }

    /**
     * Event triggered when an .ipynb file is imported.
     */
    private _onImportNotebook: EventEmitter<void> = new EventEmitter();
    get onImportNotebook(): Event<void> { return this._onImportNotebook.event; }

    /**
     * Contains the status bar item which indicates the status of the Jupyter Notebook instance being used.
     */
    private statusIndicator: StatusBarItem;

    /**
     * Link callback functions to commands and initialise status bar item.
     * @param context   The vscode extension context.
     */
    constructor(private context: vscode.ExtensionContext) {

        context.subscriptions.push(vscode.commands.registerCommand('ipe.showWebview', () => {
            this.showWebview();
        }));

        context.subscriptions.push(vscode.commands.registerCommand('ipe.fullSetup', () => {
            this.fullSetup();
         }));


        context.subscriptions.push(vscode.commands.registerCommand('ipe.newCard', () => {
           this.newCard();
        }));   
        
        context.subscriptions.push(vscode.commands.registerCommand('ipe.restartKernels', () => {
            this.restartKernels();
        }));   

        context.subscriptions.push(vscode.commands.registerCommand('ipe.importNotebook', () => {
            this.importNotebook();
        }));

        // Create an status bar item in vscode to indicate the status of the Jupyter Notebook instance being used.
        this.statusIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusIndicator.show();
    }

    private showWebview() {
        this._onShowPane.fire();
    }

    private fullSetup() {
        this._onFullSetup.fire();
    }

    private restartKernels() {
        this._onRestartKernels.fire();
    }

    private importNotebook() {
        this._onImportNotebook.fire();
    }

    /**
     * Get the selection from the file edited and send it to interpreter for execution
     * and processing.
     */
    private newCard() {
        let trimNewlines = s => s.replace(/^(\r?\n)+|(\r?\n)+$/g,'');

        if (!vscode.window.activeTextEditor) {
            vscode.window.showErrorMessage("No file open");
            return;
        }
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            // Sends current line to the interpreter
            let lineNr = vscode.window.activeTextEditor.selection.start.line;
            let sourceCode = vscode.window.activeTextEditor.document.lineAt(lineNr).text;
            this._onNewCard.fire(trimNewlines(sourceCode));

            // Advance text cursor to the next line
            let newPos = new vscode.Position(lineNr+1, 0);
            let newSelection = new vscode.Selection(newPos, newPos);
            vscode.window.activeTextEditor.selection = newSelection;
        } else {
            // Send selection to interpreter
            let sourceCode = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
            this._onNewCard.fire(trimNewlines(sourceCode));
        }
    }

    /**
     * Update the Jupyter Notebook displayed status on the statusIndicator component.
     * @param status    The Jupyter Notebook status to display.
     */
    updateStatus(status: string) {
        this.statusIndicator.text = status;
    }

    /**
     * Ask the user to manually enter the Jupyter Notebook infos if required.
     * @returns A promise which resolves into the infos (url and token) of a Jupyter Notebook.
     */
    static askJupyterInfo() : Promise<{baseUrl: string, token: string}> {
        return new Promise(resolve => {
            vscode.window.showInputBox({
                prompt: 'Provide the base address of the Jupyter notebook',
                value: 'http://localhost:8888/'
            }).then(url => {
                vscode.window.showInputBox({
                    prompt: 'Provide the token to access to Jupyter notebook, leave blank if not used',
                    value: ''
                }).then(givenToken => {
                    resolve({
                        baseUrl: url ? url : '',
                        token: givenToken ? givenToken : ''
                    });
                });
            });
        });
    }

    /**
     * Analyse the source file being currently edited and
     * determine the right kernel for execution.
     * Currently python3 and r are the only kernel supported.
     * New kernels can be added here.
     */
    static determineKernel() {
        if (!vscode.window.activeTextEditor) {
            return '';
        }

        let docType = vscode.window.activeTextEditor.document.languageId;
        switch (docType) {
            case 'python':
                return 'python3';
            case 'r':
                return 'ir';
            default: 
                return '';
        }
    }

    /**
     * Saves a base64 encoded pdf to file. A save dialog with the user is created.
     * @param pdf   The base64 encoded pdf.
     */
    static savePdf(pdf: string) {
        vscode.window.showSaveDialog({ filters: { 'PDF File': ['pdf'] } }).then(fileUri => {
            if (fileUri) {
                try{
                    fs.writeFileSync(fileUri.fsPath, pdf, 'base64');
                } catch(err) {
                    vscode.window.showErrorMessage(`Could not save the PDF: ${err}`);
                }
            }
        });
    }
}
