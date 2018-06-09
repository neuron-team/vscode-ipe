import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {

  @Input() content: number;
  @Input() action: string;

  @Output() actionClicked = new EventEmitter<void>();

  text = ''

  constructor() { }

  ngOnInit() {

    if (this.content === 1) {
      this.text = `Card Deleted`
    } else {
      this.text = `${this.content.toString()} Cards Deleted`
    }
  }

}
