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
  @Input() visible: boolean = true;
  @Input() searchQuery: string = '';
  @Input() card: Card;
  @Input() isSelecting: boolean = false;
  @Input() selected: boolean = false;
  //Movement of cards up/down
  @Output() onMove = new EventEmitter();
  //Select a card
  @Output() onSelect = new EventEmitter<boolean>();
  //Delete
  @Output() onDelete = new EventEmitter<void>();
  @Output() onChangeTitle = new EventEmitter();
  @Output() onCollapseCode = new EventEmitter();
  @Output() onCollapseOutput = new EventEmitter();
  @Output() onCollapseCard = new EventEmitter();
  @Output() onEditCustomCard = new EventEmitter();

  editingTitle: boolean = false;
  editingMarkdown: boolean = false;

  constructor(public sanitizer: DomSanitizer) { }


  move(direction: string) {
    this.onMove.emit({direction: direction});
  }

  selectCard() {
    if (this.isSelecting) {
      this.onSelect.emit();
    }
  }

  deleteCard() {
    this.onDelete.emit();
  }

  collapseOutput(value: boolean){
    this.onCollapseOutput.emit({value: value});
  }

  collapseCode(value: boolean){
    this.onCollapseCode.emit({value: value});
  }

  collapseCard(value: boolean){
    this.onCollapseCard.emit({value: value});
  }

  changeTitle(newTitle: string){
    this.onChangeTitle.emit({newTitle: newTitle});
  }

  editCustomCard(){
    this.onEditCustomCard.emit();
  }
}
