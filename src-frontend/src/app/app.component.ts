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
    image: true,
    application: true,
    error: true
  };

  /* Searching */
  onSearch(): void{

  }

  /* Type Filtering */
  toggleTypeQuery(typeStr: string): void {
    this.typeQuery[typeStr] = !this.typeQuery[typeStr];
  }

  /* Type Filtring */
  onType(card: Card): boolean { // need to manually list all possible types
    for (let i = 0; i < card.outputs.length; i++){
      if (this.typeQuery.text && (card.outputs[i].type.indexOf('text') > -1 || card.outputs[i].type === 'stdout')) { return true; }
      if (this.typeQuery.image && card.outputs[i].type.indexOf('image') > -1) { return true; }
      if (this.typeQuery.application && card.outputs[i].type.indexOf('application') > -1) { return true; }
      if (this.typeQuery.error && card.outputs[i].type.indexOf('error') > -1) { return true; }
    }
    return false;
  }

  /* Sorting */
  onSort(): void {
    if (this.sortQuery === 'Oldest'){
      this.cards.sort(function(a, b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0); } );
    } else if (this.sortQuery === 'Newest') {
      this.cards.sort(function(a, b) {return (a.id > b.id) ? -1 : ((b.id > a.id) ? 1 : 0); } );
    } else if (this.sortQuery === 'Alphabetical: A-Z') {
      this.cards.sort(function(a, b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0); } );
    } else if (this.sortQuery === 'Alphabetical: Z-A') {
      this.cards.sort(function(a, b) {return (a.title > b.title) ? -1 : ((b.title > a.title) ? 1 : 0); } );
    }
  }

  //On select will remove/add element if it's in/not in array
  onSelect(id: number): void {
    const index: number = this.selectedCards.indexOf(id, 1);
    if (index > -1) { this.selectedCards.splice(index);
    } else { this.selectedCards.push(id); }
  }

  /* Ordering */
  onMove({dir: direction,card: card}){
    if(direction === "up"){
      this.moveUp(card);
    }
    else if (direction ==="down"){
      this.moveDown(card);
    }
  }
  moveUp(card: Card): void {
    //card.sourceCode = card.outputs[0].type;
    //card.sourceCode = card.outputs.length.toString();
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

  onDelete(card: Card): void {
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
