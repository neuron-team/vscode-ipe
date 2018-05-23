import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-math',
  template: `<ng-katex [equation]="mathExpr"></ng-katex>`
})
export class MathComponent {
  @Input() mathExpr: string;
}
