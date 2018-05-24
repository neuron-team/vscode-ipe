import { Component, Input, OnInit } from '@angular/core';
import { KatexOptions } from 'ng-katex';

@Component({
  selector: 'app-math',
  template: `<ng-katex [equation]="mathExprNorm" [options]="options"></ng-katex>`
})
export class MathComponent implements OnInit {
  @Input() mathExpr: string;
  mathExprNorm: string;

  constructor(){}

  options: KatexOptions = {
    displayMode: true,
  };

  ngOnInit(){
    this.mathExprNorm = this.mathExpr.replace(/\$/g, '');
  }
}
