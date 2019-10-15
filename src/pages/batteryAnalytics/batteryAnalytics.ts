import { Component, ElementRef, ViewChild } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { MqttBrokerProvider } from "../../providers/mqtt-broker/mqtt-broker";
import { Chart } from "chart.js";

@Component({
  selector: 'page-contact',
  templateUrl: 'batteryAnalytics.html'
})
/**
 * This class shows a extended view of the battery data including the following
 * max, min recorded battery level readings
 * a suggestion on when best to replace a battery.
 */
export class BatteryAnalytics {
  @ViewChild("barCanvas") barCanvas: ElementRef;

  private barChart: Chart;

  constructor(public navCtrl: NavController, public mqttBrokerProvider: MqttBrokerProvider, public events: Events) {
    this.events.subscribe('messages', (message) => {
      this.loadBatteryGraph();
    });

    setInterval(this.getAlert.bind(this), 3000);
  }

  // ensures the battery will load as soon as the page is loaded
  ionViewDidLoad() {
    this.loadBatteryGraph();
  }

  // Draws out the line graph to represent the battery level for the last 10 intervals.
  loadBatteryGraph() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {

        type: 'line',
        data: {
          labels: [1,2,3,4,5,7,8,9,10],
          datasets: [{ 
              data: this.previousBatteryData().living.slice(Math.max(this.previousBatteryData().living.length - 10, 1)),
              label: "living",
              borderColor: "#BF045B",
              fill: false
            }, { 
              data: this.previousBatteryData().kitchen.slice(Math.max(this.previousBatteryData().kitchen.length - 10, 1)),
              label: "kitchen",
              borderColor: "#F285C1",
              fill: false
            }, { 
              data: this.previousBatteryData().dining.slice(Math.max(this.previousBatteryData().dining.length - 10, 1)),
              label: "dining",
              borderColor: "#16DCF2",
              fill: false
            }, { 
              data: this.previousBatteryData().toilet.slice(Math.max(this.previousBatteryData().toilet.length - 10, 1)),
              label: "toilet",
              borderColor: "#84D904",
              fill: false
            }, { 
              data: this.previousBatteryData().bedroom.slice(Math.max(this.previousBatteryData().bedroom.length - 10, 1)),
              label: "bedroom",
              borderColor: "#F58853",
              fill: false
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Analytics for all rooms in the house'
          }
        }
      }).update();
  }

  // Calculates the average battery level.
  private calcAverage(array) {
    // console.log(array);
    if (array.length == 0) {
      return 0;
    }
    else {
      var sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += parseInt(array[i]);

      }
      var avg = sum / array.length;
      return avg;
    }
  }

  // gets the maximum recorded battery level
  public getMaxBatteryLevel(){
    let maxLevel = {
      'living': Math.max.apply(null, this.previousBatteryData().living).toFixed(2),
      'kitchen': Math.max.apply(null, this.previousBatteryData().kitchen).toFixed(2),
      'dining': Math.max.apply(null, this.previousBatteryData().dining).toFixed(2),
      'toilet': Math.max.apply(null, this.previousBatteryData().toilet).toFixed(2),
      'bedroom': Math.max.apply(null, this.previousBatteryData().bedroom).toFixed(2),
    };

    return maxLevel;
  }

  // gets the minimum recorded battery level
  public getMinBatteryLevel(){
    let maxLevel = {
      'living': Math.min.apply(null, this.previousBatteryData().living).toFixed(2),
      'kitchen': Math.min.apply(null, this.previousBatteryData().kitchen).toFixed(2),
      'dining': Math.min.apply(null, this.previousBatteryData().dining).toFixed(2),
      'toilet': Math.min.apply(null, this.previousBatteryData().toilet).toFixed(2),
      'bedroom': Math.min.apply(null, this.previousBatteryData().bedroom).toFixed(2),
    };

    return maxLevel;
  }

  // gets the maximum recorded battery level for each room
  public averageBatteryLevel() {
    let averageLevel = {
      'living': this.calcAverage(this.previousBatteryData().living).toFixed(2),
      'kitchen': this.calcAverage(this.previousBatteryData().kitchen).toFixed(2),
      'dining': this.calcAverage(this.previousBatteryData().dining).toFixed(2),
      'toilet': this.calcAverage(this.previousBatteryData().toilet).toFixed(2),
      'bedroom': this.calcAverage(this.previousBatteryData().bedroom).toFixed(2),
    };

    return averageLevel;
  }

  // gets battery data from broker
  public getBatteryData() {
    return this.mqttBrokerProvider.getBatteryLevel();
  }

  // gets a array of all the previous battery data
  public previousBatteryData() {
    return this.mqttBrokerProvider.getPreviousBatteryLevels();
  }

  /**
   * Suggestion 1- Recomends what battery to replace first based on 
   * discrepancies shown by the min and max recorded battery levels
   */
  public batterySuggestion1(){
    
    let living = {
      name: 'living',
      diff: this.getMaxBatteryLevel().living - this.getMinBatteryLevel().living
    };
    let kitchen = {
      name: 'kitchen',
      diff: this.getMaxBatteryLevel().kitchen - this.getMinBatteryLevel().kitchen
    };
    let dining = {
      name: 'dining',
      diff: this.getMaxBatteryLevel().dining - this.getMinBatteryLevel().dining
    };
    let toilet = {
      name: 'toilet',
      diff: this.getMaxBatteryLevel().toilet - this.getMinBatteryLevel().toilet
    };
    let bedroom = {
      name: 'bedroom',
      diff: this.getMaxBatteryLevel().bedroom - this.getMinBatteryLevel().bedroom
    };
    let room = [living, kitchen, dining, toilet, bedroom];

    let allRoomsDiff = [living.diff, kitchen.diff, dining.diff, toilet.diff, bedroom.diff];

    let largestDifference = Math.max.apply(null, allRoomsDiff);

    let roomLocation;
    let count;

    for(let i =0; i < room.length; i++){
      if(count == room.length){
        let a = {
          roomName: null,
          diff: 0
        }
        return a;
      }
      if(room[i].diff === largestDifference){
        roomLocation = room[i].name;
      }
      if(largestDifference == 0){
        count+=1;
      }
    }

    let result = {
      roomName: roomLocation,
      diff: largestDifference
    }
    
    return result;
  }

  // Shows the alert if there is no activity for 5mins
  public getAlert() {
    this.events.subscribe('homePage', (result) => {
      if (result == 'alertMade') {
        this.navCtrl.parent.select(0);
      }
    })
  }
}
