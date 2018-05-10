import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import {ExtensionService} from './classes/extension.service';


@NgModule({
  declarations: [
    AppComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    ExtensionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
