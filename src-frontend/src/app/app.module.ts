import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { ExtensionService } from './classes/extension.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightPipe } from './highlight.pipe';
import { AnsiColorizePipe } from './classes/ansi-colorize.pipe';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HighlightPipe,
    AnsiColorizePipe,
    ToolbarComponent
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
