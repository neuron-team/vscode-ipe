import { AfterViewInit, Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ExtensionService } from './classes/extension.service';
import { Card, CardOutput } from 'vscode-ipe-types';
import { RegexService } from './classes/regex.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:resize)': 'onWindowResize()'
  }
})
export class AppComponent implements AfterViewInit {

  cards: Card[] = [];

  isSelecting = false;
  selectedCards = new Set<Card>();
  visibleCards = new Map<Card, boolean>();
  searchQuery = '';
  typeFilters = {
    text: true,
    rich: true,
    error: true
  };

  constructor(private extension: ExtensionService, private regexService: RegexService) {
    extension.onAddCard.subscribe(card => {
      this.addCard(card);
    });
  }

  /* Type Filtering called via emitter in toolbar*/
  updateFilters(event: { search: string, filters: any }): void {
    this.searchQuery = event.search;
    this.typeFilters = event.filters;
    for (let card of this.cards) {
      this.visibleCards.set(card, this.cardMatchesFilter(card) && this.cardMatchesSearchQuery(card));
    }
  }

  /* Searching */
  cardMatchesSearchQuery(card: Card): boolean {
    if (this.searchQuery === '') { return true; }

    let regexResult = this.regexService.regexQuery(this.searchQuery);
    if (regexResult) { // Regex search
      if (regexResult.test(card.title) || regexResult.test(card.sourceCode)) { return true; }
    }
    else { // Normal search
      let pattern = this.searchQuery.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/gi, '\\$&');
      if (new RegExp(pattern, 'gi').test(card.title) || new RegExp(pattern, 'gi').test(card.sourceCode)) { return true; }
    }
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
  cardSelected(card: Card) {
    if (this.selectedCards.has(card)) {
      this.selectedCards.delete(card);
    } else {
      this.selectedCards.add(card);
    }
  }

  updateSelecting(mode: boolean) {
    this.isSelecting = mode;
  }

  deleteSelectedCards() {
    this.selectedCards.forEach(value => {
      this.deleteCard(value);
    })
  }

  selectAll() {
    if (this.selectedCards.size == this.cards.length) {
      this.selectedCards = new Set<Card>();
    } else {
      this.selectedCards = new Set<Card>(this.cards);
    }
  }


  /* Ordering */
  cardMoved(card: Card, direction: string) {
    if (direction === "up") this.moveUp(card);
    else if (direction === "down") this.moveDown(card);
  }

  moveUp(card: Card) {
    const index: number = this.cards.indexOf(card, 1);
    if (index > -1) {
      const tmp: Card = this.cards[index - 1];
      this.cards[index - 1] = this.cards[index];
      this.cards[index] = tmp;
      this.extension.onMoveCardUp.next(index);
    }
  }

  moveDown(card: Card) {
    const index: number = this.cards.indexOf(card);
    if (index > -1 && index < this.cards.length - 1) {
      const tmp: Card = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tmp;
      this.extension.onMoveCardDown.next(index);
    }
  }

  addCard(card: Card) {
    this.cards.push(card);
    this.scrollToBottom();
  }

  deleteCard(card: Card) {
    const index: number = this.cards.indexOf(card);
    if (index > -1) { 
      this.cards.splice(index, 1); 
      this.extension.onDeleteCard.next(index);
    }
  }

  collapseOutput(card: Card, value: boolean){
    const index: number = this.cards.indexOf(card);
    this.extension.onCollapseOutput.next({index: index, value: value});
  }

  collapseCode(card: Card, value: boolean){
    const index: number = this.cards.indexOf(card);
    this.extension.onCollapseCode.next({index: index, value: value});
  }

  collapseCard(card: Card, value: boolean){
    const index: number = this.cards.indexOf(card);
    this.extension.onCollapseCard.next({index: index, value: value});
  }

  changeTitle(card: Card, newTitle: string){
    const index: number = this.cards.indexOf(card);
    this.extension.onChangeTitle.next({index: index, newTitle: newTitle});
  }

  private windowResizeThrottle;
  onWindowResize() {
    // make sure all scripted HTML fragments are re-sized appropriately.
    // this can be a bit inefficient, but it's only executed on window resize,
    // which doesn't happen very often anyway
    clearTimeout(this.windowResizeThrottle);
    this.windowResizeThrottle = setTimeout(() => {
      for (let card of this.cards) {
        for (let output of card.outputs) {
          if (output.type === 'text/html') {
            const o = output.output;
            output.output = '';
            setTimeout(() => { output.output = o; });
          }
        }
      }
    }, 400);
  }

  newMarkdownCard() {
    let markdownCard = new Card(0, '', '*Click to edit markdown*', [], {}, '');
    markdownCard.isCustomMarkdown = true;
    this.cards.push(markdownCard);
    this.scrollToBottom();
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
