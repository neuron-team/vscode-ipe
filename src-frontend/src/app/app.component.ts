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

  /* Undo button */
  showingUndoButton: boolean = false;
  undoContent = 1;
  undoButtonTimer = null;

  constructor(private extension: ExtensionService, private regexService: RegexService) {
    extension.onAddCard.subscribe(card => {
      this.addCard(card);
    });
  }

  showUndoButton(cards: number) {
    this.undoContent = cards;
    this.showingUndoButton = true;
    if (this.undoButtonTimer) {
      clearTimeout(this.undoButtonTimer);
    }
    setTimeout(() => {
      this.undoButtonTimer = null;
      this.showingUndoButton = false;
    }, 10000);
  }

  updateFilters(filters: any): void {
    this.typeFilters = filters;
    this.checkVisible();
  }

  updateSearch(search: string): void {
    this.searchQuery = search;
    this.checkVisible();
  }

  /* Visible cards */
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

  checkVisible() {
    for (let card of this.cards) {
      this.visibleCards.set(card, this.cardMatchesFilter(card) && this.cardMatchesSearchQuery(card));
    }
  }

  /* Selecting */
  cardSelected(card: Card) {
    if (this.selectedCards.has(card)) {
      this.selectedCards.delete(card);
    } else {
      this.selectedCards.add(card);
    }
  }

  updateSelecting() {
    this.isSelecting = !this.isSelecting;
    if (!this.isSelecting) {
      this.selectedCards = new Set<Card>();
    }
  }

  deleteSelectedCards() {
    let indexes = []

    this.selectedCards.forEach(value => {
      const index: number = this.cards.indexOf(value);
      if (index > -1) {
        indexes.push(index)
        this.cards.splice(index, 1);
      }
    })
    this.extension.deleteSelectedCards(indexes);
    this.showUndoButton(indexes.length);
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
      this.extension.moveCardUp(index);
    }
  }

  moveDown(card: Card) {
    const index: number = this.cards.indexOf(card);
    if (index > -1 && index < this.cards.length - 1) {
      const tmp: Card = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tmp;
      this.extension.moveCardDown(index);
    }
  }

  export() {
    let indexes = null;
    if (this.isSelecting) {
      indexes = this.cards
          .filter(card => this.selectedCards.has(card))
          .map((card, index) => index);
    }
    this.extension.jupyterExport(indexes);
  }

  openBrowser(card: Card) {
    const index: number = this.cards.indexOf(card);
    this.extension.openInBrowser(index);
  }


  addCard(card: Card) {
    this.cards.push(card);
    this.scrollToBottom();
  }

  deleteCard(card: Card) {
    const index: number = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);
      this.extension.deleteCard(index);
      this.showUndoButton(1);
    }
  }

  /* Backend Communication */
  collapseOutput(card: Card, value: boolean) {
    const index: number = this.cards.indexOf(card);
    this.extension.collapseOutput(index, value);
  }

  collapseCode(card: Card, value: boolean) {
    const index: number = this.cards.indexOf(card);
    this.extension.collapseCode(index, value);
  }

  collapseCard(card: Card, value: boolean) {
    const index: number = this.cards.indexOf(card);
    this.extension.collapseCard(index, value);
  }

  changeTitle(card: Card, newTitle: string) {
    const index: number = this.cards.indexOf(card);
    this.extension.changeCardTitle(index, newTitle);
  }

  editCustomCard(card: Card) {
    const index: number = this.cards.indexOf(card);
    this.extension.editCustomCard(index, card);
  }

  undoClicked() {
    this.extension.undoClicked();
    this.showingUndoButton = false;
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
    this.extension.addCustomCard(markdownCard);
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
