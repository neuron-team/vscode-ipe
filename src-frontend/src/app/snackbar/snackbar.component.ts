import {Component, EventEmitter, Input, Output} from '@angular/core';

/**
 * Manages all functions of the Snackbar in the Output Panel.
 */
@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent {

  /**
   * Information for action bar display.
   */
  @Input() content: number;
  /**
   * Snackbar action button name.
   */
  @Input() action: string;

  /**
   * EventEmitter for action. Received by app.component.
   */
  @Output() actionClicked = new EventEmitter<void>();

  constructor() { }

}
