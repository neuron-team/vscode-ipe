import { AfterViewInit, Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ExtensionService } from './classes/extension.service';
import { Card, CardOutput } from 'vscode-ipe-types';
import { RegexService } from './classes/regex.service';


/**
 * Manages the entire app in the Output Panel.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:resize)': 'onWindowResize()'
  }
})
export class AppComponent implements AfterViewInit {

  /**
   * Array of all Cards.
   */
  cards: Card[] = [];


  /**
   * Status of Selecting. True if user is selecting (in Select Mode).
   */
  isSelecting = false;

  /**
   * Set of Selected Cards.
   */
  selectedCards = new Set<Card>();

  /**
   * Map of Cards and there visibility.
   */
  visibleCards = new Map<Card, boolean>();

  /**
   * Search query in search box.
   */
  searchQuery = '';

  /**
   * Status of Filters
   */
  typeFilters = {
    text: true,
    rich: true,
    error: true
  };


  /**
   * Indicates if the Undo Snackbar is displayed.
   */
  showingUndoButton: boolean = false;

  /**
   * String to be displayed on Undo Snackbar
   */
  undoContent: string = 'Card deleted';

  /**
   * Timer for Undo Snackbar
   */
  undoButtonTimer = null;


  constructor(private extension: ExtensionService, private regexService: RegexService) {
    extension.onAddCard.subscribe(card => {
      this.addCard(card);
    });
  }

  /**
   * Displays the Undo Snackbar for 10 seconds when a card is deleted.
   * @param cards Number of deleted cards
   */
  showUndoButton(cards: number) {
    if (cards == 1) {
      this.undoContent = `Card deleted`
    } else {
      this.undoContent = `${cards} cards deleted`
    }

    this.showingUndoButton = true;
    if (this.undoButtonTimer) {
      clearTimeout(this.undoButtonTimer);
    }
    this.undoButtonTimer = setTimeout(() => {
      this.undoButtonTimer = null;
      this.showingUndoButton = false;
    }, 10000);
  }

  /**
   * Updates selected filters and calls checkVisible to updates visible cards.
   * @param filters typeFilters
   */
  updateFilters(filters: any): void {
    this.typeFilters = filters;
    this.checkVisible();
  }

  /**
   * Updates search query and calls checkVisible to updates visible cards.
   * @param search SearchQuery
   */
  updateSearch(search: string): void {
    this.searchQuery = search;
    this.checkVisible();
  }
  /**
   * Checks if the card title/sourceCode has any characters matching the search query
   * @param card    Card to investigate
   * @returns       Returns true if title/source code of card matches regex/normal search
   */
  cardMatchesSearchQuery(card: Card): boolean {
    if (this.searchQuery === '') { return true; }

    let regexResult = this.regexService.regexQuery(this.searchQuery);
    // Regex search
    if (regexResult) { 
      if (regexResult.test(card.title) || regexResult.test(card.sourceCode)) { return true; }
    }
    // Normal search
    else { 
      let pattern = this.searchQuery.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/gi, '\\$&');
      if (new RegExp(pattern, 'gi').test(card.title) || new RegExp(pattern, 'gi').test(card.sourceCode)) { return true; }
    }
    return false;
  }
  /**
   * Checks if card has matching output to user selected filter
   * @param card    Card to investigate
   * @returns       Returns true if any of the card output matches any of the filters
   */
  cardMatchesFilter(card: Card): boolean {
    if (card.outputs && card.outputs.length === 0) return this.typeFilters.text; 

    for (let output of card.outputs) {
      // plain text
      if (output.type == 'stdout' || output.type == 'text/plain') { 
        if (this.typeFilters.text) return true;
      // code errors
      } else if (output.type == 'error') { 
        if (this.typeFilters.error) return true;
      // anything else is rich output (e.g. graphs)
      } else { 
        if (this.typeFilters.rich) return true;
      }
    }
    return false;
  }

  /**
   * Updates the map visibleCards so that only cards matching searcg and filters are displayed.
   */
  checkVisible() {
    for (let card of this.cards) {
      this.visibleCards.set(card, this.cardMatchesFilter(card) && this.cardMatchesSearchQuery(card));
    }
  }

/**
 * Toggles a cards selected state and updates the set of selectedCards.
 * @param card Selected Card
 */
  cardSelected(card: Card) {
    if (this.selectedCards.has(card)) {
      this.selectedCards.delete(card);
    } else {
      this.selectedCards.add(card);
    }
  }

/**
 * Toggles isSelecting (Selection Mode).
 * Resets selectedCards if toggling off.
 */
  updateSelecting() {
    this.isSelecting = !this.isSelecting;
    if (!this.isSelecting) {
      this.selectedCards = new Set<Card>();
    }
  }

/**
 * Deletes cards in the selectedCards set.
 */
  deleteSelectedCards() {
    let indexes = []

    this.selectedCards.forEach(value => {
      const index: number = this.cards.indexOf(value);
      if (index > -1) {
        indexes.push(index)
        this.cards.splice(index, 1);
      }
    })
    this.extension.deleteSelectedCards(indexes); // Informs backend of card deletion
    this.showUndoButton(indexes.length);
  }

  /**
   * Selects all cards and adds them to selectedCards.
   * If selectedCards already includes all cards then selectedCards is reset.
   */
  selectAll() {
    if (this.selectedCards.size == this.cards.length) {
      this.selectedCards = new Set<Card>();
    } else {
      this.selectedCards = new Set<Card>(this.cards);
    }
  }

  /**
   * Moves card in direction.
   * @param card Card being moved
   * @param direction "up" or "down"
   */
  cardMoved(card: Card, direction: string) {
    if (direction === "up") this.moveUp(card);
    else if (direction === "down") this.moveDown(card);
  }

  /**
   * Moves card position up on display.
   * @param card Card being moved
   */
  moveUp(card: Card) {
    const index: number = this.cards.indexOf(card, 1);
    if (index > -1) {
      const tmp: Card = this.cards[index - 1];
      this.cards[index - 1] = this.cards[index];
      this.cards[index] = tmp;
      this.extension.moveCardUp(index);
    }
  }

  /**
   * Moves card position down on display.
   * @param card Card being moved
   */
  moveDown(card: Card) {
    const index: number = this.cards.indexOf(card);
    if (index > -1 && index < this.cards.length - 1) {
      const tmp: Card = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tmp;
      this.extension.moveCardDown(index);
    }
  }

  /**
   * Exports cards. 
   * If isSelecting is true only exports cards in selectedCards.
   */
  export() {
    let indexes = null;
    if (this.isSelecting) {
      indexes = this.cards
          .filter(card => this.selectedCards.has(card))
          .map((card, index) => index);
    }
    this.extension.jupyterExport(indexes);
  }

  /**
   * Save pdf output.
   * @param pdf pdf file encoded in base64.
   */
  savePdf(pdf: string) {
    this.extension.savePdf(pdf);
  }

  /**
   * Opens card in broswer.
   * @param card Card to be viewed
   */
  openBrowser(card: Card) {
    const index: number = this.cards.indexOf(card);
    this.extension.openInBrowser(index);
  }

/**
 * Creates a new card at the buttom of the Output Pane and scrolls to it.
 * @param card 
 */
  addCard(card: Card) {
    this.cards.push(card);
    this.scrollToBottom();
  }
/**
 * Deletes Card.
 * @param card Card to be deleted
 */
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
          if (output.type == 'text/html' || output.type == 'application/vnd.plotly.v1+json') {
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
