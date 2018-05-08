import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ExtensionService} from './classes/extension.service';
import {Card, CardOutput} from "vscode-ipe-types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  cards: Card[] = [
    new Card(0, 'sample card', 'print("Hello, world!");', [new CardOutput('plaintext', 'Hello, world!')])
  ];

  constructor(private extension: ExtensionService) {
    extension.onAddCard.subscribe(card => {
      this.cards.push(card);
    });
  }


  /* this code ensures that the list always scrolls to the bottom when new elements are added */
  @ViewChildren('listItems') listItems: QueryList<any>;
  @ViewChild('scrollingList') scrollContainer;
  ngAfterViewInit() {
    this.listItems.changes.subscribe(() => this.scrollToBottom());
    this.scrollToBottom();
  }
  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
