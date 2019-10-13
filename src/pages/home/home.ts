import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MqttBrokerProvider } from "../../providers/mqtt-broker/mqtt-broker";
import { Events } from 'ionic-angular';

import { Chart } from "chart.js";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild("doughnutCanvas") doughnutCanvas: ElementRef;

  public message: '';
  private doughnutChart: Chart;

  private time;

  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events) {
    this.events.subscribe('messages', (message) => {
      // console.log(message);
      this.message = message;

      this.time = this.mqttBrokerProvider.calculateLastSeenTime(this.mqttBrokerProvider.getTimeSinceLastMotion());

      // if(this.lastSeen > 0){
      //   console.log('WORKING: ' + this.lastSeen);
      // }

      this.loadNoMovementsGraph();
    });

    setInterval(this.update.bind(this), 1000);
  }


  ionViewDidLoad() {

    // if(this.movementBool()){
      this.loadNoMovementsGraph();
    // }
  }

  private loadNoMovementsGraph() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: "doughnut",
      data: {
        labels: ["living", "kitchen", "dining", "toilet", "bedroom"],
        datasets: [
          {
            label: "# of movements",

            data: [this.getMovements().living, this.getMovements().kitchen,
            this.getMovements().dining, this.getMovements().toilet, this.getMovements().bedroom],
            backgroundColor: [
              "#BF045B",
              "#F285C1",
              "#7756BF",
              "#16DCF2",
              "#84D904",
              "#F58853"
            ],
            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF6384", "#36A2EB", "#FFCE56"]
          },
        ]
      },
      options: {
        chartArea: {
          backgroundColor: 'rgba(251, 85, 85, 0.4)'
        }
      }
    }).update();
  }


  public update() {
    // console.log(this.mqttBrokerProvider.getData());
    this.mqttBrokerProvider.getData();
  }

  public getData() {
    return this.message;
  }

  public getLastSeenLocation() {
    if (this.mqttBrokerProvider.lastSeenLocation().length == 0) {
      return "Undefined";
    }
    else {
      return this.mqttBrokerProvider.lastSeenLocation();
    }
  }

  public getMovements() {
    return this.mqttBrokerProvider.movements();
  }

  public getTime() {
    if (this.time == undefined) {
      return 0;
    }
    else {
      return this.time;
    }
  }

  public movementBool() {

    if (this.mqttBrokerProvider.movements().living >= 1 ||
      this.mqttBrokerProvider.movements().kitchen >= 1 ||
      this.mqttBrokerProvider.movements().dining >= 1 ||
      this.mqttBrokerProvider.movements().toilet >= 1 ||
      this.mqttBrokerProvider.movements().bedroom >= 1) {
      return true;
    }
    else {
      return false
    }


  }

}