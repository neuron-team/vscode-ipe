import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-custom-markdown',
  templateUrl: './custom-markdown.component.html',
  styleUrls: ['./custom-markdown.component.css']
})
export class CustomMarkdownComponent {
  editingMarkdown: boolean = false;

  @Input() disableMouseEvents: boolean = false;
  @Input() markdownSource: string = '';

  @Output() markdownChanged = new EventEmitter<string>();

  constructor() { }

  startEditing() {
    this.editingMarkdown = true;
  }

  cancelEditing() {
    this.editingMarkdown = false;
  }

  doneEditing(newValue: string) {
    this.editingMarkdown = false;
    this.markdownChanged.emit(newValue);
  }

}
