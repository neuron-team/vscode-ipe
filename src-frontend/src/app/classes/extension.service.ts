import {EventEmitter, Injectable} from '@angular/core';

import { Card } from 'vscode-ipe-types';

@Injectable()
export class ExtensionService {

  onAddCard: EventEmitter<Card> = new EventEmitter();

  constructor() {
    window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      if (message.command === 'add-card') {
        this.onAddCard.next(message.card);
      }
    });
  }

}
