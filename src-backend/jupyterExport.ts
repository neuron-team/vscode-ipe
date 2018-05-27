import {Card} from 'vscode-ipe-types';
import * as fs from "fs";
import * as path from "path";

import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";
import { JSONObject, JSONArray } from '@phosphor/coreutils';

export class JupyterExport {
    private _onExportComplete : EventEmitter<void> = new EventEmitter();
    get onExportComplete(): Event<void> { return this._onExportComplete.event; }
    
    private metadataPy = {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "codemirror_mode": {
                "name": "ipython",
                "version": 3
            },
            "file_extension": ".py",
            "mimetype": "text/x-python",
            "name": "python",
            "nbconvert_exporter": "python",
            "pygments_lexer": "ipython3",
            "version": "3.6.4"
        }
    };

    private metadataR = {
        "kernelspec": {
            "display_name": "R",
            "language": "R",
            "name": "ir"
        },
        "language_info": {
            "codemirror_mode": "r",
            "file_extension": ".r",
            "mimetype": "text/x-r-source",
            "name": "R",
            "pygments_lexer": "r",
            "version": "3.5.0"
        }
    };

    cardsExecuted: Array<Card> = [];

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('ipe.exportToJupyter', () => {
            this.exportToJupyter();
        }));
    }

    addCard(card: Card){
        this.cardsExecuted.push(card);
    }

    private writeToFile(jupyterFileData: JSONObject, kernelName: string) {
        let fullPath = vscode.window.activeTextEditor.document.uri.path;
        let fileName = fullPath.replace(new RegExp(path.extname(fullPath)+'$'), '_'+kernelName+'.ipynb').slice(1);
        if((jupyterFileData['cells'] as JSONArray).length){
            fs.writeFile(fileName, JSON.stringify(jupyterFileData), err => {
                if (err) console.log(err);
                vscode.window.showInformationMessage(`Saved as: ${fileName}`);
                // Also, pop out information box to show that it has been saved
            });
        }
    }

    private exportToJupyter() {
        let jupyterFileDataPython: JSONObject, jupyterFileDataR: JSONObject;
        jupyterFileDataPython = {
            "nbformat": 4,
            "nbformat_minor": 2
        };
        jupyterFileDataR = {
            "nbformat": 4,
            "nbformat_minor": 2
        };

        jupyterFileDataPython["metadata"] = this.metadataPy;
        jupyterFileDataR["metadata"] = this.metadataR;

        let pyJupyterData: Array<JSONObject> = [], rJupyterData: Array<JSONObject> = [];
        this.cardsExecuted
            .map(el => {
                if(el.kernel === 'python3') {
                    pyJupyterData.push(el.jupyterData as JSONObject);
                }
                else if(el.kernel === 'r') {
                    rJupyterData.push(el.jupyterData as JSONObject);
                }
            });

        jupyterFileDataPython["cells"] = pyJupyterData;
        jupyterFileDataR["cells"] = rJupyterData;

        this.writeToFile(jupyterFileDataPython, 'python3');
        this.writeToFile(jupyterFileDataR, 'r');

        // fire an event to onExportToJupyter
        this._onExportComplete.fire();
    }
}


