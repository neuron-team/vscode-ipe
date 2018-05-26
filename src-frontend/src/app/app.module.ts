import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { ExtensionService } from './classes/extension.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightPipe } from './classes/highlight.pipe';
import { AnsiColorizePipe } from './classes/ansi-colorize.pipe';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { RunScriptsDirective } from './classes/run-scripts.directive';
import { PreviewPipe } from "./classes/preview.pipe";
import { RegexService } from './classes/regex.service';
import { MapComponent } from './map/map.component';
import { MathComponent } from './math/math.component';
import { KatexModule } from 'ng-katex';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HighlightPipe,
    AnsiColorizePipe,
    RunScriptsDirective,
    PreviewPipe,
    ToolbarComponent,
    MapComponent,
    MathComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    KatexModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    ExtensionService,
    RegexService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
