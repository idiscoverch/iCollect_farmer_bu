import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TracePageRoutingModule } from './trace-routing.module';

import { TracePage } from './trace.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TracePageRoutingModule
  ],
  declarations: [TracePage]
})
export class TracePageModule {}
