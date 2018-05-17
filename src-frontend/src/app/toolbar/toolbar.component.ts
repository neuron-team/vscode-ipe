import { Component, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  searchQuery: string = '';

  @Output() onSearchChanged = new EventEmitter<{search: string, filters: any}>();

  filterState = {
    text: true,
    rich: true,
    error: true
  };

  constructor() { }

  ngOnInit() {
  }

  fireEvent() {
    this.onSearchChanged.emit({
      search: this.searchQuery,
      filters: this.filterState
    })
  }

}
