import { AppComponent } from '../app.component'
import { ExtensionService } from '../classes/extension.service';
import { RegexService } from '../classes/regex.service';
import { Card, CardOutput } from 'vscode-ipe-types';

describe('AppComponent', () => {
    let cardComponent: AppComponent;
    beforeEach(() => { cardComponent = new AppComponent(new ExtensionService, new RegexService); });
   
    it('updateFilters() correctly change searchQuery and typeFilters', () => {
        expect(cardComponent.searchQuery).toEqual('', 'searchQuery empty at first');
        expect(cardComponent.typeFilters).toEqual({text: true, rich: true, error: true}, 'typeFilters all true at first');
        
        cardComponent.updateFilters( {search: 'return 0', filters: {text: false, rich: false, error: false}} );
        expect(cardComponent.searchQuery).toEqual('return 0', 'searchQuery is different after first change');
        expect(cardComponent.typeFilters).toEqual({text: false, rich: false, error: false}, 'typeFilters = {false, false, false} after first change');
        
        cardComponent.updateFilters( {search: 'print("Hello, World!")', filters: {text: false, rich: true, error: false}} );
        expect(cardComponent.searchQuery).toEqual('print("Hello, World!")', 'searchQuery is different after first change');
        expect(cardComponent.typeFilters).toEqual({text: false, rich: true, error: false}, 'typeFilters = {true, false, true} after second change');
    });

    it('updateFilters() correctly change visibleCards: Map<Card, boolean>', () => {
        // todo
    });

    it('cardMatchesSearchQuery(card: Card) returns correct boolean', () => {
        const sampleCard = new Card(0, 'sample Hello World card', 'print("Hello, World!")', [new CardOutput('stdout', 'Hello, world!')]);
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'searchQuery empty, return true');
        
        cardComponent.searchQuery = 'card';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'only card.title contains normal searchQuery, return true');
        cardComponent.searchQuery = 'print("Hello, World!")';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'only card.sourceCode contains normal searchQuery, return true');
        cardComponent.searchQuery = 'h';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'both card.title and card.sourceCode contain normal searchQuery, return true');

        cardComponent.searchQuery = '/c/gi';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'only card.title contains regex searchQuery, return true');
        cardComponent.searchQuery = '/!/gi';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'only card.sourceCode contains regex searchQuery, return true');
        cardComponent.searchQuery = '/([A-Z])\\w+/gi';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(true, 'both card.title and card.sourceCode contain regex searchQuery, return true');
        
        cardComponent.searchQuery = 'Earth';
        expect(cardComponent.cardMatchesSearchQuery(sampleCard)).toEqual(false, 'neither card.title nor card.sourceCode contains normal/regex searchQuery, return true');
    });

    it('cardMatchesFilter(card: Card) returns correct boolean', () => {
        const noOutputCard = new Card(0, 'sample card', 'print("Hello, World!")', []);
        const stdoutCard = new Card(0, 'stdout card', 'print("Hello, world!")', [new CardOutput('stdout', 'Hello, world!')]);
        const textPlainCard = new Card(0, 'text/plain card', 'print("Hello, world!")', [new CardOutput('text/plain', 'Hello, world!')]);
        const errorCard = new Card(0, 'error card', 'print("Hello, world!")', [new CardOutput('error', 'code errors')]);
        const richCard = new Card(0, 'sample graph', 'some code', [
            new CardOutput('text/html', "<script>requirejs.config({paths: { 'plotly': ['https://cdn.plot.ly/plotly-latest.min']},});if(!window.Plotly) {{require(['plotly'],function(plotly) {window.Plotly=plotly;});}}</script>"),
            new CardOutput('text/html', '<div id="66f3f87d-6ec3-46a5-81b7-0d78b189a25f" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("66f3f87d-6ec3-46a5-81b7-0d78b189a25f", [{"x": [1, 2, 3], "y": [3, 1, 6]}], {}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>')
        ]);

        // All visible, initially
        expect(cardComponent.cardMatchesFilter(noOutputCard)).toEqual(true, 'treat empty cards as plain');
        expect(cardComponent.cardMatchesFilter(stdoutCard)).toEqual(true, 'stdout plain text');
        expect(cardComponent.cardMatchesFilter(textPlainCard)).toEqual(true, 'text/plain');
        expect(cardComponent.cardMatchesFilter(errorCard)).toEqual(true, 'code errors');
        expect(cardComponent.cardMatchesFilter(richCard)).toEqual(true, 'rich output');

        // None visible
        cardComponent.typeFilters = {text: false, rich: false, error: false};
        expect(cardComponent.cardMatchesFilter(noOutputCard)).toEqual(false, 'treat empty cards as plain');
        expect(cardComponent.cardMatchesFilter(stdoutCard)).toEqual(false, 'stdout plain text');
        expect(cardComponent.cardMatchesFilter(textPlainCard)).toEqual(false, 'text/plain');
        expect(cardComponent.cardMatchesFilter(errorCard)).toEqual(false, 'code errors');
        expect(cardComponent.cardMatchesFilter(richCard)).toEqual(false, 'rich output');

        // Partially visible
        cardComponent.typeFilters = {text: false, rich: true, error: true};
        expect(cardComponent.cardMatchesFilter(noOutputCard)).toEqual(false, 'treat empty cards as plain');
        expect(cardComponent.cardMatchesFilter(stdoutCard)).toEqual(false, 'stdout plain text');
        expect(cardComponent.cardMatchesFilter(textPlainCard)).toEqual(false, 'text/plain');
        expect(cardComponent.cardMatchesFilter(errorCard)).toEqual(true, 'code errors');
        expect(cardComponent.cardMatchesFilter(richCard)).toEqual(true, 'rich output');
    });

    
  });