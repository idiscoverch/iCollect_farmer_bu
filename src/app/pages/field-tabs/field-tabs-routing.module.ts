import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FieldTabsPage } from './field-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: FieldTabsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FieldTabsPageRoutingModule {}
