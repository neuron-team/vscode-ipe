import { Component, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Output() onSelectType = new EventEmitter();
  constructor() { }

  toggleTypeQuery(typeStr: string): void {
    this.onSelectType.emit(typeStr);

  }
  ngOnInit() {
  }

}
