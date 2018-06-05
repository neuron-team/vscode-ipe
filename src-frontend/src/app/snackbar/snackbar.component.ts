import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {

  @Input() content: string;
  @Input() action: string;

  @Output() actionClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

}
