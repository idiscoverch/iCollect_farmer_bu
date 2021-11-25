import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ContactTownsPageRoutingModule } from './contact-towns-routing.module';

import { ContactTownsPage } from './contact-towns.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ContactTownsPageRoutingModule
  ],
  declarations: [ContactTownsPage]
})
export class ContactTownsPageModule {}
