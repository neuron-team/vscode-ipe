import { Component, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  searchQuery: string = '';
  selection: boolean = false;

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
    if (this.searchQuery === '') {
      this.filterState = {
        text: true,
        rich: true,
        error: true
      };
    }
    this.onSearchChanged.emit({
      search: this.searchQuery,
      filters: this.filterState
    })
  }

}
