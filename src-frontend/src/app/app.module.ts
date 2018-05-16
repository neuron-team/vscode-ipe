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

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HighlightPipe,
    AnsiColorizePipe,
    ToolbarComponent,
    RunScriptsDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    ExtensionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
