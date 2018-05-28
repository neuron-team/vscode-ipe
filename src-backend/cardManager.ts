import {Card} from 'vscode-ipe-types';
import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import { Event, EventEmitter } from "vscode";
import { JSONObject, JSONArray } from '@phosphor/coreutils';

export class CardManager {
    private _onExportComplete : EventEmitter<void> = new EventEmitter();
    get onExportComplete(): Event<void> { return this._onExportComplete.event; }
    
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

    private writeToFile(jupyterFileData: JSONObject, kernelName: string) {
        let fullPath = vscode.window.activeTextEditor.document.uri.path;

        let fileName = fullPath.replace(new RegExp(path.extname(fullPath)+'$'), '_'+kernelName+'.ipynb').slice(1);

        if((jupyterFileData['cells'] as JSONArray).length > 0) {
            fs.writeFileSync(fileName, JSON.stringify(jupyterFileData), {encoding:'utf8',flag:'w'})
            vscode.window.showInformationMessage(`Exported to ${fileName}`);
        }
    }

    exportToJupyter() {
        let pythonData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataPy
        };

        let rData: JSONObject = {
            "nbformat": 4,
            "nbformat_minor": 2,
            "metadata": this.metadataR
        };

        let pyJupyterData: Array<JSONObject> = [], rJupyterData: Array<JSONObject> = [];

        this.cards.map(el => {
            if(el.kernel === 'python3') {
                pyJupyterData.push(el.jupyterData as JSONObject);
            }
            else if(el.kernel === 'r') {
                rJupyterData.push(el.jupyterData as JSONObject);
            }
        });

        pythonData["cells"] = pyJupyterData;
        rData["cells"] = rJupyterData;

        this.writeToFile(pythonData, 'python3');
        this.writeToFile(rData, 'r');

        // let everyone know we're done
        this._onExportComplete.fire();
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


