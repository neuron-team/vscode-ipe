import { Component } from '@angular/core';
import {ExtensionService} from './classes/extension.service';
import {Card} from "vscode-ipe-types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cards: Card[] = [new Card('sample card', 'print("Hello, world!");', 'Hello, world!')];

  constructor(private extension: ExtensionService) {
    extension.onAddCard.subscribe(card => {
      this.cards.push(card);
    });
  }
}
