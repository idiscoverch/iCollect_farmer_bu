import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TracePage } from './trace.page';

const routes: Routes = [
  {
    path: '',
    component: TracePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TracePageRoutingModule {}
