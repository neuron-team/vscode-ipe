import {Component, Input, Output, EventEmitter} from '@angular/core';
import { Card } from 'vscode-ipe-types';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Manages all functions of a card in the Output Pane.
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  animations: [
    trigger('cardState', [
      state('selected',   style({
        borderColor: '#0077c6',
        transform: 'scale(1.0)'
      })),
      transition('notSelected => selected', animate('100ms ease-in')),
      transition('selected => notSelected', animate('100ms ease-out'))
    ])
  ]
})

export class CardComponent {

  /**
   * Card Visiblity.
   */
  @Input() visible: boolean = true;

  /**
   * Search query in search box.
   */
  @Input() searchQuery: string = '';

  /**
   * Card Details.
   */
  @Input() card: Card;

  /**
   * Status of Selecting. True if user is selecting (in Select Mode).
   */
  @Input() isSelecting: boolean = false;

  /**
   * Card selection status.
   */
  @Input() selected: boolean = false;


  /**
   * EventEmitter for Moving. Received by app.component.
   */
  @Output() onMove = new EventEmitter();

  /**
   * EventEmitter for Selecting card. Received by app.component.
   * @param boolean Status of Select
   */
  @Output() onSelect = new EventEmitter<boolean>();

  /**
   * EventEmitter for Deleting card. Received by app.component.
   */
  @Output() onDelete = new EventEmitter<void>();

  /**
   * EventEmitter for Opening card in broswer. Received by app.component.
   */
  @Output() onOpenBrowser = new EventEmitter<void>();

  /**
   * EventEmitter for Updating Title. Received by app.component.
   */
  @Output() onChangeTitle = new EventEmitter();

  /**
   * EventEmitter for Collasping Code. Received by app.component.
   */
  @Output() onCollapseCode = new EventEmitter();

  /**
   * EventEmitter for Collasping Output. Received by app.component.
   */
  @Output() onCollapseOutput = new EventEmitter();

  /**
   * EventEmitter for Collasping Card. Received by app.component.
   */
  @Output() onCollapseCard = new EventEmitter();

  /**
   * EventEmitter for Editing Markdown Card. Received by app.component.
   */
  @Output() onEditCustomCard = new EventEmitter();

  /**
   * EventEmitter for Saving PDF. Received by app.component.
   */
  @Output() onSavePdf = new EventEmitter();

  editingTitle: boolean = false;

  constructor(public sanitizer: DomSanitizer) { }

  /**
   * Emits event move arrow buttons are pressed.
   * @param string direction
   */
  move(direction: string) {
    this.onMove.emit({direction: direction});
  }

  /**
   * Emits event when card is pressed when isSelection is true (in select mode).
   */
  selectCard() {
    if (this.isSelecting) {
      this.onSelect.emit();
    }
  }

  /**
   * Emits event when "Delete" button is pressed.
   */
  deleteCard() {
    this.onDelete.emit();
  }

  /**
   * Emits event when "Open in Browser" button is pressed.
   */
  openIn() {
    this.onOpenBrowser.emit()
  }

  /**
   * Toggles outputCollapsed state.
   * Emits event when output is collapsed.
   */
  collapseOutput() {
    this.card.outputCollapsed = !this.card.outputCollapsed;
    this.onCollapseOutput.emit({value: this.card.outputCollapsed});
  }

  /**
   * Toggles codeCollapsed state.
   * Emits event when code is collapsed.
   */
  collapseCode() {
    this.card.codeCollapsed = !this.card.codeCollapsed;
    this.onCollapseCode.emit({value: this.card.codeCollapsed});
  }

  /**
   * Toggles collapsed state.
   * Emits event when card is collapsed.
   */
  collapseCard() {
    this.card.collapsed = !this.card.collapsed;
    this.editingTitle = false;
    this.onCollapseCard.emit({value: this.card.collapsed});
  }

  /**
   * Emits event when title is changed.
   * Turns off Title Editing.
   */
  changeTitle() {
    this.editingTitle = false;
    this.onChangeTitle.emit({newTitle: this.card.title});
  }

  /**
   * Emits event when pdf markdown card is updated.
   * @param string Markdown content
   */
  editCustomMarkdown(newSource: string) {
    this.card.sourceCode = newSource;
    this.onEditCustomCard.emit();
  }

  /**
   * Emits event when pdf is saved.
   */
  savePdf(pdf: string) {
    this.onSavePdf.emit({pdf: pdf});
  }
}
