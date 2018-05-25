import { Card, CardOutput } from 'vscode-ipe-types';
import * as fs from "fs";
import * as path from "path";

import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";

export class JupyterExport{
    private _onExportToJupyter : EventEmitter<void> = new EventEmitter();
    get onExportToJupyter(): Event<void> { return this._onExportToJupyter.event; }
    
    cardsExecuted: Array<Card> = [];

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('ipe.exportToJupyter', () => {
            this.exportToJupyter();
        }));
    }

    addCard(card: Card){
        this.cardsExecuted.push(card);
    }

    private exportToJupyter(){
        let folderPath = path.dirname(vscode.window.activeTextEditor.document.uri.path)
        let fileName = path.join(folderPath, '/newHelloWorld.ipynb').slice(1);

        // call a function that converts Card type to cell type
        let jupyterFileData = {
            "metadata": {
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
            },
            "nbformat": 4,
            "nbformat_minor": 2
        };

        jupyterFileData["cells"] = this.cardsExecuted.map(el => el.jupyterData);
        console.log(jupyterFileData)




        // convert the array of cards into a .ipynb file

        fs.writeFile(fileName, JSON.stringify(jupyterFileData), err => {
            if (err) console.log(err);
            console.log(fileName);
            // Also, pop out information box to show that it has been saved
        });

        // fire an event to onExportToJupyter
        this._onExportToJupyter.fire();
    }



}


