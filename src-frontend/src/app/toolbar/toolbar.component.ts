import { Component, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  searchQuery: string = '';
  isSelecting: boolean = false;
  filter: boolean = false;
  filterSet: boolean = false;

  @Output() onSearchChanged = new EventEmitter<{search: string, filters: any}>();
  @Output() onSelectingToggle = new EventEmitter<boolean>();
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

  toggleSelecting() {
    this.isSelecting = !this.isSelecting;
    this.onSelectingToggle.emit(this.isSelecting);
  }

  deleteSelectedCards() {
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
