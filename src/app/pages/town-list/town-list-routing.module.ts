import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TownListPage } from './town-list.page';

const routes: Routes = [
  {
    path: '',
    component: TownListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TownListPageRoutingModule {}
