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
        let fileName = path.join(folderPath, '/newHelloWorld.txt').slice(1);

        // call a function that converts Card type to cell type

        // convert the array of cards into a .ipynb file

        fs.writeFile(fileName, 'hey there', err => {
            if (err) console.log(err);
            console.log(fileName);
            // Also, pop out information box to show that it has been saved
        });

        // fire an event to onExportToJupyter
        this._onExportToJupyter.fire();
    }



}


