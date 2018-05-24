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
describe('CardComponent', () => {
    let component:CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [ FormsModule,BrowserAnimationsModule],
        declarations: [CardComponent,HighlightPipe,PreviewPipe,MapComponent,AnsiColorizePipe],
        providers: [RegexService]
      })
      .compileComponents();
    }));
    beforeEach(() => { 
        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        //Initialize card for testing
        component.card = new Card(0,"test","hello world",[]);
        fixture.detectChanges();
     });

    function sendClick( inputElement: HTMLInputElement) {
      inputElement.click();
      fixture.detectChanges();
      return fixture.whenStable();
    }
    
    it('Card component should be created', () => {
        expect(component).toBeDefined();
      });
    
    it('Toggle state should switch between true and false states', () => {
      component.toggleState();
      expect(component.selected).toEqual(true);
    });

    it('Selecting card should toggle state', () => {
      component.selectCard();
      expect(component.selected).toEqual(true);
    });

    it('OnMove emitter should output inputted string when function is called', () => {
      component.onMove.subscribe(g => {
        expect(g).toEqual({direction: "up"});
     });
      component.move("up");
    });

    it('Selecting card should emit true via onSelect event emitter', () => {
      component.onSelect.subscribe(g => {
        expect(g).toEqual(true);
     });
      component.selectCard();
    });

    it('When select button is clicked select function should be called',async( () => {
      spyOn(component, 'selectCard');
      let hostElement = fixture.nativeElement;
      let selectButton = hostElement.querySelector('#selectButton');
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





  


      
  });