import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-math',
  template: `<ng-katex [equation]="equation"></ng-katex>`
})
export class MathComponent {
  @Input() mathExpr: string;
  equation = '\\sum_{i=1}^nx_i';
}
