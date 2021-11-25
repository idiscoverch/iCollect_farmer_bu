import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FieldContactsPageRoutingModule } from './field-contacts-routing.module';

import { FieldContactsPage } from './field-contacts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    FieldContactsPageRoutingModule
  ],
  declarations: [FieldContactsPage]
})
export class FieldContactsPageModule {}
