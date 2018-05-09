import {Component, Input, OnInit} from '@angular/core';
import { Card } from 'vscode-ipe-types';

import { AppComponent } from '../app.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: Card;

  constructor(private AppComponent: AppComponent) { }

  ngOnInit() {
  }

}
