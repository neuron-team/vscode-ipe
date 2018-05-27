import { EventEmitter, Injectable} from '@angular/core';

import { Card } from 'vscode-ipe-types';
declare var acquireVsCodeApi;

@Injectable()
export class ExtensionService {

  onAddCard: EventEmitter<Card> = new EventEmitter();
  private vscode = acquireVsCodeApi();

  onMoveCardUp: EventEmitter<number> = new EventEmitter();
  onMoveCardDown: EventEmitter<number> = new EventEmitter();
  onDeleteCard: EventEmitter<number> = new EventEmitter();
  onChangeTitle: EventEmitter<{index: number, newTitle: string}> = new EventEmitter();
  onCollapseCode: EventEmitter<{index: number, value: boolean}> = new EventEmitter();
  onCollapseOutput: EventEmitter<{index: number, value: boolean}> = new EventEmitter();
  onCollapseCard: EventEmitter<{index: number, value: boolean}> = new EventEmitter();

  constructor() {
    window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      if (message.command === 'add-card') {
        this.onAddCard.next(message.card);
      }
    });

    this.onMoveCardUp.subscribe(index => this.vscode.postMessage({
      command: 'moveCardUp',
      index: index
    }));
    this.onMoveCardDown.subscribe(index => this.vscode.postMessage({
      command: 'moveCardDown',
      index: index
    }));
    this.onDeleteCard.subscribe(index => this.vscode.postMessage({
      command: 'deleteCard',
      index: index
    }));
    this.onChangeTitle.subscribe(data => this.vscode.postMessage({
      command: 'changeTitle',
      index: data.index,
      newTitle: data.newTitle
    }));
    this.onCollapseCode.subscribe(data => this.vscode.postMessage({
      command: 'collapseCode',
      index: data.index,
      value: data.value
    }));
    this.onCollapseOutput.subscribe(data => this.vscode.postMessage({
      command: 'collapseOutput',
      index: data.index,
      value: data.value
    }));
    this.onCollapseCard.subscribe(data => this.vscode.postMessage({
      command: 'collapseCard',
      index: data.index,
      value: data.value
    }));
  }
}
