import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent {

  @Input() content: number;
  @Input() action: string;

  @Output() actionClicked = new EventEmitter<void>();

  constructor() { }

}
