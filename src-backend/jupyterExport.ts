import {Card} from 'vscode-ipe-types';
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
        let fullPath = vscode.window.activeTextEditor.document.uri.path;
        let fileName = fullPath.replace(new RegExp(path.extname(fullPath)+'$'), '.ipynb').slice(1);
        let extName = path.extname(fullPath);

        let jupyterFileData = {
            "nbformat": 4,
            "nbformat_minor": 2
        };

        let metadataPy = {
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

        let metadataR = {
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

        switch (extName) {
            case 'py':
                jupyterFileData["metadata"] = metadataPy; 
                break;
            case 'r':
                jupyterFileData["metadata"] = metadataR;
                break;
            default:
                jupyterFileData["metadata"] = metadataPy;
                break;
        }

        jupyterFileData["cells"] = this.cardsExecuted.map(el => el.jupyterData);

        fs.writeFile(fileName, JSON.stringify(jupyterFileData), err => {
            if (err) console.log(err);
            console.log("Saved as: " + fileName);
            vscode.window.showInformationMessage(`Saved as: ${fileName}`);
            // Also, pop out information box to show that it has been saved
        });

        // fire an event to onExportToJupyter
        this._onExportToJupyter.fire();
    }



}


