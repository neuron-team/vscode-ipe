import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-pdf',
  template: `<a [href]="pdfSrc" download="output.pdf">Click here to download the generated pdf</a>`
})
export class PdfComponent {

  pdfSrc: SafeUrl;

  @Input() set base64src(value: string) {
    this.pdfSrc = this.sanitizer.bypassSecurityTrustUrl('data:application/pdf;base64,' + value);
  }

  constructor(private sanitizer: DomSanitizer) {}
}
