import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from "../../../enviroment/environment";
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
/*
  Generated class for the MqttBrokerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MqttBrokerProvider {

  // constructor(public http: HttpClient) {
  //   console.log('Hello MqttBrokerProvider Provider');
  // }

  private mqttStatus: string = 'Disconnected';
  private mqttClient: any = null;
  public message: any = '';
  private messageToSend: string = 'Type your message here.';
  private topic: string = environment.mqttConfig.topic;
  private clientId: string = environment.mqttConfig.clientId;


  private currentBatteryLevel = {
    'living': undefined,
    'kitchen': undefined,
    'dining': undefined,
    'toilet': undefined,
    'bedroom': undefined,
  };

  private noMovements = {
    'living': 0,
    'kitchen': 0,
    'dining': 0,
    'toilet': 0,
    'bedroom': 0,
  };


  private location: string = '';

  public lastTimeInMotion: Date = new Date();

  inactiveTime;

  public flag: boolean = false;

  d = 0;

  constructor(public events: Events, public alert: AlertController) {
    this.onMessageArrived = this.onMessageArrived.bind(this);

    //setInterval(this.getAlert.bind(this), 3000);

    this.connect();
  }

  public connect() {
    this.mqttStatus = 'Connecting...';
    this.mqttClient = new Paho.MQTT.Client('localhost', 8883, '/mqtt', this.clientId);
    // this.mqttClient = new Paho.MQTT.Client('barretts.ecs.vuw.ac.nz', 8883, '/mqtt', this.clientId);

    // set callback handlers
    this.mqttClient.onConnectionLost = this.onConnectionLost;
    this.mqttClient.onMessageArrived = this.onMessageArrived;

    // connect the client
    console.log('Connecting to mqtt via websocket');
    this.mqttClient.connect({timeout:10, useSSL:false, onSuccess:this.onConnect, onFailure:this.onFailure});
  }

  public disconnect() {
    if(this.mqttStatus == 'Connected') {
      this.mqttStatus = 'Disconnecting...';
      this.mqttClient.disconnect();
      this.mqttStatus = 'Disconnected';
    }
  }

  public sendMessage() {
    if(this.mqttStatus == 'Connected') {
      this.mqttClient.publish(this.topic, this.messageToSend);
    }
  }

  public onConnect = () => {
    console.log('Connected');
    this.mqttStatus = 'Connected';

    // subscribe
    this.mqttClient.subscribe(this.topic);
  }

  public onFailure = (responseObject) => {
    console.log('Failed to connect');
    this.mqttStatus = 'Failed to connect';
  }


  public onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      this.mqttStatus = 'Disconnected';
    }
  }

  public onMessageArrived = (message) => {
    this.events.publish("messages", message.payloadString);

    // console.log('Received message');
    // this.message = message.payloadString;
    this.parseMessages(message.payloadString);
    this.message = message;
  }

  public parseMessages(message){
    console.log(message);


    
    let messageArray = message.split(',');

    let currentTimestamp = messageArray[0];
    let sensorLocation:string = messageArray[1];
    let motionStatus = messageArray[2];
    let batteryStatus = messageArray[3];

    // console.log('Location: ' + sensorLocation + ' motionStatus: ' + motionStatus);

    this.inactiveTime = this.calculateLastSeenTime(this.lastTimeInMotion);


    this.getAlert();

    // if(inactiveTime >= '0'){
      // this.presentAlert();
    // }

    // ADD CHECK if inactiveTime >= 5 -> then show push notifcation

    // If a motion has taken place, then track the time respective of that.
    if(motionStatus == '1'){
      this.lastTimeInMotion = new Date(currentTimestamp);
    }

    if(sensorLocation == 'living'){
      this.currentBatteryLevel.living = batteryStatus;
      //tracks current location
      if(motionStatus == '1'){
        this.location = sensorLocation;
        this.noMovements.living ++;
      }
    }

    if(sensorLocation == 'kitchen'){
      this.currentBatteryLevel.kitchen = batteryStatus;
      //tracks current location
      if(motionStatus == '1'){
        this.location = sensorLocation;
        this.noMovements.kitchen ++;
      }
    }

    if(sensorLocation == 'dining'){
      this.currentBatteryLevel.dining = batteryStatus;
      //tracks current location
      if(motionStatus == '1'){
        this.location = sensorLocation;
        this.noMovements.dining ++;
      }
    }

    if(sensorLocation == 'toilet'){
      this.currentBatteryLevel.toilet = batteryStatus;
      //tracks current location
      if(motionStatus == '1'){
        this.location = sensorLocation;
        this.noMovements.toilet ++;
      }
    }

    if(sensorLocation == 'bedroom'){
      this.currentBatteryLevel.bedroom = batteryStatus;
      //tracks current location
      if(motionStatus == '1'){
        this.location = sensorLocation;
        this.noMovements.bedroom ++;
      }
    }

  }
  // presentAlert() {
  //   let alert = this.alert.create({
  //     title: 'Low battery',
  //     subTitle: '10% of battery remaining',
  //     buttons: ['Dismiss']
  //   });
  //   alert.present();
  // }
  


  // // ALERT
  // async notifcation(){
  //   const alert = await this.alert.create({
  //     title: 'test',
  //     subTitle: 'vewve',
  //     buttons: ["OK"]
  //   });
  //   alert.present();
  //   alert.onDidDismiss(a => 
  //     this.returnPage().then(b => this.events.publish("homePage", false)));
  // }

  // async returnPage(){
  //   this.events.publish("homePage", true);
  // }

  public getTimeSinceLastMotion(){
    return this.lastTimeInMotion;
  }

  /**
   * Calculates the time difference between the time that the last motion took 
   * place and the current time.
   */
  public calculateLastSeenTime = (startDate) => {
    var timeDifference = new Date().getTime() - startDate.getTime();
    
    return (timeDifference / 60000).toFixed(2);
};

  public getData(){
    // console.log("DATA" + this.message);

    return this.message;
  }

  /**
   * Gets the current battery level of each room.
   */
  public getBatteryLevel(){
    return this.currentBatteryLevel;
  }

  /**
   * Gets the last seen location of the patient
  */
  public lastSeenLocation(){
    return this.location;
  }

  /**
   * Gets the total number of movements for each room.
   */
  public movements() {
    return this.noMovements;
  }


  public getT(){
    let inactiveTime = this.calculateLastSeenTime(this.lastTimeInMotion);
    return inactiveTime;
  }


  getAlert(){

    if(this.inactiveTime >= 1 && !this.flag){
      this.d += 1;
    }

   if(this.d === 1 && !this.flag){
    let alert = this.alert.create({
          title: 'Prolonged Inactivity Push Notification',
          message: 'There has been no motion in the house for the last 5 minutes',
          buttons: ['OK']
        });
        alert.present();
        this.flag = true;

      alert.onDidDismiss(() => {
        this.flag = false;

        this.events.publish("homePage", 'alertMade');
        this.d = 0;
      })
   } 
  }
}
