import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MqttBrokerProvider } from "../../providers/mqtt-broker/mqtt-broker";
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Chart } from "chart.js";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

/**
 * The home page shows the following aspects
 * - Last seen location
 * - Last time since inactivity
 * - Views of number of movements throughout the rooms
 */
export class HomePage {
  @ViewChild("doughnutCanvas") doughnutCanvas: ElementRef;

  public message: '';
  private doughnutChart: Chart;
  private time;

  /**
   * Constructor
   * @param navCtrl 
   * @param mqttBrokerProvider 
   * @param events 
   * @param alert 
   */
  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events,
    public alert:AlertController) {
    this.events.subscribe('messages', (message) => {

      this.message = message;
      this.time = this.mqttBrokerProvider.calculateLastSeenTime(this.mqttBrokerProvider.getTimeSinceLastMotion());

      this.loadNoMovementsGraph();
    });

    setInterval(this.update.bind(this), 1000);
  }

  // Ensures the graph is loaded once the page is loaded.
  ionViewDidLoad() {
     this.loadNoMovementsGraph();
  }

  // Generates the number of movement graph.
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
              "#16DCF2",
              "#84D904",
              "#F58853"
            ],
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

  // Gets the information from the broker.
  public update() {
    this.mqttBrokerProvider.getData();
  }

  // Gets the raw message for test purposes
  public getData() {
    return this.message;
  }

  // Gets the last seen location 
  public getLastSeenLocation() {
    if (this.mqttBrokerProvider.lastSeenLocation().length == 0) {
      return "Undefined";
    }
    else {
      return this.mqttBrokerProvider.lastSeenLocation();
    }
  }

  // Gets number of movements
  public getMovements() {
    return this.mqttBrokerProvider.movements();
  }

  // Gets the time since last motion.
  public getTime() {
    if (this.time == undefined) {
      return 0;
    }
    else {
      return this.time;
    }
  }

  /**
   * Tracks to see if there has been movements to any rooms yet.
   * Returns true/false accordingly
   */
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
