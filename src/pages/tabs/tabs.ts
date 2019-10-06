import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { BatteryStatus } from '../batteryStatus/batteryStatus';
import { TimeSpent } from '../timeSpent/timeSpent';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = BatteryStatus;
  tab3Root = TimeSpent;

  constructor() {

  }
}
