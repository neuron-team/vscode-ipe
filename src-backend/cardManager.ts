import { Card, CardOutput } from 'vscode-ipe-types';
import * as path from "path";
import * as fs from "fs";
import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";
import { JSONObject, JSONArray } from '@phosphor/coreutils';
import { ContentHelpers } from './contentHelpers';

export class CardManager {
    private _onOpenNotebook : EventEmitter<string> = new EventEmitter();
    get onOpenNotebook(): Event<string> { return this._onOpenNotebook.event; }

    private cards: Card[] = [];
    public lastDeletedCards: Card[] = [];

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
                            this._onOpenNotebook.fire(path.basename(filePath));
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
        if (index > 0 && index < this.cards.length) {
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
        if (index > -1 && index < this.cards.length) {
            this.lastDeletedCards = [this.cards[index]];
            this.cards.splice(index, 1);
        }
    }

    deleteSelectedCards(indexes: number[]){
        this.lastDeletedCards =
            indexes
                .filter(index => index > -1)
                .map(index => {
                    let card = this.cards[index];
                    this.cards.splice(index, 1);
                    return card;
                });
    }

    changeTitle(index: number, newTitle: string) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].title = newTitle;
        }
    }
    
    collapseCode(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].codeCollapsed = value;
        }
    }

    collapseOutput(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].outputCollapsed = value;
        }
    }

    collapseCard(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].collapsed = value;
        }
    }

    addCustomCard(card: Card) {
        let cardToAdd = card;
        cardToAdd.id = ContentHelpers.assignId();
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
        if (index > -1 && index < this.cards.length) {
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

    importJupyter(jsonContent: JSONObject, fileName: string) {
        try{
            (jsonContent['cells'] as JSONArray)
                .map(cell => {
                    let source = cell['source'];
                    if(Array.isArray(source)){
                        source = source.join('');
                    }

                    let newCard = new Card(   
                        ContentHelpers.assignId(),
                        ContentHelpers.makeCardTitle(source),
                        source,
                        this.processJupyterOutputs(cell['outputs'] as JSONArray),
                        cell as object,
                        jsonContent['metadata']['kernelspec']['name'] as string
                    );
                    
                    if(cell['cell_type'] == 'markdown'){
                        newCard.isCustomMarkdown = true;
                    }
                    return newCard;
                })
                .map(newCard => ContentHelpers.addNewCard(newCard));
            
            let language: string;
            switch(jsonContent['metadata']['kernelspec']['name']) {
                case 'python3': 
                    language = 'python';
                    break
                case 'ir':
                    language = 'r';
            }
            let content =
                (jsonContent['cells'] as JSONArray)
                    .map(cell => {
                        let source = cell['source'];
                        if(Array.isArray(source)){
                            source = source.join('');
                        }
                        return source;
                    })
                    .join('\n')

            vscode.workspace.openTextDocument({language: language, content: content})
                .then(textDocument => vscode.window.showTextDocument(textDocument));
        }
        catch(err){
            vscode.window.showInformationMessage('The Jupyter notebook file entered is in an unknown format');
            console.log(err);
        }
    }

    processJupyterOutputs(outputs: JSONArray): CardOutput[] {
        if(!outputs){
            return null
        }
        else{
            return outputs.map(output => {
                let keys = Object.keys(output);
    
                if(keys.indexOf('name') > -1) {
                    let value = '';
                    if(typeof output['text'] === 'string') {
                        value = output['text'];
                    } else {
                        value = output['text'].join('');
                    }
    
                    return new CardOutput(
                        'stdout',
                        value
                    )
                } else if(keys.indexOf('traceback') > -1) {
                    return new CardOutput(
                        'error',
                        (output['traceback'] as string[]).join('\n')
                    )
                } else {
                    let type = ContentHelpers.chooseTypeFromComplexData(output['data']);
                    console.log(type);
                    return new CardOutput(
                        type,
                        output['data'][type]
                    )
                }
            })
        }
        
    }
}


