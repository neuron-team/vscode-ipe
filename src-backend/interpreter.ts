import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';
import { UserInteraction } from './userInteraction';
import {Card, CardOutput} from 'vscode-ipe-types';

import * as vscode from 'vscode';

export class Interpreter {

    // serverSettings, used to establish a basic connection with the server
    private serverSettings: ServerConnection.ISettings;

    // // List of running kernels
    // private runningKernels: Kernel.IModel[] = [];

    // Kernel promise used for code execution
    private kernelPromise = {};

    constructor(){}

    connectToServer(pageUrl: string, token: string){
        this.serverSettings = ServerConnection.makeSettings({pageUrl: pageUrl, token: token});
        
        for(var key in this.kernelPromise){
            this.kernelPromise[key].then(kernel => kernel.shutdown());
        }
        this.kernelPromise = {};
    }

    startKernel(kernelName: string){
        if(!(kernelName in this.kernelPromise)){
            let options = {name : kernelName, serverSettings : this.serverSettings};  
            this.kernelPromise[kernelName] = Kernel.startNew(options);
            if (kernelName === 'python3'){
                this.executeCode('%matplotlib inline', 'python3');
            }
        }
    }

    // // Get list of running kernels and maintain the internal list
    // getListOfRunning() : void {

    //     Kernel.listRunning(this.serverSettings).then(
    //         list => this.runningKernels = list
    //     );

    // }

    // connectToKernel(kernelId : Kernel.IModel) : void {
    //     this.kernelPromise = Kernel.connectTo(kernelId, this.serverSettings);
    // }

    // Execute given code and return the result as a string
    executeCode(source : string, kernelName: string) {
        if(kernelName in this.kernelPromise){
            this.kernelPromise[kernelName]
                .then(kernel => kernel.requestExecute({code : source, stop_on_error: false}).onIOPub = this.interpretOutput)
                .catch(reason => vscode.window.showErrorMessage(String(reason)));
        }
        else{
            vscode.window.showErrorMessage("The " + kernelName + " kernel is not available");
        }
    }

    interpretOutput(msg: KernelMessage.IIOPubMessage){
        // Get the Json content of the output
        let content = msg.content;
        console.log(content);
        ContentHelpers.processContent(content);
    }
}

export namespace ContentHelpers{
    // Used to store temporary card data
    let sourceTmp = '';
    let contentTmp: Array<CardOutput> = [];
    let id = 0;

    function makeCardTitle(source: string) : string {
        let firstLine = source.split('\n')[0];

        let funcName = firstLine.match(/([a-z]+)\(.*\)/i);
        if (funcName) {
            return funcName[1] + "()";
        }

        return firstLine;
    }

    // Validate Json received
    export function validateData(inputData : JSONValue, field : string): inputData is JSONObject
    {
        return (<JSONObject>inputData)[field] !== undefined;
    }

    export function processContent(content: JSONObject){
        // Process execution state ['busy', 'idle']
        if('execution_state' in content){
            let status = content['execution_state'];
            if(status === 'idle'){
                renderCard();
            }
            if(typeof status === 'string'){
                updateStatus(status);
            }
        // Receive back the source code
        } else if('code' in content){
            let code = content['code'];
            if(typeof code === 'string'){
                sourceTmp = code;
            }
        // The output is stdout
        } else if('name' in content){
            let output = content['text'];
            if(typeof output === 'string'){
                contentTmp.push(new CardOutput('stdout', output));
            }
        // The output is rich
        } else if('data' in content){
            let data = content.data;
            let output = extractComplexData(data);
            if(typeof output === 'string'){
                contentTmp.push(new CardOutput('text/html', output));
            }
        // The code could not be executed, an error was returned
        } else if(['ename', 'evalue', 'traceback'].reduce((accumulator, currentValue) => accumulator && currentValue in content,true)){
            let ename = content['ename'];
            let evalue = content['evalue'];
            let traceback = content['traceback'];
            if(['ename', 'evalue', 'traceback'].reduce((accumulator, currentValue) => accumulator && typeof currentValue === 'string', true)){
                contentTmp.push(new CardOutput('error', ename+'\n'+evalue+'\n'+traceback));
            }      
        }
    }

    function extractComplexData(data: JSONValue){

        let validDataTypes = 
            ['text/html', 'image/svg+xml', 'image/png', 'image/jpeg', 'text/markdown', 'application/pdf', 
            'text/latex', 'application/javascript', 'application/json', 'text/plain']
            .filter(dataType => validateData(data, dataType));
        return data[validDataTypes[0]];
    }

    function updateStatus(status: string){
        vscode.commands.executeCommand('ipe.updateStatus', status);
    }

    function renderCard(){
        if(id !== 0){
            vscode.commands.executeCommand('ipe.renderCard', new Card(id, makeCardTitle(sourceTmp), sourceTmp, contentTmp));
        }
        contentTmp = [];
        id++;
    }
}