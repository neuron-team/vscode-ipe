import { ToolbarComponent } from '../toolbar/toolbar.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {By} from '@angular/platform-browser';
import { AppComponent } from '../app.component'
import { Card } from 'vscode-ipe-types';
import { Pipe, PipeTransform } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { HighlightPipe } from '../classes/highlight.pipe';
import { PreviewPipe } from '../classes/preview.pipe';
import { MapComponent } from '../map/map.component';
import { AnsiColorizePipe } from '../classes/ansi-colorize.pipe';
import { ExtensionService } from '../classes/extension.service';
import { RegexService } from '../classes/regex.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('Toolbar-to-appComponent', () => {
    let Toolbarcomponent:ToolbarComponent;
    let Toolbarfixture: ComponentFixture<ToolbarComponent>;

    let appComponent:AppComponent;
    let appcomponentfixture:ComponentFixture<AppComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [
            AppComponent,
            ToolbarComponent,
            CardComponent,
            HighlightPipe,
            PreviewPipe,
            MapComponent,
            AnsiColorizePipe
          ],
          providers:[ExtensionService,RegexService],
          imports: [
            FormsModule,
            BrowserAnimationsModule
          ]
      })
      .compileComponents();
    }));
    beforeEach(() => { 

       Toolbarfixture = TestBed.createComponent(ToolbarComponent);
       Toolbarcomponent = Toolbarfixture.componentInstance;
       Toolbarfixture.detectChanges();
       appcomponentfixture = TestBed.createComponent(AppComponent);
       appComponent = appcomponentfixture.componentInstance;
       appcomponentfixture.detectChanges();
     });
     it('Toolbar component should be created', () => {
        expect(Toolbarcomponent).toBeDefined();
      });
    //   it('App component should be created', () => {
    //     expect(appComponent).toBeDefined();
    //   });


  });