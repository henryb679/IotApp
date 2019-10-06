import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from "../../../enviroment/environment";
import { Events } from 'ionic-angular';
import { P } from '@angular/core/src/render3';
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

  // private currentLocation = {
  //   'living': 0,
  //   'kitchen': 0,
  //   'dining': 0,
  //   'toilet': 0,
  //   'bedroom': 0,
  // }

  private location: string = '';

  constructor(public events: Events) {
    this.onMessageArrived = this.onMessageArrived.bind(this);

    this.connect();
  }

  public connect() {
    this.mqttStatus = 'Connecting...';
    // this.mqttClient = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, '/mqtt', this.clientId);
    this.mqttClient = new Paho.MQTT.Client('barretts.ecs.vuw.ac.nz', 8883, '/mqtt', this.clientId);

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
    // console.log('A' + message);

    let messageArray = message.split(',');



    let currentTimestamp:Number = Date.parse(messageArray[0]);
    let sensorLocation:string = messageArray[1];
    let motionStatus = messageArray[2];
    let batteryStatus = messageArray[3];

    // console.log('Location: ' + sensorLocation + ' motionStatus: ' + motionStatus);

    // console.log(motionStatus == '1');
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

    // TODO track number of movements
    // using noMovements

    // TODO
    // using currentLocation
    // this.location = sensorLocation;

    // TODO time since last motion
    // return messageArray;
  }


  public getData(){
    // console.log("DATA" + this.message);

    return this.message;
  }

  public getBatteryLevel(){
    return this.currentBatteryLevel;
  }

  // Gets the last seen location of the patient
  public lastSeenLocation(){
    return this.location;
  }

  public movements() {
    return this.noMovements;
  }
}
