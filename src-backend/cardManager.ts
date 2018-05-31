import {Card} from 'vscode-ipe-types';
import * as path from "path";
import * as fs from "fs";
import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";
import { JSONObject, JSONArray } from '@phosphor/coreutils';

export class CardManager {
    private _onOpenNotebook : EventEmitter<string> = new EventEmitter();
    get onOpenNotebook(): Event<string> { return this._onOpenNotebook.event; }
    
    private cards: Card[] = [];

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

    private writeToFile(jupyterFileData: JSONObject, kernelName: string, fileName: string) {
        if (!vscode.workspace.workspaceFolders) throw "You must have a workspace open to export the files";
        let fullPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        let filePath = '';
        if (!fileName) {
            filePath = path.join(fullPath, 'output_' + kernelName + '.ipynb');
        } else {
            filePath = path.join(fullPath, fileName)
        }

        if((jupyterFileData['cells'] as JSONArray).length > 0) {
            try {
                fs.writeFileSync(filePath, JSON.stringify(jupyterFileData), {encoding: 'utf8', flag: 'w'});
                vscode.window.showInformationMessage(`Exported ${kernelName} cards to ${filePath}`, 'Open in browser')
                    .then(selection => {
                        if (selection === 'Open in browser') {
                            this._onOpenNotebook.fire(fileName);
                        }
                    });
            } catch {
                throw "Unable to save exported Jupyter file";
            }
        }
    }

    exportToJupyter(indexes: number[] = null, fileName: string = null) {
        let cardsToExport: Card[];
        
        if (indexes) {
            cardsToExport = indexes.map(index => this.cards[index]);
        } else {
            cardsToExport = this.cards;
        }

        
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
                .filter(card => card.kernel === 'ir')
                .map(card => card.jupyterData as JSONObject)
        };

        try {
            this.writeToFile(pythonData, 'python3', fileName);
            this.writeToFile(rData, 'r', fileName);
        } catch (err) {
            vscode.window.showErrorMessage(err);
        }
    }

    getCardId(index: number) {
        return this.cards[index].id;
    }

    addCard(card: Card) {
        this.cards.push(card);
    }

    moveCardUp(index: number) {
        if (index > -1) {
            const tmp: Card = this.cards[index - 1];
            this.cards[index - 1] = this.cards[index];
            this.cards[index] = tmp;
        }
    }

    moveCardDown(index: number) {
        if (index > -1 && index < this.cards.length - 1) {
            const tmp: Card = this.cards[index + 1];
            this.cards[index + 1] = this.cards[index];
            this.cards[index] = tmp;
        }
    }

    deleteCard(index: number) {
        if (index > -1) { this.cards.splice(index, 1); }
    }

    changeTitle(index: number, newTitle: string) {
        if (index > -1) {
            this.cards[index].title = newTitle;
        }
    }
    
    collapseCode(index: number, value: boolean) {
        if (index > -1) {
            this.cards[index].codeCollapsed = value;
        }
    }

    collapseOutput(index: number, value: boolean) {
        if (index > -1) {
            this.cards[index].outputCollapsed = value;
        }
    }

    collapseCard(index: number, value: boolean) {
        if (index > -1) {
            this.cards[index].collapsed = value;
        }
    }

    addCustomCard(card: Card, id: number) {
        let cardToAdd = card;
        cardToAdd.id = id;
        if(cardToAdd.isCustomMarkdown) {
            cardToAdd.kernel = 'python3';
            cardToAdd.jupyterData = 
                {
                    "cell_type": "markdown",
                    "metadata": {},
                    "source": cardToAdd.sourceCode
                };
        }
        this.cards.push(cardToAdd);
    }

    editCustomCard(index: number, card: Card) {
        if (index > -1) {
            let cardEdited = card;
            if(cardEdited.isCustomMarkdown){
                cardEdited.kernel = 'python3';
                cardEdited.jupyterData = 
                    {
                        "cell_type": "markdown",
                        "metadata": {},
                        "source": cardEdited.sourceCode
                    };
            }
            this.cards[index] = cardEdited;
        }
    }
}


