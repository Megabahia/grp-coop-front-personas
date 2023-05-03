import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NeedHelpComponent} from "./need-help/need-help.component";
import { NeedInfoComponent } from './need-info/need-info.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    NeedHelpComponent,
    NeedInfoComponent,
    FooterComponent,
  ],

  exports: [
    NeedHelpComponent,
    NeedInfoComponent,
    FooterComponent,
  ],

  imports: [
    CommonModule,
  ]
})
export class SharedModule { }
