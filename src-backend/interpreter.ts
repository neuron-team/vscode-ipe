import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';
import {Card, CardOutput} from 'neuron-ipe-types';
import { ContentHelpers } from './contentHelpers';

import * as vscode from 'vscode';
import {Event, EventEmitter} from "vscode";

/**
 * Manages an existing Jupyter Notebook.
 * Includes utilities to start and manage the required kernels
 * and manages code execution
 */
export class Interpreter {

    /**
     * The server settings used to establish a basic connection.
     */
    private serverSettings: ServerConnection.ISettings;

    /**
     * The set containing the kernel promises defined.
     * Kernels ready for code execution are returned when resolved.
     */
    private kernelPromise = {};
    
    /**
     * The set which keeps track of the documents which were already
     * analysed for imports.
     */
    private alreadyImportedDocs = new Set<vscode.Uri>();

    constructor(){}

    /**
     * Defines the necessary settings to connect to a Jupyter Notebook server.
     * @param baseUrl   The base url of the Jupyter Notebook session.
     * @param token     The token required for authentication with the server.
     */
    connectToServer(baseUrl: string, token: string) {
        this.serverSettings = ServerConnection.makeSettings(
            {
                baseUrl: baseUrl, 
                pageUrl: "", 
                // A web socket is required to allow token authentication
                wsUrl: baseUrl.replace('http', 'ws'), 
                token: token, 
                init: {cache: "no-store", credentials: "same-origin"}
            });
    }

    /**
     * Start a new kernel on the Jupyter Notebook server previously configured.
     * @param kernelName    The name of the kernel to initialise. E.g. python3, r
     */
    startKernel(kernelName: string) {
        if(!(kernelName in this.kernelPromise)) {
            let options: Kernel.IOptions = { name : kernelName, serverSettings : this.serverSettings };
            this.kernelPromise[kernelName] = Kernel.startNew(options);
            // If a python3 kernel is initialised auto-execute %matplotlib inline
            // to render matplotlib graphs correctly
            if (kernelName === 'python3'){
                this.executeCode('%matplotlib inline', 'python3');
            }
            if (['python2', 'python3', 'python3'].includes(kernelName) && vscode.workspace.workspaceFolders) {
                this.executeCode('%cd ' + vscode.workspace.workspaceFolders[0].uri.fsPath, kernelName);
            }
        }
    }

    /**
     * Restart the kernels initialised by the current instance of the class.
     */
    restartKernels() {
        // Get a list of all the kernels active
        let activeKernels: string[] = Object.keys(this.kernelPromise);

        // Shut down all the kernels by executing the shutdown() function
        for(let key in this.kernelPromise) {
            this.kernelPromise[key].then(kernel => kernel.shutdown());
        }

        // Empty the set of initialised kernel promises
        this.kernelPromise = {};

        // Initialise a kernel promise for each language required
        activeKernels.forEach(el => this.startKernel(el));
    }

    /**
     * Open a Jupyter Notebook file (.ipynb) in the browser through
     * the current session of Jupyter Notebook.
     * If the Jupyter Notebook was initialised in the current workspace
     * then the file is opened automatically.
     * Otherwise, an instance of Jupyter Notebook is opened in the browser
     * and the user has to select the .ipynb file manually.
     * @param filename  The .ipynb file to open. 
     */
    openNotebookInBrowser(filename: string = null) {
        let uri;
        let baseUrl = this.serverSettings.baseUrl;
        let token = this.serverSettings.token;
        if (filename) {
            uri = vscode.Uri.parse(baseUrl + 'notebooks/' + filename + '?token=' + token);
        } else {
            uri = vscode.Uri.parse(baseUrl + '?token=' + token);
        }
        // Open uri in the default browser on the current machine
        vscode.commands.executeCommand('vscode.open', uri);
    }

    /**
     * Execute source code through a specific kernel.
     * The response is then processed by the ContentHelpers.interpretOutput function
     * on IO pub.
     * @param source        The source code to execute.
     * @param kernelName    The name of the kernel to execute the source code with.
     */
    executeCode(source : string, kernelName: string) {
        if(kernelName in this.kernelPromise){
            this.kernelPromise[kernelName]
                .then(kernel => kernel.requestExecute({
                    // Replace windows line endings with unix line endings.
                    code : source.replace('\r\n', '\n'),
                    stop_on_error: false,
                    allow_stdin: false
                }).onIOPub = (msg: KernelMessage.IIOPubMessage) => ContentHelpers.interpretOutput(msg, kernelName))
                .catch(reason => vscode.window.showErrorMessage(String(reason)));
        }
        // Show an error message if the kernel required has not been initialised.
        else{
            vscode.window.showErrorMessage("The " + kernelName + " kernel is not available");
        }
    }

    /**
     * Look for modules to import in the current souce file (if python)
     * and ask the user if they want to import them.
     */
    autoImportModules() {
        if (!vscode.window.activeTextEditor) return;

        let activeDocument = vscode.window.activeTextEditor.document;

        if(!this.alreadyImportedDocs.has(activeDocument.uri)) {
            this.alreadyImportedDocs.add(activeDocument.uri);
            let docText = activeDocument.getText();
            let importList = docText.match(/import .+|from .+ import .+/g);
            if (importList) {
                vscode.window.showInformationMessage(importList.length + ' imports were found in the current python file. Import now?', 'Import')
                    .then(data => {
                        if(data === 'Import') {
                            this.executeCode(importList.join('\n'), 'python3');
                        }
                    });
            }
        }
    }

}