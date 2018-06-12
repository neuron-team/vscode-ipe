import { JSONValue, JSONObject, JSONArray } from '@phosphor/coreutils';
import {Card, CardOutput} from 'vscode-ipe-types';
import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';

import * as vscode from 'vscode';
import {Event, EventEmitter} from "vscode";

export class ContentHelpers {
    // Used to store temporary card data
    static sourceTmp = '';
    static contentTmp: Array<CardOutput> = [];
    static id = 0;
    static jupyterData: JSONObject = {};
    static currentKernel: string;

    private static _onStatusChanged: EventEmitter<string> = new EventEmitter();
    static get onStatusChanged(): Event<string> { return this._onStatusChanged.event; }

    private static _onCardReady: EventEmitter<Card> = new EventEmitter();
    static get onCardReady(): Event<Card> { return this._onCardReady.event; }

    static makeCardTitle(id: number) : string {
        return `Card ${id}`;
    }

    // Validate Json received
    static validateData(inputData : JSONValue, field : string): inputData is JSONObject
    {
        return (<JSONObject>inputData)[field] !== undefined;
    }

    static interpretOutput(msg: KernelMessage.IIOPubMessage, kernelName: string) {
        // Get the Json content of the output
        // let content = msg.content;
        // console.log(msg.content);
        ContentHelpers.processContent(msg);
        this.currentKernel = kernelName;
    }

    static processContent(msg: KernelMessage.IIOPubMessage) {
        // Process execution state ['busy', 'idle']
        if('execution_state' in msg.content) {
            let status = msg.content['execution_state'];
            if(status === 'idle') {
                this.makeCard();
            }
            if(typeof status === 'string') {
                this._onStatusChanged.fire(status);
            }
        // Receive back the source code
        } else if('code' in msg.content) {
            let code = msg.content['code'];
            if(typeof code === 'string') {
                this.sourceTmp = code;
            }
            this.jupyterData['cell_type'] = 'code';
            this.jupyterData['execution_count'] = msg.content.execution_count;
            this.jupyterData['source'] = (msg.content.code as string).split('\n').map((el) => el+'\n');
        // The output is stdout
        } else if('name' in msg.content) {
            let output = msg.content['text'];
            if(typeof output === 'string') {
                this.contentTmp.push(new CardOutput('stdout', output));
            }
        // The output is rich
        } else if('data' in msg.content) {
            let data = msg.content.data;
            this.contentTmp.push(this.interpretRich(data));
        // The code could not be executed, an error was returned
        } else if(['ename', 'evalue', 'traceback'].every(value => value in msg.content)) {
            let evalue = msg.content['evalue'];
            this.getMissingModule(evalue as string);
            let traceback = (msg.content['traceback'] as string[]).join('\n');
            this.contentTmp.push(new CardOutput('error', traceback));
        }

        if(!('execution_state' in msg.content) && !('code' in msg.content)) {
            this.jupyterData['metadata'] = msg.metadata;
            let output = msg.content;
            output['output_type'] = msg.header.msg_type;
            if('transient' in output) {
                delete output['transient'];
            }
            if(this.jupyterData['outputs']) {
                (this.jupyterData['outputs'] as JSONArray).push(output);
            } else {
                this.jupyterData['outputs'] = [output];
            }
            
        }
    }

    static interpretRich(data: JSONValue): CardOutput {
        let chosenType = this.chooseTypeFromComplexData(data);
        let output: string = data[chosenType];
        return new CardOutput(chosenType, output);
    }

    static getMissingModule(evalue: string) {
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

    static installMissingModule(module: string) {
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

    static makeCard() {
        if(!("metadata" in this.jupyterData) && !("outputs" in this.jupyterData)) {
            this.jupyterData['metadata'] = {};
            this.jupyterData['outputs'] = [];
        }

        this._onCardReady.fire(
            new Card(
                this.id, 
                this.makeCardTitle(this.id), 
                this.sourceTmp, 
                this.contentTmp, 
                JSON.parse(JSON.stringify(this.jupyterData)),
                this.currentKernel
            )
        );

        this.contentTmp = [];
        this.jupyterData = {};
        this.id++;
    }
    
    static addNewCard(card: Card) {
        this._onCardReady.fire(card);
    }
	
	static assignId() {
		return this.id++;
	}
}
