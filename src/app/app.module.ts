import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { BatteryStatus } from '../pages/batteryStatus/batteryStatus';
import { BatteryAnalytics } from '../pages/batteryAnalytics/batteryAnalytics';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MqttBrokerProvider } from '../providers/mqtt-broker/mqtt-broker';
import { NgCircleProgressModule } from 'ng-circle-progress';


@NgModule({
  declarations: [
    MyApp,
    BatteryStatus,
    BatteryAnalytics,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    // Specify ng-circle-progress as an import
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,

    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BatteryStatus,
    BatteryAnalytics,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MqttBrokerProvider,
  ]
})
export class AppModule {}
