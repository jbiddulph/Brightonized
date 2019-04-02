import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VenuesPage } from './venues';

@NgModule({
  declarations: [
    VenuesPage,
  ],
  imports: [
    IonicPageModule.forChild(VenuesPage),
  ],
})
export class EventsPageModule {}
