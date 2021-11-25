import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FieldContactsPage } from './field-contacts.page';

const routes: Routes = [
  {
    path: '',
    component: FieldContactsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FieldContactsPageRoutingModule {}
