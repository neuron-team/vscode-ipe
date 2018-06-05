import {Directive, Input, ElementRef, AfterViewInit} from '@angular/core';

/**
 * The Autofocus custom Directive allows elements to be auto-focused even after page load.
 * This allows toggleable fields to be auto-focused
 */
@Directive({
  selector: '[Autofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  @Input() Autofocus: boolean;

  private el: any;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.el.focus();
    this.el.select();
  }

}
