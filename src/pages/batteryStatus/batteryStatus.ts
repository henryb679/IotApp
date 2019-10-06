import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, NavController} from 'ionic-angular';
import {MqttBrokerProvider} from "../../providers/mqtt-broker/mqtt-broker";
import { Chart } from "chart.js";

@Component({
  selector: 'page-about',
  templateUrl: 'batteryStatus.html'
})
export class BatteryStatus {
  @ViewChild("barCanvas") barCanvas: ElementRef;

  public message: '';


  private barChart: Chart;

  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events) {
    this.events.subscribe('messages', (message) => {
      // console.log(message);
      this.message = message;

      // To remove if it doesn't work
      this.loadBatteryGraph();
    });

    setInterval(this.update.bind(this), 1000);

  }


  ionViewDidLoad(){
    this.loadBatteryGraph();
  }

  loadBatteryGraph(){
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: "horizontalBar",
      data: {
        labels: ["living", "kitchen", "dining", "toilet", "bedroom"],
        datasets: [
          {
            label: "% - Current battery life",
            // FIX ME
            data: [this.getBatteryData().living, this.getBatteryData().kitchen, 
              this.getBatteryData().dining, this.getBatteryData().toilet, this.getBatteryData().bedroom],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255,99,132,1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Battery percentage'
        },
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
                max: 100,
              }
            }
          ],
        }
      }
    }).update();

  }

  // public connect() {
  //   console.log(this.mqttBrokerProvider.getData());
  // }

  public update(){
    // console.log(this.mqttBrokerProvider.getData());
  }

  public getData(){
    return this.message;
  }

  public getBatteryData(){
    return this.mqttBrokerProvider.getBatteryLevel();
  }

}
