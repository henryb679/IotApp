import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, NavController} from 'ionic-angular';
import {MqttBrokerProvider} from "../../providers/mqtt-broker/mqtt-broker";
import { Chart } from "chart.js";

@Component({
  selector: 'page-about',
  templateUrl: 'batteryStatus.html'
})

/**
 * This class shows the current battery level
 */
export class BatteryStatus {
  @ViewChild("barCanvas") barCanvas: ElementRef;

  public message: '';

  private barChart: Chart;

  /**
   * Constructor
   * @param navCtrl 
   * @param mqttBrokerProvider 
   * @param events 
   */
  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events) {
    this.events.subscribe('messages', (message) => {
      this.message = message;
      this.loadBatteryGraph();
    });

    setInterval(this.getAlert.bind(this), 3000);
  }

  // Ensures the graph is loaded as soon as the page is loaded
  ionViewDidLoad(){
    this.loadBatteryGraph();
  }

  // Generates the bar graph for the battery level
  loadBatteryGraph(){
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: "horizontalBar",
      data: {
        labels: ["living", "kitchen", "dining", "toilet", "bedroom"],
        datasets: [
          {
            label: "% - Current battery life",

            data: [this.getBatteryData().living, this.getBatteryData().kitchen,
              this.getBatteryData().dining, this.getBatteryData().toilet, this.getBatteryData().bedroom],
              backgroundColor: [
                "#BF045B",
                "#F285C1",
                "#16DCF2",
                "#84D904",
                "#F58853"
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
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
              }
            }
          ],
        }
      }
    }).update();

  }

  public getData(){
    return this.message;
  }

  // Gets battery data from the broker
  public getBatteryData(){
    return this.mqttBrokerProvider.getBatteryLevel();
  }

  // Gets the alert box if there no activity for 5mins
  public getAlert(){
    this.events.subscribe('homePage', (result) =>{
      if(result == 'alertMade'){
        this.navCtrl.parent.select(0);
      }
    })
  }

}
