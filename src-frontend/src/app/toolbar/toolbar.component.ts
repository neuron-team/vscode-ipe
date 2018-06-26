import { Component, OnInit,Output,EventEmitter } from '@angular/core';

/**
 * Manages all functions of the Toolbar in the Output Panel.
 */
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  /**
   * Search query in search box.
   */
  searchQuery: string = '';

  /**
   * Status of Selecting. True if user is selecting (in Select Mode).
   */
  isSelecting: boolean = false;

  /**
   * Indicates if filter icon bar is to be displayed.
   */
  filter: boolean = false;

  /**
   * Indicates if any non-default filter is selected.
   */
  filterSet: boolean = false;

  /**
   * EventEmitter for Search. Received by app.component.
   * @param string Search Query
   */
  @Output() onSearchChange = new EventEmitter<string>();
  
  /**
   * EventEmitter for Filter update. Received by app.component.
   * @param filterState Status of Filters
   */
  @Output() onFilterChange = new EventEmitter<any>();
  
  /**
   * EventEmitter for toggling isSelecting. Received by app.component.
   */
  @Output() onSelectingToggle = new EventEmitter<void>();
    
  /**
   * EventEmitter for delecting selected cards. Received by app.component.
   */
  @Output() onSelectDelete = new EventEmitter<void>();
    
  /**
   * EventEmitter for selecting all cards. Received by app.component.
   */
  @Output() onSelectAll = new EventEmitter<void>();
    
  /**
   * EventEmitter for creating a new markdown card. Received by app.component.
   */
  @Output() onNewMarkdown = new EventEmitter<void>();
    
  /**
   * EventEmitter for exporting cards. Received by app.component.
   */
  @Output() onExport = new EventEmitter<void>();

   /**
   * Status of Filters
   */
  filterState = {
    text: true,
    rich: true,
    error: true
  };

  constructor() { }

  ngOnInit() {
  }

  /**
   * Toggles isSelecting (Selection Mode).
   * Emits event when "Select" button is pressed.
   */
  toggleSelecting() {
    this.isSelecting = !this.isSelecting;
    this.onSelectingToggle.emit();
  }

  /**
   * Emits event when "Delete" button is pressed.
   */
  deleteSelectedCards() {
    this.onSelectDelete.emit();
  }

  /**
   * Emits event when "Select/Deselect All" button is pressed.
   */
  selectAll() {
    this.onSelectAll.emit();
  }

  /**
   * Emits event when "Add Markdown" button is pressed.
   */
  newMarkdown() {
    this.onNewMarkdown.emit()
  }

  /**
   * Checks if all filters set to change icon colour.
   * Emits event when filter checkboxes are changed.
   */
  updateFilter() {
    if (this.filterState.text && this.filterState.rich && this.filterState.error) {
      this.filterSet = false;
    } else {
      this.filterSet = true;
    }
    this.onFilterChange.emit(this.filterState)
  }

  /**
   * Emits event when search query is updated.
   */
  updateSearch() {
    this.onSearchChange.emit(this.searchQuery)
  }

  /**
   * Emits event when "Export" button is pressed.
   */
  export() {
    this.onExport.emit()
  }
}
