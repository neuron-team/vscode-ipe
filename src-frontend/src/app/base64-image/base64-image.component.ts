import {Component, Input} from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-base64-image',
  template: `<img [src]="imageSrc">`
})
export class Base64ImageComponent {
  imageSrc: SafeUrl;

  private _base64src: string = '';
  private _imageType: string = 'png';

  @Input() set base64src(value: string) {
    this._base64src = value;
    this.update();
  }

  @Input() set imageType(value: string) {
    this._imageType = value;
    this.update();
  }

  update() {
    this.imageSrc = this.sanitizer.bypassSecurityTrustUrl('data:image/' + this._imageType + ';base64,' + this._base64src);
  }

  constructor(private sanitizer: DomSanitizer) { }

}
