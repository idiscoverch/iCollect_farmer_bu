import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NewLocationPageRoutingModule } from './new-location-routing.module';

import { NewLocationPage } from './new-location.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    NewLocationPageRoutingModule
  ],
  declarations: [NewLocationPage]
})
export class NewLocationPageModule {}
