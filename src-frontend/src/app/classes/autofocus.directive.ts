import {Directive, Input, ElementRef, AfterViewInit} from '@angular/core';

/**
 * Auto-focuses and auto-selects fields created after page load.
 * @example <input Autofocus [value]="card.title">
 */
@Directive({
  selector: '[Autofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  @Input() Autofocus: boolean;

  /**
   * Element to be autofocused
   */
  private el: any;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  /**
   * Focuses and Selects Element
   */
  ngAfterViewInit(): void {
    this.el.focus();
    this.el.select();
  }

}
