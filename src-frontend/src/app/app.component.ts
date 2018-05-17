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
    new Card(0, 'sample card', 'print("Hello, world!")', [new CardOutput('stdout', 'Hello, world!')])
  ];

  selectedCards: number[] = [];
  visibleCards = new Map<Card,boolean>();

  searchQuery = '';
  typeFilters = {
    text: true,
    rich: true,
    error: true
  };

  ngOnInit() {
  }

  /* Type Filtering called via emitter in toolbar*/
  updateFilters(event: {search: string, filters: any}): void {
    this.searchQuery = event.search;
    this.typeFilters = event.filters;
    for (let card of this.cards){
      this.visibleCards.set(card,this.cardMatchesFilter(card) && this.cardMatchesSearchQuery(card));
    }
  }

  /* Searching */
  cardMatchesSearchQuery(card: Card): boolean {
    if (this.searchQuery == '') { return true; }
    if (card.title.search(new RegExp(this.searchQuery, "i")) > -1) { return true; }
    if (card.sourceCode.search(new RegExp(this.searchQuery, "i")) > -1) { return true; }
    return false;
  }

  cardMatchesFilter(card: Card): boolean {
    if (card.outputs.length === 0) return this.typeFilters.text; // treat empty cards as plain

    for (let output of card.outputs) {
      if (output.type == 'stdout' || output.type == 'text/plain') { // plain text
        if (this.typeFilters.text) return true;
      } else if (output.type == 'error') { // code errors
        if (this.typeFilters.error) return true;
      } else { // anything else is rich output
        if (this.typeFilters.rich) return true;
      }
    }
    return false;
  }

  /* Selecting - will remove/add element if it's in/not_in array */
  onSelect(id: number): void {
    const index: number = this.selectedCards.indexOf(id, 1);
    if (index > -1) { this.selectedCards.splice(index);
    } else { this.selectedCards.push(id); }
  }

  /* Ordering */
  onMove({dir: direction, card: card}): void {
    if(direction === "up") this.moveUp(card);
    else if (direction ==="down") this.moveDown(card);
  }

  moveUp(card: Card): void {
    const index: number = this.cards.indexOf(card, 1);
    if (index > -1){
      const tmp: Card = this.cards[index - 1];
      this.cards[index - 1] = this.cards[index];
      this.cards[index] = tmp;
    }
  }

  moveDown(card: Card): void {
    const index: number = this.cards.indexOf(card);
    if (index > -1 && index < this.cards.length - 1){
      const tmp: Card = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tmp;
    }
  }

  onDelete(card: Card): void {
    const index: number = this.cards.indexOf(card);
    if (index > -1) { this.cards.splice(index, 1); }
  }

  addCard(card: Card) {
    this.cards.push(card);
    this.scrollToBottom();
  }

  constructor(private extension: ExtensionService) {
    extension.onAddCard.subscribe(card => {
      this.addCard(card);
    });
  }

  /* this code ensures that the list always scrolls to the bottom when new elements are added */
  @ViewChildren('listItems') listItems: QueryList<any>;
  @ViewChild('scrollingList') scrollContainer;
  ngAfterViewInit() {
    //this.listItems.changes.subscribe(() => this.scrollToBottom());
    this.scrollToBottom();
  }
  scrollToBottom() {
    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 0);
  }
}
