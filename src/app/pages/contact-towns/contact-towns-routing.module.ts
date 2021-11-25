import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactTownsPage } from './contact-towns.page';

const routes: Routes = [
  {
    path: '',
    component: ContactTownsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactTownsPageRoutingModule {}
