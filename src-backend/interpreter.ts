import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';
import {Card, CardOutput} from 'vscode-ipe-types';
import { ContentHelpers } from './contentHelpers';

import * as vscode from 'vscode';
import {Event, EventEmitter} from "vscode";

export class Interpreter {

    // serverSettings, used to establish a basic connection with the server
    private serverSettings: ServerConnection.ISettings;

    // Kernel promise used for code execution
    private kernelPromise = {};
    
    private alreadyImportedDocs = new Set<vscode.Uri>();

    constructor(){}

    connectToServer(baseUrl: string, token: string) {
        this.serverSettings = ServerConnection.makeSettings(
            {
                baseUrl: baseUrl, 
                pageUrl: "", 
                wsUrl: baseUrl.replace('http', 'ws'), 
                token: token, 
                init: {cache: "no-store", credentials: "same-origin"}
            });
    }

    startKernel(kernelName: string) {
        if(!(kernelName in this.kernelPromise)) {
            let options: Kernel.IOptions = { name : kernelName, serverSettings : this.serverSettings };
            this.kernelPromise[kernelName] = Kernel.startNew(options);
            if (kernelName === 'python3'){
                this.executeCode('%matplotlib inline', 'python3');
            }
        }
    }

    restartKernels() {
        let activeKernels: string[] = Object.keys(this.kernelPromise);

        for(let key in this.kernelPromise) {
            this.kernelPromise[key].then(kernel => kernel.shutdown());
        }
        this.kernelPromise = {};

        activeKernels.forEach(el => this.startKernel(el));
    }

    openNotebookInBrowser(filename: string = null) {
        let uri;
        let baseUrl = this.serverSettings.baseUrl;
        let token = this.serverSettings.token;
        if (filename) {
            uri = vscode.Uri.parse(baseUrl + 'notebooks/' + filename + '?token=' + token);
        } else {
            uri = vscode.Uri.parse(baseUrl + '?token=' + token);
        }
        vscode.commands.executeCommand('vscode.open', uri);
    }

    // Execute given code and return the result as a string
    executeCode(source : string, kernelName: string) {
        if(kernelName in this.kernelPromise){
            this.kernelPromise[kernelName]
                .then(kernel => kernel.requestExecute({
                    code : source.replace('\r\n', '\n'),
                    stop_on_error: false,
                    allow_stdin: false
                }).onIOPub = (msg: KernelMessage.IIOPubMessage) => ContentHelpers.interpretOutput(msg, kernelName))
                .catch(reason => vscode.window.showErrorMessage(String(reason)));
        }
        else{
            vscode.window.showErrorMessage("The " + kernelName + " kernel is not available");
        }
    }

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