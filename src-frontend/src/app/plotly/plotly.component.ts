import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-plotly',
  template: `<div class="output-rich" [innerHTML]="htmlContent | safeHtml" runScripts></div>`
})
export class PlotlyComponent implements OnInit {

  @Input() plotlyJson : string;
  htmlContent: string;

  constructor() { }

  ngOnInit() {
    // make sure plotly runs along with the card
    this.htmlContent = '<script>requirejs.config({paths: { \'plotly\': [\'https://cdn.plot.ly/plotly-latest.min\']},});if(!window.Plotly) {{require([\'plotly\'],function(plotly) {window.Plotly=plotly;});}}</script>';

    let guid = PlotlyComponent.generateGuid();
    this.htmlContent += 
        '<div id="' + guid + '" style="height: 525px; width: 100%;" class="plotly-graph-div">'
        + '</div><script type="text/javascript">require(["plotly"], function(Plotly)'
        + '{ window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("'
        + guid + '",' + JSON.stringify(this.plotlyJson) + ', {}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>';
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
