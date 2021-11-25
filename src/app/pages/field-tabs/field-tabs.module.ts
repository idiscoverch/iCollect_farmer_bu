import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { FieldTabsPageRoutingModule } from './field-tabs-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FieldTabsPage } from './field-tabs.page';

const routes: Routes = [
  {
    path: 'field-tabs',
    component: FieldTabsPage,
    children: 
    [ 
      { 
        path: 'field-map', 
        loadChildren: '../field-map/field-map.module#FieldMapPageModule' 
      },
      { 
        path: 'field-contacts', 
        loadChildren: '../field-contacts/field-contacts.module#FieldContactsPageModule' 
      }
    ]
  },
  {
    path:'',
    redirectTo: 'field-tabs/field-map',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FieldTabsPageRoutingModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FieldTabsPage]
})
export class FieldTabsPageModule {}
