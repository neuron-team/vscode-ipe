import { CardComponent } from '../card/card.component';
import {By} from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform,DebugElement } from '@angular/core';
import { HighlightPipe } from '../classes/highlight.pipe';
import { PreviewPipe } from '../classes/preview.pipe'
import { MapComponent } from '../map/map.component';
import { AnsiColorizePipe } from '../classes/ansi-colorize.pipe';
import { RegexService } from '../classes/regex.service';
import { Card } from 'vscode-ipe-types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MathComponent} from '../math/math.component'
import { MarkdownModule } from 'ngx-markdown';
import { KatexModule } from 'ng-katex';
import {CustomMarkdownComponent} from '../custom-markdown/custom-markdown.component'
describe('CustomMarkdownComponent', () => {
    let component:CustomMarkdownComponent ;
    let fixture: ComponentFixture<CustomMarkdownComponent >;
    // const hostElement = fixture.nativeElement;
    // const startEditButton = hostElement.querySelector('#startEditButton');
    // const doneEditButton = hostElement.querySelector('#doneEditButton');
    // const cancelEditButton = hostElement.querySelector('#cancelEditButton');
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [ MarkdownModule.forRoot()],
        declarations: [CustomMarkdownComponent ]
      })
      .compileComponents();
    }));
    beforeEach(() => { 
        fixture = TestBed.createComponent(CustomMarkdownComponent) ;
        component = fixture.componentInstance;
        fixture.detectChanges();
     });

    function sendClick( inputElement: HTMLInputElement) {
      inputElement.click();
      fixture.detectChanges();
      return fixture.whenStable();
    }

    it('Clicking startEdit should set editing markdown to true', () => {
        const hostElement = fixture.nativeElement;
        const startEditButton = hostElement.querySelector('#startEditButton');
        sendClick(startEditButton).then(()=> {
            expect(component.editingMarkdown).toEqual(true);
        });
    });

    // it('Clicking cancel button should keep card source code  ', () => {

    // component.editingMarkdown = true;
    // fixture.detectChanges();
   
    // const Button = hostElement.querySelector('#cancelMarkdownButton');
    // sendClick(Button).then(()=> {
    //     expect(component.editingMarkdown).toEqual(false);
    //     expect(component.card.sourceCode).toEqual("print('hello world')");
    // });
    // });
    // it('Clicking finished markdown button should set editing markdown to false and modifies source code  ', () => {
    // component.card.isCustomMarkdown = true;
    // component.editingMarkdown = true;
    // fixture.detectChanges();
    // const hostElement = fixture.nativeElement;
    // const Button = hostElement.querySelector('#finishedMarkdownButton');
    // const MarkdownTextarea =hostElement.querySelector('#markdownTextArea'); 
    // let mdString = "# This is a header in markdown";
    // MarkdownTextarea.value = mdString;
    // fixture.detectChanges();
    // sendClick(Button).then(()=> {
    //     expect(component.editingMarkdown).toEqual(false);
    // });
    
    // expect(component.card.sourceCode).toEqual(mdString);
    // });




  

});