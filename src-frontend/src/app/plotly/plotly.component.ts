import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plotly',
  template: `<div class="output-rich" [innerHTML]="htmlContent" runScripts></div>`
})
export class PlotlyComponent {
  htmlContent: string;

  constructor() { }

  @Input() set plotlyJson(value: string) {
    // make sure plotly runs along with the card
    let content = '<script>requirejs.config({paths: { \'plotly\': [\'https://cdn.plot.ly/plotly-latest.min\']},});' +
      'if(!window.Plotly) {{require([\'plotly\'],function(plotly) {window.Plotly=plotly;});}}</script>';

    let guid = PlotlyComponent.generateGuid();
    content +=
      '<div id="' + guid + '" style="height: 525px; width: 100%;" class="plotly-graph-div">'
      + '</div><script type="text/javascript">require(["plotly"], function(Plotly)'
      + '{ window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("'
      + guid + '",' + JSON.stringify(value) + ', {}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>';

    this.htmlContent = content;
  }

  static generateGuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
      }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

}
