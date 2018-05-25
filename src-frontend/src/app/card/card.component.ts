import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { Card } from 'vscode-ipe-types';
import { Pipe, PipeTransform } from '@angular/core';

import { AppComponent } from '../app.component';
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
        borderColor: '#2874A6',
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
  @Input() selectMode: boolean = false;
  @Input() selected: boolean = false;
  //Movement of cards up/down
  @Output() onMove = new EventEmitter();
  //Select a card
  @Output() onSelect = new EventEmitter<boolean>();
  //Delete
  @Output() onDelete = new EventEmitter<void>();

  editingTitle: boolean;
  constructor(public sanitizer: DomSanitizer) { }


  move(direction: string) {
    this.onMove.emit({direction: direction});
  }

  selectCard() {
    this.onSelect.emit();
  }

  deleteCard() {
    this.onDelete.emit();
  }

}
