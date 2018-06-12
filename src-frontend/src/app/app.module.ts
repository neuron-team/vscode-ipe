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
import { AutofocusDirective } from './classes/autofocus.directive';
import { PreviewPipe } from "./classes/preview.pipe";
import { RegexService } from './classes/regex.service';
import { MapComponent } from './map/map.component';
import { MathComponent } from './math/math.component';
import { KatexModule } from 'ng-katex';
import { VDOMComponent } from './vdom/vdom.component';
import { MarkdownModule } from 'ngx-markdown';
import { PlotlyComponent } from './plotly/plotly.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { Base64ImageComponent } from './base64-image/base64-image.component';
import { CustomMarkdownComponent } from './custom-markdown/custom-markdown.component';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HighlightPipe,
    AnsiColorizePipe,
    RunScriptsDirective,
    AutofocusDirective,
    PreviewPipe,
    ToolbarComponent,
    MapComponent,
    MathComponent,
    VDOMComponent,
    Base64ImageComponent,
    CustomMarkdownComponent,
    PlotlyComponent,
    SnackbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    KatexModule,
    MarkdownModule.forRoot(),
    VirtualScrollModule
  ],
  providers: [
    ExtensionService,
    RegexService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
