import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TownListPageRoutingModule } from './town-list-routing.module';

import { TownListPage } from './town-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TownListPageRoutingModule
  ],
  declarations: [TownListPage]
})
export class TownListPageModule {}
