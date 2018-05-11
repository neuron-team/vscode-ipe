import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ExtensionService} from './classes/extension.service';
import {Card, CardOutput} from 'vscode-ipe-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  cards: Card[] = [
    new Card(0, 'sample card', 'print("Hello, world!");', [new CardOutput('plaintext', 'Hello, world!')])
  ];

  selectedCards: number[] = [];

  searchQuery = '';
  sortQuery = 'Oldest';
  typeQuery = {
    text: true,
    graph: true
  }

  /* Type Filtering */  //passed testing, waiting for backend card.outputs[i].type implementation
  toggleTypeQuery(typeStr: string): void {
    this.typeQuery[typeStr] = !this.typeQuery[typeStr];
  }
  onType(card: Card): boolean { //need to manually list all possible types
    // if (this.typeQuery.text && card.sourceCode === 'print("Hello")') return true;
    // if (this.typeQuery.text && this.typeQuery.graph) return true;
    for (let i = 0; i < card.outputs.length; i++){
      if (this.typeQuery.text && card.outputs[i].type === 'text') return true;
      if (this.typeQuery.graph && card.outputs[i].type === 'graph') return true;
    }
    //return false;
    return true; //now pass every card through (no filtering); must be changed to false
  }

  /* Sorting */ //passed testing, waiting for backend card.id implementation
  onSort(): void {
    if (this.sortQuery === 'Oldest'){ //must change to compare ids
      this.cards.sort(function(a, b) {return (a.sourceCode > b.sourceCode) ? 1 : ((b.sourceCode > a.sourceCode) ? -1 : 0); } );
    } else if (this.sortQuery === 'Newest') { //must change to compare ids
      this.cards.sort(function(a, b) {return (a.sourceCode > b.sourceCode) ? -1 : ((b.sourceCode > a.sourceCode) ? 1 : 0); } );
    } else if (this.sortQuery === 'Alphabetical: A-Z') {
      this.cards.sort(function(a, b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0); } );
    } else if (this.sortQuery === 'Alphabetical: Z-A') {
      this.cards.sort(function(a, b) {return (a.title > b.title) ? -1 : ((b.title > a.title) ? 1 : 0); } );
    }
  }

  onSelect(id: number): void {
    const index: number = this.selectedCards.indexOf(id, 1);
    if (index > -1) { this.selectedCards.splice(index);
    } else { this.selectedCards.push(id); }
  }

  /* Ordering */
  moveUp(card: Card): void {
    const index: number = this.cards.indexOf(card, 1);
    if (index > -1){
      const tmp: Card = this.cards[index - 1];
      this.cards[index - 1] = this.cards[index];
      this.cards[index] = tmp;
      this.sortQuery = 'Custom';
    }
  }

  moveDown(card: Card): void {
    const index: number = this.cards.indexOf(card);
    if (index > -1 && index < this.cards.length - 1){
      const tmp: Card = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tmp;
      this.sortQuery = 'Custom';
    }
  }

  /* Deleting */
  delete(card: Card): void {
    const index: number = this.cards.indexOf(card);
    if (index > -1) { this.cards.splice(index, 1); }
  }

  constructor(private extension: ExtensionService) {
    extension.onAddCard.subscribe(card => {
      this.cards.push(card);
       this.onSort();
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
    } catch (err) { }
  }
}
