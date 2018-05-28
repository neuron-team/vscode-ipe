import { ExtensionService } from '../classes/extension.service'
import { Card, CardOutput } from 'vscode-ipe-types';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { windowWhen } from 'rxjs/operators';

describe('ExtensionService', () => {
    let service = new ExtensionService();
    const sampleCard = new Card(0, 'sample card', 'print("Hello, World!")', [new CardOutput('stdout', 'Hello, world!')], {},'');

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
