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
describe('CardComponent', () => {
    let component:CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [ FormsModule,BrowserAnimationsModule,MarkdownModule.forRoot(),KatexModule],
        declarations: [CardComponent,HighlightPipe,PreviewPipe,MapComponent,AnsiColorizePipe,MathComponent],
        providers: [RegexService]
      })
      .compileComponents();
    }));
    beforeEach(() => { 
        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        //Initialize card for testing
        component.card = new Card(0,"test","hello world",[],{},'');
        fixture.detectChanges();
     });

    function sendClick( inputElement: HTMLInputElement) {
      inputElement.click();
      fixture.detectChanges();
      return fixture.whenStable();
    }
    function sendKeyboard(text: string, inputElement: HTMLInputElement) {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input'));
      const event = new KeyboardEvent("keypress",{
        "key": "enter"
      });
     inputElement.dispatchEvent(event);  
      fixture.detectChanges();
      return fixture.whenStable();
    }
    
    it('Card component should be created', () => {
        expect(component).toBeDefined();
      });

    it('OnMove emitter should output inputted string when function is called', () => {
      component.onMove.subscribe(g => {
        expect(g).toEqual({direction: "up"});
     });
      component.move("up");
    });

    it('Selecting card should emit true via onSelect event emitter', () => {
      spyOn(component.onSelect, 'emit');
      const hostElement = fixture.nativeElement;
      const selectButton = hostElement.querySelector('#SelectCard');
      component.isSelecting = true;
      sendClick(selectButton).then(()=> {
        expect(component.onSelect.emit).toHaveBeenCalledTimes(1);
      });
    });

    it('When select button is clicked select function should be called',async( () => {
      spyOn(component, 'selectCard');
      let hostElement = fixture.nativeElement;
      let selectButton = hostElement.querySelector('#SelectCard');
      sendClick(selectButton).then(()=> {
        expect(component.selectCard).toHaveBeenCalledTimes(1);
      });

    }));

    it('When delete is clicked onDelete event emitter should emit', () => {
      spyOn(component.onDelete, 'emit');
      const hostElement = fixture.nativeElement;
      const deleteButton = hostElement.querySelector('#deleteButton');
      sendClick(deleteButton).then(()=> {
        expect(component.onDelete.emit).toHaveBeenCalledTimes(1);
      });
    });

    it('When clicking up should call move() with arguments "up" ', () => {
      spyOn(component, 'move');
      const hostElement = fixture.nativeElement;
      const moveUpButton = hostElement.querySelector('#moveUpButton');
      sendClick(moveUpButton).then(()=> {
        expect(component.move).toHaveBeenCalledTimes(1);
        expect(component.move).toHaveBeenCalledWith('up');
      });
    });

    it('When clicking down should call move() with arguments "down" ', () => {
      spyOn(component, 'move');
      const hostElement = fixture.nativeElement;
      const moveDownButton = hostElement.querySelector('#moveDownButton');
      sendClick(moveDownButton).then(()=> {
        expect(component.move).toHaveBeenCalledTimes(1);
        expect(component.move).toHaveBeenCalledWith('down');
      });
    });

    
    it('When clicking editing title editing title property should change ', () => {
      const hostElement = fixture.nativeElement;
      const Button = hostElement.querySelector('#editingTitleButton');
      //One click
      sendClick(Button).then(()=> {
        expect(component.editingTitle).toBeDefined();
        expect(component.editingTitle).toEqual(true);
      });
    });

    it('Clicking collapse button should set ediing title to be false', () => {
    const hostElement = fixture.nativeElement;
    const Button = hostElement.querySelector('#collapseButton');
    //Button clicked
    sendClick(Button).then(()=> {
      expect(component.editingTitle).toBeDefined();
      expect(component.editingTitle).toEqual(false);
    });
  });
  it('After editing title, pressing enter should set editing title to false ', () => {
    const hostElement = fixture.nativeElement;
    component.editingTitle = true;
    component.isSelecting = false;
    fixture.detectChanges();
    let debugElement = fixture.debugElement.query(By.css('input'));
    debugElement.triggerEventHandler('keydown.enter', {});
    fixture.detectChanges();
    fixture.whenStable().then(()=> {
      expect(component.changeTitle).toHaveBeenCalledTimes(1);
    })

  });
  it('After editing title, pressing esc should set editing title to false ', () => {
    const hostElement = fixture.nativeElement;
    component.card.isCustomMarkdown = false;
    component.editingTitle = true;
    component.isSelecting = false;
    fixture.detectChanges();
    let debugElement = fixture.debugElement.query(By.css('input'));
    debugElement.triggerEventHandler('keydown.esc', {});
    fixture.detectChanges();
    fixture.whenStable().then(()=> {
      expect(component.editingTitle).toBe(false);
    })

  });
  
  it('When clicking accept button the title property should be false', () => {
    const hostElement = fixture.nativeElement;
    component.editingTitle = true;
    fixture.detectChanges();
    const acceptTitleButton = hostElement.querySelector('#acceptButton');
    //Button clicked
    sendClick(acceptTitleButton).then(()=> {
      expect(component.editingTitle).toEqual(false);
    });

  });
  

 it('When clicking card collapse button card.collapse property should change ', () => {
  expect(component.card.codeCollapsed).toEqual(true);
  const hostElement = fixture.nativeElement;
  const Button = hostElement.querySelector('#codeCollapseButton');
  //One click
  sendClick(Button).then(()=> {
    expect(component.card.codeCollapsed).toEqual(false);
  });
});

it('Clicking cancel button should set editing markdown to false  ', () => {
  component.card.isCustomMarkdown = true;
  component.editingMarkdown = true;
  fixture.detectChanges();
  const hostElement = fixture.nativeElement;
  const Button = hostElement.querySelector('#cancelMarkdownButton');
  sendClick(Button).then(()=> {
    expect(component.editingMarkdown).toEqual(false);
  });
});

it('Clicking cancel button should keep card source code  ', () => {
  component.card.isCustomMarkdown = true;
  component.editingMarkdown = true;
  component.card.sourceCode= "print('hello world')";
  fixture.detectChanges();
  const hostElement = fixture.nativeElement;
  const Button = hostElement.querySelector('#cancelMarkdownButton');
  sendClick(Button).then(()=> {
    expect(component.editingMarkdown).toEqual(false);
    expect(component.card.sourceCode).toEqual("print('hello world')");
  });
});
it('Clicking finished markdown button should set editing markdown to false and modifies source code  ', () => {
  component.card.isCustomMarkdown = true;
  component.editingMarkdown = true;
  fixture.detectChanges();
  const hostElement = fixture.nativeElement;
  const Button = hostElement.querySelector('#finishedMarkdownButton');
  const MarkdownTextarea =hostElement.querySelector('#markdownTextArea'); 
  let mdString = "# This is a header in markdown";
  MarkdownTextarea.value = mdString;
  fixture.detectChanges();
  sendClick(Button).then(()=> {
    expect(component.editingMarkdown).toEqual(false);
  });
  
  expect(component.card.sourceCode).toEqual(mdString);
});




  

});