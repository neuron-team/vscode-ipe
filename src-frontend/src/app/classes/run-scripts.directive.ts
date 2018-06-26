import {Directive, ElementRef, Input, OnChanges} from '@angular/core';

/**
 * The runScripts custom Directive ensures that HTML containing <script> tags is handled correctly when injected.
 * Using runScripts on an element allows you to bind the `innerHTML` attribute and have any scripts in it run automatically.
 */
@Directive({ selector: '[runScripts]' })
export class RunScriptsDirective implements OnChanges {
  @Input() innerHTML: string;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges() {
    this.elementRef.nativeElement.innerHTML = this.innerHTML;
    setTimeout(() => { // wait for DOM render
      this.reinsertScripts();
    });
  }

  /**
   * Travel the DOM tree and re-insert any <script> elements so that they are run again by the browser
   */
  reinsertScripts(): void {
    const scripts = <HTMLScriptElement[]>this.elementRef.nativeElement.getElementsByTagName('script');
    const scriptsInitialLength = scripts.length;
    for (let i = 0; i < scriptsInitialLength; i++) {
      const script = scripts[i];
      const scriptCopy = <HTMLScriptElement>document.createElement('script');
      scriptCopy.type = script.type ? script.type : 'text/javascript';
      if (script.innerHTML) {
        scriptCopy.innerHTML = script.innerHTML;
      } else if (script.src) {
        scriptCopy.src = script.src;
      }
      scriptCopy.async = false;
      script.parentNode.replaceChild(scriptCopy, script);
    }
  }
}
