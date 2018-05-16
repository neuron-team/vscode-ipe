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

export class CardComponent implements OnInit {

  @Input() card: Card;
  //Movment of cards up/down
  @Output() onMove = new EventEmitter();
  //Select a card
  @Output() onSelect = new EventEmitter();
  //Delete
  @Output() onDelete = new EventEmitter();

  titleEdit: boolean;
  state: string = 'notSelected';
  constructor(public AppComponent: AppComponent, public sanitizer: DomSanitizer) { }

   //Toggle state for animation
  toggleState() {
    this.state = this.state === 'selected' ? 'notSelected' : 'selected';
  }
  //Emit to parent app.component.ts
  move(direction:string){
    this.onMove.emit({dir: direction,card: this.card});
  }

  selectCard(){
    this.toggleState();
    this.onSelect.emit(this.card);
  }

  deleteCard(){
    this.onDelete.emit(this.card);
  }


  ngOnInit() {
  }
}
