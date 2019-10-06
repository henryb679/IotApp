import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';
import { MqttBrokerProvider} from "../../providers/mqtt-broker/mqtt-broker";
import { Events } from 'ionic-angular';

import { Chart } from "chart.js";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage{
  @ViewChild("barCanvas") barCanvas: ElementRef;

  public message: '';


  private barChart: Chart;

  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events) {
    this.events.subscribe('messages', (message) => {
      // console.log(message);
      this.message = message;

      // To remove if it doesn't work
      // this.loadBatteryGraph();
    });

    setInterval(this.update.bind(this), 1000);

  }


  ionViewDidLoad(){
    // this.loadBatteryGraph();
  }


  public update(){
    // console.log(this.mqttBrokerProvider.getData());
    this.mqttBrokerProvider.getData();
  }

  public getData(){
    return this.message;
  }

  // public getBatteryData(){
  //   return this.mqttBrokerProvider.getBatteryLevel();
  // }

  public getLastSeenLocation(){
    // console.log(this.mqttBrokerProvider.lastSeenLocation().toString());
    return this.mqttBrokerProvider.lastSeenLocation();
  }

  public getMovements(){
    return this.mqttBrokerProvider.movements();
  }
}
