import { EventEmitter, Injectable} from '@angular/core';

import { Card } from 'vscode-ipe-types';
declare var acquireVsCodeApi;

@Injectable()
export class ExtensionService {

  onAddCard: EventEmitter<Card> = new EventEmitter();
  private vscode = acquireVsCodeApi();

  constructor() {
    window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      if (message.command === 'add-card') {
        this.onAddCard.next(message.card);
      }
    });
  }

  moveCardUp(index: number) {
    this.vscode.postMessage({command: 'moveCardUp', index: index})
  }

  moveCardDown(index: number) {
    this.vscode.postMessage({command: 'moveCardDown', index: index})
  }

  deleteCard(index: number) {
    this.vscode.postMessage({command: 'deleteCard', index: index})
  }

  changeCardTitle(index: number, newTitle: string) {
    this.vscode.postMessage({command: 'changeTitle', index: index, newTitle: newTitle})
  }

  collapseCode(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseCode', index: index, value: value})
  }

  collapseOutput(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseOutput', index: index, value: value})
  }

  collapseCard(index: number, value: boolean) {
    this.vscode.postMessage({command: 'collapseCard', index: index, value: value})
  }

  addCustomCard(card: Card) {
    this.vscode.postMessage({command: 'addCustomCard', card: card})
  }

  editCustomCard(index: number, newCard: Card) {
    this.vscode.postMessage({command: 'editCustomCard', index: index, card: newCard})
  }

  jupyterExport(indexes: number[]) {
    this.vscode.postMessage({command: 'jupyterExport', indexes: indexes})
  }

  openInBrowser(index: number) {
    this.vscode.postMessage({command: 'openInBrowser', index: index})
  }

  undoClicked() {
    this.vscode.postMessage({command: 'undoClicked'})
  }
}
