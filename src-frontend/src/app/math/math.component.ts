import { Component, Input, OnInit } from '@angular/core';
import { KatexOptions } from 'ng-katex';

@Component({
  selector: 'app-math',
  // Use katex to render the latex expression
  template: `<ng-katex [equation]="mathExprNorm" [options]="options"></ng-katex>`
})
/**
 * Class which manages the rendering of latex expressions.
 */
export class MathComponent implements OnInit {
  /**
   * Latex expression received from the backend.
   */
  @Input() mathExpr: string;
  /**
   * Normalised latex expression without the delimiting dollar signs
   */
  mathExprNorm: string;

  constructor(){}

  // Set katex options used for latex rendering
  options: KatexOptions = {
    displayMode: true,
  };

  ngOnInit(){
    // Remove the delimiting dollar signs from the latex expression
    this.mathExprNorm = this.mathExpr.replace(/\$/g, '');
  }
}
