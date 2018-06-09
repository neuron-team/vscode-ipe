import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf',
  template: `<div (click)="onClick()">Click here to download the generated pdf</div>`
})
export class PdfComponent {

  @Input() set base64src(value: string) {
    
  }

  onClick() {

  }
}