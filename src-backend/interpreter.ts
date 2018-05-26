import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';
import { JSONValue, JSONObject } from '@phosphor/coreutils';
import {Card, CardOutput} from 'vscode-ipe-types';

import * as vscode from 'vscode';
import {Event, EventEmitter} from "vscode";

export class Interpreter {

    // serverSettings, used to establish a basic connection with the server
    private serverSettings: ServerConnection.ISettings;
    
    // // List of running kernels
    // private runningKernels: Kernel.IModel[] = [];

    // Kernel promise used for code execution
    private kernelPromise = {};
    
    private docUriList: vscode.Uri[] = [];

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
        
        for(let key in this.kernelPromise) {
            this.kernelPromise[key].then(kernel => kernel.shutdown());
        }
        this.kernelPromise = {};
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
                .then(kernel => kernel.requestExecute({code : source, stop_on_error: false, allow_stdin: false}).onIOPub = ContentHelpers.interpretOutput)
                .catch(reason => vscode.window.showErrorMessage(String(reason)));
        }
        else{
            vscode.window.showErrorMessage("The " + kernelName + " kernel is not available");
        }
    }

    autoImportModules() {
        let docUri = vscode.window.activeTextEditor.document.uri;
        if(this.docUriList.indexOf(docUri) === -1) {
            this.docUriList.push(docUri);
            let docText = vscode.window.activeTextEditor.document.getText();
            let importList = docText.match(/import .+|from .+ import .+/g);
            vscode.window.showInformationMessage(importList.length + ' imports were found in the current python file. Import now?', 'Import')
            .then(data => {
                if(data) { 
                    this.executeCode(importList.join('\n'), 'python3');
                }
            });
        }
    }

}

export class ContentHelpers {
    // Used to store temporary card data
    static sourceTmp = '';
    static contentTmp: Array<CardOutput> = [];
    static id = 0;
    static jupyterData: JSONObject = {};

    private static _onStatusChanged: EventEmitter<string> = new EventEmitter();
    static get onStatusChanged(): Event<string> { return this._onStatusChanged.event; }

    private static _onCardReady: EventEmitter<Card> = new EventEmitter();
    static get onCardReady(): Event<Card> { return this._onCardReady.event; }

    static makeCardTitle(source: string) : string {
        let firstLine = source.split('\n')[0];

        let funcName = firstLine.match(/([a-z]+)\(.*\)/i);
        if (funcName) {
            return funcName[1] + "()";
        }

        return firstLine;
    }

    // Validate Json received
    static validateData(inputData : JSONValue, field : string): inputData is JSONObject
    {
        return (<JSONObject>inputData)[field] !== undefined;
    }

    static interpretOutput(msg: KernelMessage.IIOPubMessage){
        // Get the Json content of the output
        //let content = msg.content;
        console.log(msg.content);
        ContentHelpers.processContent(msg);
    }

    static processContent(msg: KernelMessage.IIOPubMessage){
        // Process execution state ['busy', 'idle']
        if('execution_state' in msg.content){
            let status = msg.content['execution_state'];
            if(status === 'idle'){
                this.makeCard();
            }
            if(typeof status === 'string'){
                this._onStatusChanged.fire(status);
            }
        // Receive back the source code
        } else if('code' in msg.content){
            let code = msg.content['code'];
            if(typeof code === 'string'){
                this.sourceTmp = code;
            }
            this.jupyterData['cell_type'] = 'code';
            this.jupyterData['execution_count'] = msg.content.execution_count;
            this.jupyterData['source'] = (msg.content.code as string).split('\n').map((el) => el+'\n');
        // The output is stdout
        } else if('name' in msg.content){
            let output = msg.content['text'];
            if(typeof output === 'string'){
                this.contentTmp.push(new CardOutput('stdout', output));
            }
        // The output is rich
        } else if('data' in msg.content){
            let data = msg.content.data;
            this.contentTmp.push(this.interpretRich(data));
        // The code could not be executed, an error was returned
        } else if(['ename', 'evalue', 'traceback'].every(value => value in msg.content)) {
            let ename = msg.content['ename'];
            let evalue = msg.content['evalue'];
            this.getMissingModule(evalue as string);
            let traceback = (msg.content['traceback'] as string[]).join('\n');
            this.contentTmp.push(new CardOutput('error', traceback));
        }

        if(!('execution_state' in msg.content) && !('code' in msg.content)){
            this.jupyterData['metadata'] = msg.metadata;
            let outputs = msg.content;
            outputs['output_type'] = msg.header.msg_type;
            if('transient' in outputs){
                delete outputs['transient'];
            }
            this.jupyterData['outputs'] = [outputs];
        }
    }

    static interpretRich(data: JSONValue): CardOutput{
        let chosenType = this.chooseTypeFromComplexData(data);
        let output: string = '';

        if(chosenType === 'application/vnd.plotly.v1+json'){
            let plotlyJson = data[chosenType];
            if(ContentHelpers.validateData(plotlyJson, 'data')){
                let guid = this.generateGuid();
                output = 
                    '<div id="' + guid + '" style="height: 525px; width: 100%;" class="plotly-graph-div">'
                    + '</div><script type="text/javascript">require(["plotly"], function(Plotly)'
                    + '{ window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("'
                    + guid + '",' + JSON.stringify(plotlyJson.data) + ', {}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>';
            }
            chosenType = 'text/html';
        }
        else{
            output = data[chosenType];
        }
        return new CardOutput(chosenType, output);
    }

    static getMissingModule(evalue: string){
        let moduleMatch = evalue.match(/No module named \'(.+?)\'/);
        if(moduleMatch){
            let module = moduleMatch[1].replace(/\'/g, '');
            vscode.window.showInformationMessage('Jupyter requires the module \'' + moduleMatch[1] + '\' to be installed. Install now?', 'Install')
                .then(data => {
                    if(data) { 
                        this.installMissingModule(module);
                    }
                });
        }
    }

    static installMissingModule(module: string){
        if (module) {
            let terminal = vscode.window.createTerminal('pip');
            terminal.show();
            terminal.sendText('pip install '+module, true);
        }
    }

    static chooseTypeFromComplexData(data: JSONValue) {
        let validDataTypes = 
            ['application/vnd.jupyter', 'application/vnd.jupyter.cells',
            'application/vnd.jupyter.dragindex', 'application/x-ipynb+json', 
            'application/geo+json', 'application/vnd.plotly.v1+json', 
            'application/vdom.v1+json', 'text/html', 'image/svg+xml', 
            'image/png', 'image/jpeg', 'text/markdown', 'application/pdf', 
            'text/latex', 'application/json', 'text/plain']
            .filter(dataType => this.validateData(data, dataType));
        return validDataTypes[0];
    }

    static makeCard(){
        if(!("metadata" in this.jupyterData) && !("outputs" in this.jupyterData)){
            this.jupyterData['metadata'] = {};
            this.jupyterData['outputs'] = [];
        }

        this._onCardReady.fire(
            new Card(
                this.id, 
                this.makeCardTitle(this.sourceTmp), 
                this.sourceTmp, 
                this.contentTmp, 
                JSON.parse(JSON.stringify(this.jupyterData))
            )
        );

        this.contentTmp = []
        this.jupyterData = {}
        this.id++;
    }

    static generateGuid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}
