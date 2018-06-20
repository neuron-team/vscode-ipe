import {Component, EventEmitter, Input, Output} from '@angular/core';

/**
 * Manages all functions of markdown card type.
 */
@Component({
  selector: 'app-custom-markdown',
  templateUrl: './custom-markdown.component.html',
  styleUrls: ['./custom-markdown.component.css']
})
export class CustomMarkdownComponent {

  /**
   * Status of Editing. True if markdown is in edit mode.
   */
  editingMarkdown: boolean = false;

  /**
   * Status of card collapsed state. True if collapsed.
   */
  @Input() collapsed: boolean = false;

  /**
   * Status of isSelecting. True if in Select Mode.
   */
  @Input() disableMouseEvents: boolean = false;

  /**
   * Markdown card content.
   */
  @Input() markdownSource: string = '';

  /**
   * EventEmitter for Markdown update. Received by card.component.
   * @param string Markdown text
   */
  @Output() markdownChanged = new EventEmitter<string>();

  constructor() { }

  /**
   * Turns on editing mode.
   */
  startEditing() {
    this.editingMarkdown = true;
  }

  /**
   * Turns off editing mode without saving changes.
   */
  cancelEditing() {
    this.editingMarkdown = false;
  }

  /**
   * Turns off editing mode.
   * Emits event with new markdown text.
   */
  doneEditing(newValue: string) {
    this.editingMarkdown = false;
    this.markdownChanged.emit(newValue);
  }

}
