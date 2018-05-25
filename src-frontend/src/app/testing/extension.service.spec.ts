import { ExtensionService } from '../classes/extension.service'
import { Card, CardOutput } from 'vscode-ipe-types';

describe('ExtensionService', () => {
    let service = new ExtensionService();
    const sampleCard = new Card(0, 'sample card', 'print("Hello, World!")', [new CardOutput('stdout', 'Hello, world!')]);
    
  it('ExtensionService inteprets add-card command and emits correct card', () => {
    service.onAddCard.subscribe( p => {
        expect(p).toEqual({ id: 0, title: 'sample card', sourceCode: 'print("Hello, World!")', outputs: [ Object({ type: 'stdout', output: 'Hello, world!' }) ], collapsed: false, codeCollapsed: true, outputCollapsed: false }, 'expect sample card emit from extension service')
    })
    
    window.postMessage({
        command: 'add-card',
        card: sampleCard
    }, "*")
  });

  it('ExtensionService inteprets non add-card command and does not emit card', () => {
    let tmp = {};
    service.onAddCard.subscribe( p => {
        tmp = p;
    })
    
    window.postMessage({
        command: 'else',
        card: sampleCard
    }, "*")
    setTimeout(() => {
        expect(tmp).toEqual({}, 'expect no card emits from extension service')
    }, 50);
  });

});
