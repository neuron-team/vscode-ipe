import { Directive,Input, ElementRef, Renderer } from '@angular/core';

/**
 * The Autofocus custom Directive allows elements to be autofocusee even after page load.
 * This allows toggleable fields to be autofocued
 */
@Directive({
  selector: '[Autofocus]'
})
export class AutofocusDirective {
  @Input() Autofocus: boolean;
  private el: any;
  constructor(
    private elementRef:ElementRef,
  ) { 
    this.el = this.elementRef.nativeElement;
   
  }
  ngOnInit(){
    this.el.focus();
  }
 
}