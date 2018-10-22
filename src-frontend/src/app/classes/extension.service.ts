import { EventEmitter, Injectable} from '@angular/core';

import { Card } from 'neuron-ipe-types';
declare var acquireVsCodeApi;

@Injectable()
export class ExtensionService {

  onAddCard: EventEmitter<Card> = new EventEmitter();
  
  // Acquire vscode api for communication with the backend
  private vscode = acquireVsCodeApi();

  constructor() {
    window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      if (message.command === 'add-card') {
        this.onAddCard.next(message.card);
      }
    });
  }

  /**
   * Notify the backend that a card has been moved up.
   * @param index Index of the card moved up.
   */
  moveCardUp(index: number) {
    this.vscode.postMessage({command: 'moveCardUp', index: index})
  }

  /**
   * Notify the backend that a card has been moved down.
   * @param index Index of the card moved down.
   */
  moveCardDown(index: number) {
    this.vscode.postMessage({command: 'moveCardDown', index: index})
  }

  /**
   * Notify the backend that a card has been removed.
   * @param index Index of the card deleted.
   */
  deleteCard(index: number) {
    this.vscode.postMessage({command: 'deleteCard', index: index})
  }

  /**
  * Notify the backend that a group of cards have been deleted.
  * @param indexes  Array containing the indexes of the cards deleted.
  */
  deleteSelectedCards(indexes: number[]) {
    this.vscode.postMessage({command: 'deleteSelectedCards', indexes: indexes})
  }

  /**
   * Notify the backend that the title of a card has been changed.
   * @param index     Index of the card whose title has been changed.
   * @param newTitle  New title of the card.
   */
  changeCardTitle(index: number, newTitle: string) {
    this.vscode.postMessage({command: 'changeTitle', index: index, newTitle: newTitle})
  }

  /**
   * Notify the backend that the source code of a card has been collapsed or expanded.
   * @param index Index of the card.
   * @param value Boolean, true for collapsed, false for expanded.
   */
  collapseCode(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseCode', index: index, value: value})
  }

  /**
   * Notify the backend that the output of a card has been collapsed or expanded.
   * @param index Index of the card.
   * @param value Boolean, true for collapsed, false for expanded.
   */
  collapseOutput(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseOutput', index: index, value: value})
  }

  /**
   * Notify the backend that a card has been collapsed.
   * @param index Index of the card.
   * @param value Boolean, true for collapsed, false for expanded.
   */
  collapseCard(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseCard', index: index, value: value})
  }

  /**
   * Notify the backend that a custom card (markdown card) has been added
   * in the frontend.
   * @param card  Card added.
   */
  addCustomCard(card: Card) {
    this.vscode.postMessage({command: 'addCustomCard', card: card})
  }

  /**
   * Notify the backend that a custom card (markdown card) has been modified.
   * @param index   Index of the card modified.
   * @param newCard New version of the card.
   */
  editCustomCard(index: number, newCard: Card) {
    this.vscode.postMessage({command: 'editCustomCard', index: index, card: newCard})
  }

  /**
   * Notify the backend that the user wants to export cards
   * to a Jupyter Notebook file (.ipynb).
   * @param indexes Array containing the indexes of the cards to export.
   */
  jupyterExport(indexes: number[]) {
    this.vscode.postMessage({command: 'jupyterExport', indexes: indexes})
  }
  
  /**
   * Notify the backend that the user wants to open a card in
   * the browser.
   * @param index Index of the card to open in the browser. 
   */
  openInBrowser(index: number) {
    this.vscode.postMessage({command: 'openInBrowser', index: index})
  }

  /**
   * Notify the backend that the user has pressed
   * the undo button on the snackbar.
   */
  undoClicked() {
    this.vscode.postMessage({command: 'undoClicked'})
  }

  /**
   * Notify the backend that the user wants to save the pdf
   * output included in a card.
   * @param pdf Pdf file in base64 encoding.
   */
  savePdf(pdf: string) {
    this.vscode.postMessage({command: 'savePdf', pdf: pdf})
  }
}
