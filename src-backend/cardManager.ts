import { Card, CardOutput } from 'neuron-ipe-types';
import * as path from "path";
import * as fs from "fs";
import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";
import { JSONObject, JSONArray } from '@phosphor/coreutils';
import { ContentHelpers } from './contentHelpers';

/**
 * Class maintaining an array of the exising cards in the backend.
 * Member functions allow the reordering and modification of cards.
 * It includes utilities to import and export to a Jupyter Notebook file.
 */
export class CardManager {
    /**
     * Event triggared when a Jupyter Notebook file (.ipynb) is imported by the user.
     */
    private _onOpenNotebook : EventEmitter<string> = new EventEmitter();
    get onOpenNotebook(): Event<string> { return this._onOpenNotebook.event; }

    /**
     * Array of existing cards.
     */
    private cards: Card[] = [];

    /**
     * Array containing the previously deleted cards.
     * Allows restore if the user decides to undo the deletion.
     */
    public lastDeletedCards: Card[] = [];

    /**
     * Holds the metadata required for python3 Jupyter Notebooks.
     */
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

    /**
     * Holds the metadata required for r Jupyter Notebooks.
     */
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

    // Add additional metadata here to support more kernels.

    /**
     * Write the Jupyter Notebook exported in json format to file.
     * After export is completed ask the user to open the exported file in the browser
     * through the exising Jupyter Notebook instance.
     * @param jupyterFileData   Json object containing the jupyter data exported.
     * @param kernelName        The name of the kernel for the current file being exported (python3 and r supported).
     * @param fileName 
     */
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

    /**
     * Export cards to a Jupyter file (.ipynb).
     * @param indexes   Array containing the indexes of the cards to export.
     * @param fileName  Filename of the Jupyter file (does not include the extension) to which the cards are exported.
     */
    exportToJupyter(indexes: number[] = null, fileName: string = null) {
        let cardsToExport: Card[];
        
        if (indexes) {
            cardsToExport = indexes.map(index => this.cards[index]);
        } else {
            cardsToExport = this.cards;
        }

        // Process python cards
        let pythonData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataPy,
            "cells": cardsToExport
                .filter(card => card.kernel === 'python3')
                .map(card => card.jupyterData as JSONObject)
        };

        // Process r cards
        let rData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataR,
            "cells": cardsToExport
                .filter(card => card.kernel === 'ir')
                .map(card => card.jupyterData as JSONObject)
        };

        // If a new kernel is added, add export processing here

        // Write cards to file
        try {
            this.writeToFile(pythonData, 'python3', fileName);
            this.writeToFile(rData, 'r', fileName);
        } catch (err) {
            vscode.window.showErrorMessage(err);
        }
    }

    /**
     * Get the id of the card from its index.
     * @param index Index of the card.
     */
    getCardId(index: number) {
        return this.cards[index].id;
    }

    /**
     * Add a card to the backend array.
     * @param card  Card to add.
     */
    addCard(card: Card) {
        this.cards.push(card);
    }

    /**
     * Move a card up in the backend array.
     * @param index Index of the card to move up.
     */
    moveCardUp(index: number) {
        if (index > 0 && index < this.cards.length) {
            const tmp: Card = this.cards[index - 1];
            this.cards[index - 1] = this.cards[index];
            this.cards[index] = tmp;
        }
    }

    /**
     * Move a card down in the backend array.
     * @param index Index of the card to move down.
     */
    moveCardDown(index: number) {
        if (index > -1 && index < this.cards.length - 1) {
            const tmp: Card = this.cards[index + 1];
            this.cards[index + 1] = this.cards[index];
            this.cards[index] = tmp;
        }
    }

    /**
     * Delete a card from the backend array.
     * @param index Index of the card to delete.
     */
    deleteCard(index: number) {
        if (index > -1 && index < this.cards.length) {
            this.lastDeletedCards = [this.cards[index]];
            this.cards.splice(index, 1);
        }
    }

    /**
     * Delete multiple cards from the backend array.
     * @param indexes   Array containing the indexes of the cards to delete.
     */
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

    /**
     * Change the title of a card in the backend array.
     * @param index     Index of the card whose title is changed.
     * @param newTitle  New title set for the card.
     */
    changeTitle(index: number, newTitle: string) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].title = newTitle;
        }
    }
    
    /**
     * Collpase or expand the code of card in the backend array.
     * @param index Index of the card whose code is collapsed or expanded.
     * @param value Boolean, true for collapse, false for expand.
     */
    collapseCode(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].codeCollapsed = value;
        }
    }

    /**
    * Collpase or expand the output of card in the backend array.
    * @param index Index of the card whose code is collapsed or expanded.
    * @param value Boolean, true for collapse, false for expand.
    */
    collapseOutput(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].outputCollapsed = value;
        }
    }

    /**
     * Collapse or expand a card in the backend array.
     * @param index Index of the card to collapse or expand.
     * @param value Boolean, true for collapse, false for expand.
     */
    collapseCard(index: number, value: boolean) {
        if (index > -1 && index < this.cards.length) {
            this.cards[index].collapsed = value;
        }
    }

    /**
     * Add custom card to the backend array.
     * Called when a card is added in the frontend.
     * This includes custom markdown cards in the
     * current implementation.
     * @param card  Card that was added from the frontend.
     */
    addCustomCard(card: Card) {
        let cardToAdd = card;
        cardToAdd.id = ContentHelpers.assignId();
        if(cardToAdd.isCustomMarkdown) {
            cardToAdd.kernel = 'python3';
            // Add relevant jupyter data
            cardToAdd.jupyterData = 
                {
                    "cell_type": "markdown",
                    "metadata": {},
                    "source": cardToAdd.sourceCode
                };
        }
        this.cards.push(cardToAdd);
    }

    /**
     * Edit a custom card in the backend array.
     * Called when a custom card is modified in the frontend.
     * E.g. the markdown content is changed. 
     * @param index Index of the card whose content is changed.
     * @param card  New version of the card.
     */
    editCustomCard(index: number, card: Card) {
        if (index > -1 && index < this.cards.length) {
            let cardEdited = card;
            if(cardEdited.isCustomMarkdown){
                cardEdited.kernel = 'python3';
                // Add relevant jupyter data
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

    /**
     * Import a Jupyter Notebook in json format.
     * @param jsonContent   The content of the Jupyter Notebook to import in json format.
     */
    importJupyter(jsonContent: JSONObject) {
        try{
            /**
             * Convert every cell in the Jupyter Notebook imported to a card
             * and add it to the backend and frontend arrays.
             */
            (jsonContent['cells'] as JSONArray)
                .map(cell => {
                    let source = cell['source'];
                    if(Array.isArray(source)){
                        source = source.join('');
                    }

                    let cardId = ContentHelpers.assignId();

                    let newCard = new Card(   
                        cardId,
                        ContentHelpers.makeCardTitle(cardId),
                        source,
                        this.processJupyterOutputs(cell['outputs'] as JSONArray),
                        cell as object,
                        jsonContent['metadata']['kernelspec']['name'] as string
                    );
                    
                    if(cell['cell_type'] == 'markdown') {
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

            /**
             * Generate a source file from the source fields of the
             * Jupyter Notebook imported.
             */
            let content = (jsonContent['cells'] as JSONArray)
                .map(cell => {
                    let source = '';
                    source = cell['source'];

                    if(Array.isArray(source)) {
                        if(cell['cell_type'] == 'markdown') {
                            source = source.map(el => `# ${el}`).join('');
                        }
                        else {
                            source = source.join('');
                        }
                    }
                    else {
                        if(cell['cell_type'] == 'markdown') {
                            source = `# ${source}`;
                        }
                    }

                    return source;
                })
                .join('\n');

            /**
             * Show the source file reconstructed to the user in a new pane.
             */
            vscode.workspace.openTextDocument({language: language, content: content})
                .then(textDocument => vscode.window.showTextDocument(textDocument));
        }
        catch(err){
            vscode.window.showInformationMessage('The Jupyter notebook file entered is in an unknown format');
        }
    }

    /**
     * Convert the outputs of the Jupyter Notebook imported
     * to CardOutput objects.
     * @param outputs   Jupyter Notebook outputs to convert.
     */
    processJupyterOutputs(outputs: JSONArray): CardOutput[] {
        if (!outputs) {
            return [];
        } else {
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
                    );
                } else if(keys.indexOf('traceback') > -1) {
                    return new CardOutput(
                        'error',
                        (output['traceback'] as string[]).join('\n')
                    );
                } else {
                    let type = ContentHelpers.chooseTypeFromComplexData(output['data']);
                    return new CardOutput(
                        type,
                        output['data'][type]
                    );
                }
            })
        }
        
    }

    /**
     * Reset the state of the backend array and of the id assignment.
     * Called when the webview is closed by the user.
     */
    resetState() {
        this.cards = [];
        ContentHelpers.resetId();
    }
}


