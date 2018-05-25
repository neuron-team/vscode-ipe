import { Component, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  searchQuery: string = '';
  selectMode: boolean = false;
  filter: boolean = false;
  filterSet: boolean = false;

  @Output() onSearchChanged = new EventEmitter<{search: string, filters: any}>();
  @Output() onSelectMode = new EventEmitter<boolean>();
  @Output() onSelectDelete = new EventEmitter<void>();
  @Output() onSelectAll = new EventEmitter<void>();
  @Output() onNewMarkdown = new EventEmitter<void>();

  filterState = {
    text: true,
    rich: true,
    error: true
  };

  constructor() { }

  ngOnInit() {
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    this.onSelectMode.emit(this.selectMode);
  }

  selectDelete() {
    this.onSelectDelete.emit();
  }

  selectAll() {
    this.onSelectAll.emit();
  }

  updateFilter() {
    if (this.filterState.text && this.filterState.rich && this.filterState.error) {
      this.filterSet = false;
    } else {
      this.filterSet = true;
    }
    this.onSearchChanged.emit({
      search: this.searchQuery,
      filters: this.filterState
    })
  }

}
