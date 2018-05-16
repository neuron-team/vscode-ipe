import {Component, Input, OnInit} from '@angular/core';
import { Card } from 'vscode-ipe-types';
import { Pipe, PipeTransform } from '@angular/core';

import { AppComponent } from '../app.component';
import {trigger, state, style, animate, transition} from '@angular/animations';
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
  titleEdit: boolean;
  state: string = 'notSelected';
  constructor(public AppComponent: AppComponent) { }

  ngOnInit() {
  }
  toggleState() {
    this.state = this.state === 'selected' ? 'notSelected' : 'selected';
  }

}

