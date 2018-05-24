import { CardComponent } from '../card/card.component';
import {By} from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { HighlightPipe } from '../classes/highlight.pipe';
import { PreviewPipe } from '../classes/preview.pipe'
import { MapComponent } from '../map/map.component';
import { AnsiColorizePipe } from '../classes/ansi-colorize.pipe';
import { RegexService } from '../classes/regex.service';

describe('CardComponent', () => {
    let component:CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(() => { 
        TestBed.configureTestingModule({
            imports: [ FormsModule],
            declarations: [CardComponent,HighlightPipe,PreviewPipe,MapComponent,AnsiColorizePipe],
            providers: [RegexService]
          })
        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;

     });


    function sendInput(text: string, inputElement: HTMLInputElement) {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      return fixture.whenStable();
    }
    
    it('Card component should be created', () => {
        expect(component).toBeDefined();
      });
  


      
  });