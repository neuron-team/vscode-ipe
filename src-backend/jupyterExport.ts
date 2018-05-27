import {Card} from 'vscode-ipe-types';
import * as fs from "fs";

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

    private writeToFile(jupyterFileData: JSONObject, kernelName: string) {
        let fullPath = vscode.window.activeTextEditor.document.uri.path;

        let pathWithoutExtension = path => path.replace(/\.[^/\\.]+$/, '');
        let fileName = pathWithoutExtension(fullPath) + '_' + kernelName + '.ipynb';

        if((jupyterFileData['cells'] as JSONArray).length > 0) {
            fs.writeFile(fileName, JSON.stringify(jupyterFileData), err => {
                if (err) {
                    console.log(err);
                } else {
                    vscode.window.showInformationMessage(`Exported to ${fileName}`);
                }
            });
        }
    }

    exportToJupyter(cardsToExport: Card[]) {

        let pythonData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataPy,
            "cells": cardsToExport
                .filter(card => card.kernel === 'python3')
                .map(card => card.jupyterData as JSONObject)
        };

        let rData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataR,
            "cells": cardsToExport
                .filter(card => card.kernel === 'r')
                .map(card => card.jupyterData as JSONObject)
        };

        this.writeToFile(pythonData, 'python3');
        this.writeToFile(rData, 'r');

        // let everyone know we're done
        this._onExportComplete.fire();
    }
}


